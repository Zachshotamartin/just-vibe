import importlib.util
import io
import json
import unittest
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'plugins/just-vibe/scripts/python/just_vibe_llm.py'
spec = importlib.util.spec_from_file_location('jv_host', path)
host = importlib.util.module_from_spec(spec)
spec.loader.exec_module(host)

class ProviderContracts(unittest.TestCase):
    def test_requests_have_provider_native_shapes(self):
        messages = [{'role': 'user', 'content': 'fixture'}]
        tool = {'name': 'run_fixture', 'description': 'Local check', 'parameters': {'type':'object','properties':{},'additionalProperties':False}}
        for provider in ('openai', 'anthropic', 'ollama'):
            request = host.build_request(provider, 'explicit-model', messages, [tool], 12, False)
            self.assertEqual(request['model'], 'explicit-model')
            self.assertFalse(request['stream'])
            self.assertEqual(len(request['tools']), 1)
        self.assertFalse(host.build_request('openai', 'model', messages, [], 12, False)['store'])
    def test_visible_output_never_emits_reasoning(self):
        text, calls = host.visible('openai', {'output':[{'type':'reasoning','summary':[{'text':'hidden'}]},{'type':'message','content':[{'type':'output_text','text':'visible'}]},{'type':'function_call','call_id':'c1','name':'run_fixture','arguments':'{}'}]})
        self.assertEqual(text, 'visible')
        self.assertEqual(calls[0]['arguments'], {})
        text, _ = host.visible('anthropic', {'content':[{'type':'thinking','thinking':'hidden'},{'type':'text','text':'visible'}]})
        self.assertEqual(text, 'visible')
    def test_streams_require_completion_and_handle_errors(self):
        stream = io.BytesIO(b'data: {"type":"response.output_text.delta","delta":"hello"}\n\ndata: {"type":"response.completed"}\n\n')
        self.assertEqual(''.join(host.stream_text('openai', stream)), 'hello')
        with self.assertRaisesRegex(ValueError, 'completion'):
            list(host.stream_text('openai', io.BytesIO(b'data: {"type":"response.output_text.delta","delta":"partial"}\n')))
        with self.assertRaisesRegex(ValueError, 'streaming error'):
            list(host.stream_text('anthropic', io.BytesIO(b'data: {"type":"error","error":{}}\n')))
        stream=io.BytesIO(b'{"message":{"content":"answer","thinking":"hidden"},"done":true}\n')
        self.assertEqual(''.join(host.stream_text('ollama',stream)),'answer')
    def test_endpoint_rejects_credentials_and_insecure_remote(self):
        for url in ('http://remote.test/chat','https://user:pass@example.test/chat','https://example.test/chat?key=secret'):
            with self.assertRaises(ValueError): host.endpoint('openai',url)
        self.assertEqual(host.endpoint('ollama','http://127.0.0.1:11223/api/chat'),'http://127.0.0.1:11223/api/chat')

    def test_bounded_stream_and_incomplete_finish(self):
        with self.assertRaisesRegex(ValueError, 'bound'):
            list(host.stream_text('ollama', io.BytesIO(b'x' * (host.MAX_BYTES + 1))))
        with self.assertRaisesRegex(ValueError, 'incomplete'):
            list(host.stream_text('anthropic', io.BytesIO(b'data: {"type":"message_delta","delta":{"stop_reason":"max_tokens"}}\n')))
    def test_local_http_provider_and_unauthorized_tool(self):
        import contextlib
        import threading
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
        from unittest.mock import patch
        reply = {'message': {'content': 'visible fixture', 'thinking': 'hidden fixture'}, 'done': True}
        requests = []
        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                requests.append(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
                body = json.dumps(reply).encode()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            def log_message(self, *args): pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            args = ['--provider','ollama','--model','fixture-model','--endpoint',f'http://127.0.0.1:{server.server_port}/api/chat']
            output = io.StringIO()
            with patch('sys.stdin', io.StringIO('fixture prompt')), contextlib.redirect_stdout(output):
                self.assertEqual(host.main(args), 0)
            self.assertEqual(output.getvalue(), 'visible fixture\n')
            self.assertEqual(requests[0]['messages'][0]['content'], 'fixture prompt')
            reply['message'] = {'tool_calls':[{'function':{'name':'unapproved','arguments':{}}}]}
            with patch('sys.stdin', io.StringIO('fixture prompt')), self.assertRaisesRegex(ValueError, 'unauthorized'):
                host.main(args)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)
    def test_cpu_ranking_and_temporal_cold_start(self):
        path = Path(__file__).resolve().parents[1] / 'plugins/just-vibe/examples/ml/ranking.py'
        spec = importlib.util.spec_from_file_location('ranking', path)
        ranking = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ranking)
        self.assertEqual(ranking.ndcg_at_k([3, 2, 1, 0], 3), 1.0)
        self.assertEqual(ranking.ndcg_at_k([0, 0], 2), 0.0)
        self.assertLess(ranking.ndcg_at_k([0, 1, 2, 3], 3), 0.5)
        with self.assertRaises(ValueError): ranking.ndcg_at_k([float('nan')], 1)
        rows = [{'entity':'seen','time':1},{'entity':'seen','time':3},{'entity':'new','time':3}]
        train, test, excluded = ranking.temporal_entities(rows, 2)
        self.assertTrue(set(r['entity'] for r in train).isdisjoint(r['entity'] for r in test))
        self.assertEqual(excluded, [rows[1]])

if __name__ == '__main__': unittest.main()
