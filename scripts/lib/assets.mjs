import {createHash} from 'node:crypto';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
export function localAssetPath(sourceUrl) {
 const u=new URL(sourceUrl); const decoded=decodeURIComponent(u.pathname);
 if(decoded.includes('\\') || decoded.split('/').some(s=>s==='..'||s==='.') || decoded.includes('\0')) throw new Error('Unsafe asset path');
 if(u.hostname==='laborforum.diglib.org' && decoded.startsWith('/wp-content/')) return decoded;
 const name=decoded.split('/').pop()?.replace(/[^\p{L}\p{N}._-]/gu,'-')||'asset';
 const key=createHash('sha256').update(u.origin+u.pathname+u.search).digest('hex').slice(0,16);
 return `/assets/vendor/${key}-${name}`;
}
export async function downloadAssets(refs,root) {
 const grouped=new Map();
 for(const ref of refs) {const u=new URL(ref.url); u.hash=''; const key=u.href;const item=grouped.get(key)||{sourceUrl:key,localPath:localAssetPath(key),referencedBy:[]};if(!item.referencedBy.includes(ref.referencedBy))item.referencedBy.push(ref.referencedBy);grouped.set(key,item);}
 const manifest=[];
 for(const item of grouped.values()) {
  const target=resolve(root,'.'+item.localPath);
  try {
   if((await stat(target).catch(()=>null))?.size>0){item.status='existing';}
   else {const response=await fetch(item.sourceUrl,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const type=response.headers.get('content-type')||'';if(type.includes('text/html')&&!item.localPath.endsWith('.html'))throw new Error('Unexpected HTML response for asset');const bytes=Buffer.from(await response.arrayBuffer());await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);item.status='downloaded';item.bytes=bytes.length;item.contentType=type;}
  }catch(error){item.status='unavailable';item.error=error.message;}
  manifest.push(item);
 }
 return manifest;
}
