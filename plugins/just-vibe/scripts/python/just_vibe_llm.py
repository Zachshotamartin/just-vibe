#!/usr/bin/env python3
"""Optional standard-library provider client. Separate API credentials; no host login reuse."""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

MAX_BYTES = 2 * 1024 * 1024

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Provider redirects are disabled; review the endpoint.')

def endpoint(provider, override=None):
    defaults = {'openai': 'https://api.openai.com/v1/responses',
                'anthropic': 'https://api.anthropic.com/v1/messages',
                'ollama': 'http://127.0.0.1:11434/api/chat'}
    url = urllib.parse.urlparse(override or defaults[provider])
    if url.username or url.password or url.query or url.fragment:
        raise ValueError('Provider URL must not contain credentials, query or fragment.')
    if url.scheme != 'https' and not (url.scheme == 'http' and url.hostname in ('localhost', '127.0.0.1', '::1')):
        raise ValueError('Use HTTPS or a loopback development endpoint.')
    return url.geturl()

def build_request(provider, model, messages, tools, max_tokens, stream):
    if provider == 'openai':
        return {'model': model, 'input': messages, 'tools': [dict(type='function', **t) for t in tools],
                'max_output_tokens': max_tokens, 'stream': stream, 'store': False}
    if provider == 'anthropic':
        return {'model': model, 'messages': messages,
                'tools': [{'name': t['name'], 'description': t['description'], 'input_schema': t['parameters']} for t in tools],
                'max_tokens': max_tokens, 'stream': stream}
    return {'model': model, 'messages': messages, 'tools': [{'type': 'function', 'function': t} for t in tools],
            'options': {'num_predict': max_tokens}, 'stream': stream}

def bounded_chunks(response, deadline=None):
    total = 0
    while True:
        if deadline is not None and time.monotonic() >= deadline:
            raise ValueError('Provider response deadline exceeded.')
        # read1 returns after one buffered/socket read, so a peer cannot keep
        # a newline-free response open indefinitely by slowly dripping bytes.
        chunk = response.read1(min(8192, MAX_BYTES - total + 1))
        if not chunk:
            return
        total += len(chunk)
        if total > MAX_BYTES:
            raise ValueError('Provider response exceeds output bound.')
        yield chunk

def bounded_lines(response, deadline=None):
    pending = b''
    for chunk in bounded_chunks(response, deadline):
        pending += chunk
        while b'\n' in pending:
            line, pending = pending.split(b'\n', 1)
            yield line
    if pending:
        yield pending

def stream_text(provider, response, deadline=None):
    """Visible text only; never emit thinking/reasoning or tool argument deltas."""
    ended = False
    for raw in bounded_lines(response, deadline):
        line = raw.decode('utf-8').strip()
        if not line or line.startswith(('event:', ':')):
            continue
        if provider != 'ollama':
            if not line.startswith('data:'):
                continue
            line = line[5:].strip()
            if line == '[DONE]':
                ended = True
                break
        item = json.loads(line)
        if item.get('error') or item.get('type') in ('error', 'response.failed'):
            raise ValueError('Provider reported a streaming error.')
        text = ''
        if provider == 'openai':
            if item.get('type') == 'response.output_text.delta':
                text = item.get('delta', '')
            if item.get('type') == 'response.completed':
                ended = True
            if item.get('type') == 'response.incomplete':
                raise ValueError('Provider output is incomplete.')
        elif provider == 'anthropic':
            delta = item.get('delta', {})
            if delta.get('stop_reason') in ('max_tokens', 'model_context_window_exceeded'):
                raise ValueError('Provider output is incomplete.')
            if delta.get('type') == 'text_delta':
                text = delta.get('text', '')
            if item.get('type') == 'message_stop':
                ended = True
        else:
            if item.get('done_reason') == 'length':
                raise ValueError('Provider output is incomplete.')
            text = item.get('message', {}).get('content', '')
            ended = ended or item.get('done') is True
        if text:
            yield text
    if not ended:
        raise ValueError('Provider stream ended without a completion event.')

def visible(provider, data):
    if provider == 'openai':
        text = ''.join(c.get('text', '') for o in data.get('output', []) if o.get('type') == 'message'
                       for c in o.get('content', []) if c.get('type') == 'output_text')
        calls = [{'id': o.get('call_id'), 'name': o.get('name'), 'arguments': json.loads(o.get('arguments', '{}'))}
                 for o in data.get('output', []) if o.get('type') == 'function_call']
        return text, calls
    if provider == 'anthropic':
        text = ''.join(c.get('text', '') for c in data.get('content', []) if c.get('type') == 'text')
        calls = [{'id': c.get('id'), 'name': c.get('name'), 'arguments': c.get('input')}
                 for c in data.get('content', []) if c.get('type') == 'tool_use']
        return text, calls
    message = data.get('message', {})
    return message.get('content', ''), [{'id': str(i), 'name': c.get('function', {}).get('name'),
        'arguments': c.get('function', {}).get('arguments')} for i, c in enumerate(message.get('tool_calls', []))]

