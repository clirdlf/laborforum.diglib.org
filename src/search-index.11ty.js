import {plainText} from '../scripts/lib/content.mjs';
export default class {
 data(){return {permalink:'/search-index.json',eleventyExcludeFromCollections:true};}
 render({archive}){return JSON.stringify([...archive.pages,...archive.posts].map(r=>({title:r.title,url:r.url,text:plainText(r.html)})));}
}
