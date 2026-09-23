import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Socket } from 'node:net';
import { request } from 'node:http';
import { createServer as httpServer } from 'node:http';
import { startQaNetworkGuard } from '../plugins/just-vibe/scripts/lib/qa-network.mjs';

test('HTTPS tunnels require proxy authentication and the exact approved origin',async t=>{
  let connections=0;
  const upstream=createServer(socket=>{connections++;socket.on('data',data=>socket.write(data));});
  await new Promise(done=>upstream.listen(0,'127.0.0.1',done));
  let guard; t.after(async()=>{await guard?.close();await new Promise(done=>upstream.close(done));});
  const destination=`127.0.0.1:${upstream.address().port}`;
  guard=await startQaNetworkGuard(['https://'+destination]);
  const authorization='Basic '+Buffer.from(`${guard.proxy.username}:${guard.proxy.password}`).toString('base64');
  const connect=(path,auth)=>new Promise((done,fail)=>{
    const proxy=new URL(guard.proxy.server),req=request({hostname:proxy.hostname,port:proxy.port,method:'CONNECT',path,headers:auth?{'Proxy-Authorization':auth}:{}});
    req.on('error',fail);req.on('connect',(response,socket)=>done({response,socket}));req.end();
  });
  const denied=await connect(destination);assert.equal(denied.response.statusCode,407);denied.socket.destroy();assert.equal(connections,0);
  const different=await connect('localhost:'+upstream.address().port,authorization);assert.equal(different.response.statusCode,403);different.socket.destroy();assert.equal(connections,0);
  const allowed=await connect(destination,authorization);assert.equal(allowed.response.statusCode,200);
  const echo=new Promise(done=>allowed.socket.once('data',data=>done(data.toString())));allowed.socket.write('test tunnel');assert.equal(await echo,'test tunnel');allowed.socket.destroy();
  assert.equal(connections,1);assert.equal(guard.blocked.length,1);
  await guard.close();
});

test('network restrictions remain observable after the bounded detail log fills', async t => {
  const guard = await startQaNetworkGuard([]); t.after(() => guard.close());
  const proxy = new URL(guard.proxy.server);
  const deny = () => new Promise((done, fail) => {
    const req = request({ hostname: proxy.hostname, port: proxy.port, path: 'http://unapproved.invalid/', headers: { 'proxy-authorization': 'Basic ' + Buffer.from(guard.proxy.username + ':' + guard.proxy.password).toString('base64') } }, res => {
      res.resume(); res.on('end', () => done(res.statusCode));
    });
    req.on('error', fail); req.end();
  });
  for (let i = 0; i < 200; i++) assert.equal(await deny(), 403);
  const before = guard.blockedCount;
  assert.equal(await deny(), 403);
  assert.equal(guard.blocked.length, 200);
  assert.equal(guard.blockedCount, before + 1);
});

test('an aborted upstream response closes the downstream connection instead of hanging', async t => {
  const upstream = httpServer((_req, res) => { res.writeHead(200, { 'content-length': '100' }); res.write('short'); setTimeout(() => res.destroy(), 20); });
  await new Promise(done => upstream.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${upstream.address().port}`, guard = await startQaNetworkGuard([origin]);
  t.after(async () => { await guard.close(); await new Promise(done => upstream.close(done)); });
  const proxy = new URL(guard.proxy.server);
  const result = await new Promise(done => {
    const req = request({ hostname: proxy.hostname, port: proxy.port, path: origin + '/', timeout: 2000, headers: { 'proxy-authorization': 'Basic ' + Buffer.from(guard.proxy.username + ':' + guard.proxy.password).toString('base64') } }, res => {
      res.resume(); res.on('end', () => done('complete')); res.on('error', () => done('aborted'));
    });
    req.on('timeout', () => { done('timed-out'); req.destroy(); }); req.on('error', () => done('aborted')); req.end();
  });
  assert.equal(result, 'aborted');
});

test('an idle HTTPS tunnel timeout closes its browser connection', async t => {
  const upstream = createServer(() => {});
  await new Promise(done => upstream.listen(0, '127.0.0.1', done));
  const origin = `https://127.0.0.1:${upstream.address().port}`, guard = await startQaNetworkGuard([origin]);
  t.after(async () => { await guard.close(); await new Promise(done => upstream.close(done)); });
  // Exercise the real idle-timeout path without adding 15 seconds to every run.
  const original = Socket.prototype.setTimeout;
  Socket.prototype.setTimeout = function(ms, callback) { return original.call(this, ms === 15000 ? 50 : ms, callback); };
  t.after(() => { Socket.prototype.setTimeout = original; });
  const proxy = new URL(guard.proxy.server);
  const socket = await new Promise((done, fail) => {
    const req = request({ hostname: proxy.hostname, port: proxy.port, method: 'CONNECT', path: new URL(origin).host, headers: { 'proxy-authorization': 'Basic ' + Buffer.from(guard.proxy.username + ':' + guard.proxy.password).toString('base64') } });
    req.on('error', fail); req.on('connect', (_res, socket) => done(socket)); req.end();
  });
  t.after(() => socket.destroy());
  const result = await new Promise(done => {
    const timer = setTimeout(() => done('hung'), 1000);
    socket.resume(); socket.on('close', () => { clearTimeout(timer); done('closed'); });
  });
  assert.equal(result, 'closed');
});
