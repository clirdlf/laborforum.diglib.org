const root=document.documentElement;
root.classList.remove('no-js');
const menuButton=document.querySelector('#menu-toggle'),menu=document.querySelector('#site-header-menu');
function setMenu(open){menu.classList.toggle('toggled-on',open);menuButton.classList.toggle('toggled-on',open);menuButton.setAttribute('aria-expanded',String(open));}
setMenu(false);
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menuButton.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
// Retain old WordPress search bookmarks without any server endpoint.
if(location.pathname==='/' && new URL(location.href).searchParams.has('s')){const query=new URL(location.href).searchParams.get('s');location.replace('/search/?q='+encodeURIComponent(query));}
