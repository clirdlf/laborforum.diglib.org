import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {load} from 'cheerio';
const a=JSON.parse(readFileSync('src/_data/archive.json'));const records=[...a.pages,...a.posts];
const read=url=>readFileSync('_site'+(url.endsWith('/')?url+'index.html':url),'utf8');
test('all published source routes render their titles and archival content',()=>{
 for(const r of records){assert.ok(existsSync('_site'+r.url+'index.html'),r.url);const $=load(read(r.url));if(r.url==='/posts/'){assert.equal($('.post.type-post').length,8);}else{assert.equal($('h1.entry-title').text(),r.title);assert.ok($('.entry-content').text().length>20);}}
});
test('preserves categories, author listings and source navigation links',()=>{
 for(const url of ['/category/attendee-post/','/category/logistics/','/author/participant/','/author/ruthtillman/'])assert.ok(existsSync('_site'+url+'index.html'),url);
 const $=load(read('/'));assert.deepEqual($('#site-navigation a').map((_,e)=>$(e).attr('href')).get(),['/about/','/white-paper/','/handbook/','/project-team/','/posts/','/forum-1/','/forum-2/']);
});
test('approved discussion is read-only and rejected comments are excluded',()=>{
 let comments=0;for(const r of records){const $=load(read(r.url));comments+=$('.comment-body').length;assert.equal($('form:not([role="search"])').length,0);for(const c of r.comments)assert.ok($(`#comment-${c.id}`).length);}
 assert.equal(comments,1);
});
test('contact carries inactive-form notice and source downloads are local',()=>{
 assert.ok(load(read('/contact/')).text().includes('This contact form is no longer active.'));
 for(const url of ['/white-paper/','/handbook/']){const $=load(read(url));const pdf=$('.entry-content a').filter((_,e)=>/\.pdf$/.test($(e).attr('href'))).first().attr('href');assert.ok(pdf.startsWith('/'));assert.ok(existsSync('_site'+decodeURI(pdf)));}
 assert.ok(existsSync('_site/404.html'));
});
test('rendered recovery retains export body text including Cloudflare-protected emails',async()=>{
 const {parseWordPress}=await import('../scripts/lib/wordpress.mjs');const src=parseWordPress(readFileSync('data/collectiveresponsibility.WordPress.2026-10-10.xml','utf8'));
 const norm=s=>load(s).text().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,'...').replace(/\s+/g,'').trim();
 for(const r of [...src.pages,...src.posts].filter(r=>r.url!=='/posts/')){const text=norm(load(read(r.url))('.entry-content').html());assert.ok(text.startsWith(norm(r.html)),r.url);assert.equal(read(r.url).includes('data-cfemail'),false);}
});
