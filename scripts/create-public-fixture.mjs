import {readFile,writeFile} from 'node:fs/promises';import {XMLParser,XMLBuilder} from 'fast-xml-parser';import {createHash} from 'node:crypto';
const inventory=JSON.parse(await readFile('migration/source-inventory.json'));
const xml=await readFile(inventory.source,'utf8');
const parsed=new XMLParser({ignoreAttributes:false,parseTagValue:false,trimValues:true,cdataPropName:'__cdata'}).parse(xml.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,''));
const array=v=>v==null?[]:Array.isArray(v)?v:[v];const text=v=>typeof v==='object'?v?.__cdata||v?.['#text']||'':v;
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>o[k]!==undefined).map(k=>[k,o[k]]));
const channel=pick(parsed.rss.channel,['title','link','description','wp:wxr_version','wp:base_site_url','wp:base_blog_url','wp:category','wp:tag']);
channel.item=array(parsed.rss.channel.item).filter(i=>['page','post','nav_menu_item'].includes(text(i['wp:post_type']))&&text(i['wp:status'])==='publish'||text(i['wp:post_type'])==='attachment').map(i=>{
 const out=pick(i,['title','link','dc:creator','content:encoded','excerpt:encoded','category','wp:post_id','wp:post_date','wp:post_type','wp:status','wp:menu_order','wp:attachment_url']);
 out['wp:comment']=array(i['wp:comment']).filter(c=>text(c['wp:comment_approved'])==='1').map(c=>pick(c,['wp:comment_id','wp:comment_parent','wp:comment_approved','wp:comment_author','wp:comment_content','wp:comment_date','wp:comment_type']));
 if(text(i['wp:post_type'])==='nav_menu_item')out['wp:postmeta']=array(i['wp:postmeta']).filter(m=>['_menu_item_object_id','_menu_item_url'].includes(text(m['wp:meta_key'])));
 return out;
});
const fixture=new XMLBuilder({ignoreAttributes:false,cdataPropName:'__cdata',format:false}).build({rss:{...pick(parsed.rss,Object.keys(parsed.rss).filter(k=>k.startsWith('@_'))),channel}});
inventory.publicFixture='migration/published-source.xml';inventory.publicFixtureSha256=createHash('sha256').update(fixture).digest('hex');
await writeFile(inventory.publicFixture,fixture);await writeFile('migration/source-inventory.json',JSON.stringify(inventory,null,2)+'\n');
console.log('Created public fixture without private author fields, unapproved comments, or plugin metadata.');
