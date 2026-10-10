import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseWordPress} from './lib/wordpress.mjs';
const source='data/collectiveresponsibility.WordPress.2026-10-10.xml';
const xml=await readFile(source,'utf8'); const archive=parseWordPress(xml);
await mkdir('src/_data',{recursive:true}); await mkdir('migration',{recursive:true});
await writeFile('src/_data/archive.json',JSON.stringify(archive,null,2)+'\n');
await writeFile('migration/source-inventory.json',JSON.stringify({source,sha256:createHash('sha256').update(xml).digest('hex'),publishedPages:archive.pages.length,publishedPosts:archive.posts.length,approvedComments:[...archive.pages,...archive.posts].flatMap(r=>r.comments).length,routes:[...archive.pages,...archive.posts].map(r=>({id:r.id,url:r.url,title:r.title})),shortcodes:[...archive.pages,...archive.posts].flatMap(r=>(r.html.match(/\[(?:contact-form-7|caption|gallery|embed)[^\]]*\]/g)||[]).map(shortcode=>({url:r.url,shortcode})))},null,2)+'\n');
console.log(`Imported ${archive.pages.length} pages, ${archive.posts.length} posts, ${archive.attachments.length} attachments.`);
