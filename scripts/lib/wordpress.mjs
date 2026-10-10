import { XMLParser } from 'fast-xml-parser';
const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
const text = value => typeof value === 'object' ? value?.['#text'] ?? '' : value ?? '';
const pathname = value => new URL(value, 'https://laborforum.diglib.org').pathname;
export function parseWordPress(xml) {
 const sanitized = xml.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
 const channel = new XMLParser({ignoreAttributes:false, parseTagValue:false, trimValues:false}).parse(sanitized).rss.channel;
 const items=array(channel.item); const pages=[], posts=[], attachments=[], navigation=[];
 for (const i of items) {
  const type=text(i['wp:post_type']), status=text(i['wp:status']);
  if(type==='attachment') {
   attachments.push({id:text(i['wp:post_id']),title:text(i.title),url:text(i['wp:attachment_url'])}); continue;
  }
  if(type==='nav_menu_item' && status==='publish') {
   const meta=Object.fromEntries(array(i['wp:postmeta']).map(m=>[text(m['wp:meta_key']),text(m['wp:meta_value'])]));
   navigation.push({id:text(i['wp:post_id']),title:text(i.title),order:Number(text(i['wp:menu_order'])),targetId:meta._menu_item_object_id,url:meta._menu_item_url || ''}); continue;
  }
  if(!['page','post'].includes(type) || status!=='publish') continue;
  const categories=array(i.category).filter(c=>c['@_domain']==='category').map(c=>({name:text(c),slug:c['@_nicename']}));
  const tags=array(i.category).filter(c=>c['@_domain']==='post_tag').map(c=>({name:text(c),slug:c['@_nicename']}));
  const comments=array(i['wp:comment']).filter(c=>text(c['wp:comment_approved'])==='1').map(c=>({id:text(c['wp:comment_id']),parentId:text(c['wp:comment_parent']),author:text(c['wp:comment_author']),date:text(c['wp:comment_date']),html:text(c['wp:comment_content'])}));
  const record={id:text(i['wp:post_id']),type,title:text(i.title),url:pathname(text(i.link)),date:text(i['wp:post_date']),author:text(i['dc:creator']),html:text(i['content:encoded']),excerpt:text(i['excerpt:encoded']),categories,tags,comments};
  (type==='page'?pages:posts).push(record);
 }
 const records=[...pages,...posts];
 for(const nav of navigation) {const target=records.find(r=>r.id===nav.targetId); if(target){nav.url=target.url;nav.title ||= target.title;}}
 navigation.sort((a,b)=>a.order-b.order);
 const taxonomies={categories:array(channel['wp:category']).map(c=>({id:text(c['wp:term_id']),slug:text(c['wp:category_nicename']),name:text(c['wp:cat_name'])})),tags:array(channel['wp:tag']).map(c=>({id:text(c['wp:term_id']),slug:text(c['wp:tag_slug']),name:text(c['wp:tag_name'])}))};
 return {title:text(channel.title),description:text(channel.description),pages,posts:posts.sort((a,b)=>b.date.localeCompare(a.date)),navigation,attachments,taxonomies};
}
