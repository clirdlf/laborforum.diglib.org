import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const load=()=>import('../scripts/lib/assets.mjs');
test('maps encoded upload names safely and separates external paths',async()=>{
 const {localAssetPath}=await load();
 assert.equal(localAssetPath('https://laborforum.diglib.org/wp-content/uploads/A%20B.pdf'),'/wp-content/uploads/A B.pdf');
 assert.equal(localAssetPath('https://laborforum.diglib.org/wp-content/uploads/A%20B.pdf?ver=1'),'/wp-content/uploads/A B.pdf');
 assert.notEqual(localAssetPath('https://one.example/a/logo.png'),localAssetPath('https://one.example/b/logo.png'));
 assert.notEqual(localAssetPath('https://one.example/a/logo.png'),localAssetPath('https://two.example/a/logo.png'));
 assert.throws(()=>localAssetPath('https://laborforum.diglib.org/wp-content/uploads/%2e%2e%2fsecret'));
});
test('downloads duplicates once and records missing resources',async()=>{
 const {downloadAssets}=await load(); const root=await mkdtemp(join(tmpdir(),'archive-assets-'));
 const {createServer}=await import('node:http');let hits=0;
 const server=createServer((req,res)=>{hits++;if(req.url==='/missing.pdf'){res.writeHead(404);res.end();}else{res.setHeader('content-type','image/png');res.end('image-bytes');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try {const manifest=await downloadAssets([{url:base+'/ok.png',referencedBy:'/'},{url:base+'/ok.png',referencedBy:'/about/'},{url:base+'/missing.pdf',referencedBy:'/'}],root);
 assert.equal(hits,2);assert.equal(manifest.length,2);assert.equal(manifest.find(m=>m.sourceUrl.endsWith('/missing.pdf')).status,'unavailable');
 const ok=manifest.find(m=>m.status==='downloaded');assert.equal((await readFile(join(root,ok.localPath))).toString(),'image-bytes'); assert.deepEqual(ok.referencedBy,['/','/about/']);
 }finally{server.close();}
});