def request(url, body, headers, timeout):
    encoded = json.dumps(body).encode('utf-8')
    if len(encoded) > MAX_BYTES:
        raise ValueError('Provider request exceeds input bound.')
    req = urllib.request.Request(url, encoded, {'Content-Type': 'application/json', **headers}, method='POST')
    # Local providers must stay local. System proxy discovery on macOS can also
    # block before the socket timeout starts, even for a loopback destination.
    handlers = [NoRedirect]
    if urllib.parse.urlparse(url).hostname in ('localhost', '127.0.0.1', '::1'):
        handlers.append(urllib.request.ProxyHandler({}))
    return urllib.request.build_opener(*handlers).open(req, timeout=timeout)

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--provider', choices=['openai', 'anthropic', 'ollama'], required=True)
    parser.add_argument('--model', required=True)
    parser.add_argument('--endpoint')
    parser.add_argument('--root', type=Path, default=Path.cwd())
    parser.add_argument('--stream', action='store_true')
    parser.add_argument('--tools', type=Path, help='Explicit JSON allowlist of fixed trusted runner IDs/hashes')
    parser.add_argument('--allow-tools', action='store_true')
    parser.add_argument('--node', default='node')
    parser.add_argument('--rounds', type=int, default=3)
    parser.add_argument('--max-tokens', type=int, default=2048)
    parser.add_argument('--timeout', type=int, default=60)
    args = parser.parse_args(argv)
    if not 1 <= args.rounds <= 5 or not 1 <= args.max_tokens <= 32768 or not 1 <= args.timeout <= 120:
        raise ValueError('Use 1–5 rounds, 1–32768 output tokens and 1–120 seconds per request.')
    if args.stream and args.tools:
        raise ValueError('Streaming is text-only; use non-streaming mode for explicit runner tools.')
    prompt = sys.stdin.read(128 * 1024 + 1)
    if not prompt.strip() or len(prompt) > 128 * 1024:
        raise ValueError('Provide a nonempty prompt of at most 128 KiB on stdin.')
    url = endpoint(args.provider, args.endpoint)
    key_name = {'openai': 'OPENAI_API_KEY', 'anthropic': 'ANTHROPIC_API_KEY'}.get(args.provider)
    key = os.environ.get(key_name, '') if key_name else ''
    if key_name and not key:
        raise ValueError('Set the provider API key in its documented environment variable. Host OAuth is not reused.')
    headers = {'Authorization': 'Bearer ' + key} if args.provider == 'openai' else ({'x-api-key': key, 'anthropic-version': '2023-06-01'} if args.provider == 'anthropic' else {})
    allowed = {}
    if args.tools:
        if not args.allow_tools:
            raise ValueError('Tool execution requires --allow-tools in addition to a reviewed allowlist.')
        if args.tools.stat().st_size > 32768:
            raise ValueError('Tool allowlist too large.')
        for tool in json.loads(args.tools.read_text()):
            if set(tool) != {'id', 'hash', 'description'} or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', tool['id']) or not re.fullmatch(r'[a-f0-9]{64}', tool['hash']):
                raise ValueError('Invalid fixed-runner allowlist entry.')
            allowed['run_' + tool['id'].replace('-', '_')] = tool
        if len(allowed) > 10:
            raise ValueError('At most ten runner tools.')
    tools = [{'name': name, 'description': tool['description'], 'parameters': {'type': 'object', 'properties': {}, 'additionalProperties': False}}
             for name, tool in allowed.items()]
    messages = [{'role': 'user', 'content': prompt}]
    executed = set()
    cli = Path(__file__).resolve().parents[1] / 'toolkit.mjs'
    for _ in range(args.rounds):
        body = build_request(args.provider, args.model, messages, tools, args.max_tokens, args.stream)
        deadline = time.monotonic() + args.timeout
        with request(url, body, headers, args.timeout) as response:
            if args.stream:
                for text in stream_text(args.provider, response, deadline):
                    print(text, end='', flush=True)
                print()
                return 0
            raw = b''.join(bounded_chunks(response, deadline))
            data = json.loads(raw)
        if data.get('error') or data.get('status') in ('failed', 'incomplete') or data.get('stop_reason') in ('max_tokens', 'model_context_window_exceeded') or data.get('done_reason') == 'length' or data.get('done') is False:
            raise ValueError('Provider response failed or is incomplete.')
        text, calls = visible(args.provider, data)
        if text:
            print(text, flush=True)
        if not calls:
            return 0
        if len(calls) > 10:
            raise ValueError('Provider requested too many tools.')
        results = []
        for call in calls:
            name = call['name']
            if name not in allowed or call['arguments'] != {}:
                raise ValueError('Provider requested an unauthorized tool or arguments.')
            if name in executed:
                result = {'error': 'Runner already dispatched in this invocation; reconcile effects before another run.'}
            else:
                executed.add(name)
                tool = allowed[name]
                completed = subprocess.run([args.node, str(cli), 'runners', 'run', '--root', str(args.root.resolve()), '--stdin'],
                    input=json.dumps({'id': tool['id'], 'hash': tool['hash']}), text=True, capture_output=True, timeout=125, check=False)
                result = {'exitCode': completed.returncode, 'stdout': completed.stdout[:16000], 'stderr': completed.stderr[:2000]}
            results.append((call, json.dumps(result)))
        if args.provider == 'openai':
            messages.extend(data.get('output', []))
            messages.extend({'type': 'function_call_output', 'call_id': call['id'], 'output': result} for call, result in results)
        elif args.provider == 'anthropic':
            messages.append({'role': 'assistant', 'content': data.get('content', [])})
            messages.append({'role': 'user', 'content': [{'type': 'tool_result', 'tool_use_id': call['id'], 'content': result} for call, result in results]})
        else:
            messages.append(data['message'])
            messages.extend({'role': 'tool', 'tool_name': call['name'], 'content': result} for call, result in results)
    raise ValueError('Tool round limit reached; no completed answer is implied.')

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print('Cancelled.', file=sys.stderr)
        sys.exit(130)
    except (ValueError, OSError, urllib.error.URLError, subprocess.TimeoutExpired) as error:
        # Provider bodies and credential-bearing request objects are never logged.
        print('Provider host failed: ' + (str(error) if isinstance(error, ValueError) else type(error).__name__), file=sys.stderr)
        sys.exit(1)
