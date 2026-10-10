import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {load} from 'cheerio';
const a=JSON.parse(readFileSync('src/_data/archive.json'));const records=[...a.pages,...a.posts];
const read=url=>readFileSync('_site'+(url.endsWith('/')?url+'index.html':url),'utf8');
test('all published source routes render their titles and archival content',()=>{
 for(const r of records){assert.ok(existsSync('_site'+r.url+'index.html'),r.url);const $=load(read(r.url));if(r.url==='/posts/'){assert.equal($('.post.type-post').length,8);}else{assert.equal($('h1.entry-title').text(),r.title);assert.ok($('.entry-content').text().length>20);}}
});
test('preserves categories, author listings and source navigation links',()=>{
 for(const url of ['/category/attendee-post/','/category/logistics/','/author/participant/','/author/ruthtillman/'])assert.ok(existsSync('_site'+url+'index.html'),url);
 const $=load(read('/'));assert.deepEqual($('#site-navigation a').map((_,e)=>$(e).attr('href')).get(),['/about/','/white-paper/','/handbook/','/project-team/','/posts/','/forum-1/','/forum-2/','/search/']);
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
 const {parseWordPress}=await import('../scripts/lib/wordpress.mjs');const src=parseWordPress(readFileSync(existsSync('data/collectiveresponsibility.WordPress.2026-10-10.xml')?'data/collectiveresponsibility.WordPress.2026-10-10.xml':'migration/published-source.xml','utf8'));
 const norm=s=>load(s).text().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,'...').replace(/\s+/g,'').trim();
 for(const r of [...src.pages,...src.posts].filter(r=>r.url!=='/posts/')){const text=norm(load(read(r.url))('.entry-content').html());assert.ok(text.startsWith(norm(r.html)),r.url);assert.equal(read(r.url).includes('data-cfemail'),false);}
});
test('archive status and search remain available in the primary navigation',()=>{
 const $=load(read('/'));assert.ok($('#site-navigation a[href="/search/"]').length);assert.ok($('.archive-banner').text().includes('historical'));
});
test('team headings form sections and post summaries have one descriptive continuation link',()=>{
 const team=load(read('/project-team/'));assert.equal(team('.entry-content h5').length,0);assert.equal(team('.entry-content h2').length,5);
 const $=load(read('/posts/'));$('.post.type-post').each((_,el)=>{assert.equal($(el).find('.entry-content a').length,1);assert.ok($(el).find('.entry-content a').text().includes($(el).find('.entry-title').text()));});
});
test('archived lists have valid list children and post section headings do not skip levels',()=>{
 for(const r of a.posts){const $=load(read(r.url));$('.entry-content ol,.entry-content ul').each((_,e)=>{assert.equal($(e).children().not('li,script,template').length,0,r.url);});}
 const url='/2018/10/25/seeking-funded-participants-for-collective-responsibility/';assert.equal(load(read(url))('.entry-content h3').length,0);
});
