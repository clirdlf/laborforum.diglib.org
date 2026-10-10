const root=document.documentElement;
root.classList.remove('no-js');
const menuButton=document.querySelector('#menu-toggle'),menu=document.querySelector('#site-header-menu');
function setMenu(open){menu.classList.toggle('toggled-on',open);menuButton.classList.toggle('toggled-on',open);menuButton.setAttribute('aria-expanded',String(open));}
setMenu(false);
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
const toggle=document.querySelector('.accessibility-toggle'),panel=document.querySelector('#accessibility-panel');
function setPanel(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close accessibility toolbar':'Open accessibility toolbar');}
toggle.addEventListener('click',()=>setPanel(panel.hidden));
const flags=['grayscale','high-contrast','negative-contrast','light-background','underline','readable'];
const schemas=flags.slice(0,4);let scale=16;
function reset(){for(const flag of flags)root.classList.remove('a11y-'+flag);root.style.removeProperty('font-size');scale=16;}
function updateButtons(){for(const b of panel.querySelectorAll('[data-accessibility]')){const action=b.dataset.accessibility;if(flags.includes(action))b.setAttribute('aria-pressed',String(root.classList.contains('a11y-'+action)));}}
for(const button of panel.querySelectorAll('[data-accessibility]'))button.addEventListener('click',()=>{
 const action=button.dataset.accessibility;
 if(action==='reset')reset();
 else if(action==='increase'||action==='decrease'){scale=Math.max(14,Math.min(24,scale+(action==='increase'?2:-2)));root.style.fontSize=scale+'px';}
 else {const on=!root.classList.contains('a11y-'+action);if(schemas.includes(action))for(const s of schemas)root.classList.remove('a11y-'+s);root.classList.toggle('a11y-'+action,on);}
 updateButtons();
});updateButtons();
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!panel.hidden){setPanel(false);toggle.focus();}else if(menuButton.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
// Retain old WordPress search bookmarks without any server endpoint.
if(location.pathname==='/' && new URL(location.href).searchParams.has('s')){const query=new URL(location.href).searchParams.get('s');location.replace('/search/?q='+encodeURIComponent(query));}
