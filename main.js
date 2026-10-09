/* Shared interactions: safe to remove without losing page content. */
'use strict';
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(){navigation?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open menu');}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';navigation.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();toggle?.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('header'))closeMenu();});
navigation?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches && 'IntersectionObserver' in window){
 document.documentElement.classList.add('motion');
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:0.06});
 document.querySelectorAll('.reveal').forEach((element,index)=>{element.style.setProperty('--delay',`${index%3*70}ms`);observer.observe(element);});
}
if(!reducedMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
 document.body.classList.add('cursor-enabled');
 const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');
 let x=-100,y=-100,rx=-100,ry=-100,frame;
 document.addEventListener('pointermove',event=>{x=event.clientX;y=event.clientY;dot.style.left=x+'px';dot.style.top=y+'px';ring.classList.toggle('active',Boolean(event.target.closest('a,button,.project-card')));if(!frame)frame=requestAnimationFrame(track);});
 function track(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.left=rx+'px';ring.style.top=ry+'px';frame=(Math.abs(x-rx)+Math.abs(y-ry)>0.3)?requestAnimationFrame(track):null;}
 document.addEventListener('pointerleave',()=>{x=y=-100;dot.style.left=dot.style.top='-100px';ring.style.left=ring.style.top='-100px';});
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){document.body.classList.remove('cursor-enabled');if(frame)cancelAnimationFrame(frame);}});
}
const form=document.querySelector('#contact-form');
form?.addEventListener('submit',event=>{
 event.preventDefault();
 const name=form.elements.name,message=form.elements.message;
 name.setCustomValidity(name.value.trim()?'':'Please enter your name.');
 message.setCustomValidity(message.value.trim()?'':'Please enter a message.');
 if(!form.reportValidity())return;
 // Connect a real endpoint here before claiming that a message was sent.
 document.querySelector('#form-status').textContent='Thanks! Your message looks ready. This preview cannot send it yet; your text is still here to copy.';
});
form?.addEventListener('input',event=>{event.target.setCustomValidity?.('');document.querySelector('#form-status').textContent='';});
