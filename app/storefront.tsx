"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Gift, Heart, Menu, Minus, Plus, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import type { Product, SiteSettings } from "@/lib/defaults";

type Props = { initial: { settings: SiteSettings; products: Product[] } };

function ProductCard({product, onOpen}:{product:Product; onOpen:()=>void}) {
  const [slide, setSlide] = useState(0);
  const images = product.images.length ? product.images : ["/hero-cookies.png"];
  return <article className="product-card">
    <div className="product-image">
      <Image src={images[slide]} alt={product.title} fill sizes="(max-width: 768px) 90vw, 33vw" />
      {product.badge && <span className="badge">{product.badge}</span>}
      {images.length > 1 && <><button className="slide prev" aria-label="Предишна снимка" onClick={()=>setSlide((slide-1+images.length)%images.length)}><ChevronLeft/></button><button className="slide next" aria-label="Следваща снимка" onClick={()=>setSlide((slide+1)%images.length)}><ChevronRight/></button></>}
    </div>
    <div className="product-copy"><div className="product-meta"><span className="eyebrow">{product.category}</span><span className="min-order">Минимум 10 бр.</span></div><h3>{product.title}</h3><p>{product.description}</p><div className="price-row"><div><small>Цена от</small><strong>{product.price.toFixed(2)} лв.</strong></div><button onClick={onOpen}>Персонализирай <ArrowRight size={17}/></button></div></div>
  </article>
}

export default function Storefront({initial}:Props) {
  const {settings, products} = initial;
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("Всички");
  const [selected, setSelected] = useState<Product|null>(null);
  const filtered = category === "Всички" ? products : products.filter(p=>p.category===category);
  return <main style={{"--brand":settings.primaryColor} as React.CSSProperties}>
    <div className="announcement"><Sparkles size={15}/>{settings.announcement}</div>
    <header className="nav"><a href="#top" className="brand-logo"><Image src="/sweet-details-logo.jpeg" alt="Sweet Details" width={76} height={76} unoptimized/><span><strong>Sweet Details</strong><small>Персонализирани бисквитки</small></span></a><nav className={menu?"open":""}><a href="#products" onClick={()=>setMenu(false)}>Бисквитки</a><a href="#how" onClick={()=>setMenu(false)}>Как се поръчва</a><a href="#about" onClick={()=>setMenu(false)}>За нас</a><a href="#contact" onClick={()=>setMenu(false)}>Контакти</a></nav><a className="order-pill" href="#products">Поръчай</a><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Меню" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></header>
    <section id="top" className="hero">
      <div className="hero-copy"><span className="kicker"><Heart size={15} fill="currentColor"/> Създадени специално за теб</span><h1>{settings.headline}</h1><p>{settings.intro}</p><div className="hero-actions"><a href="#products" className="primary">Разгледай и поръчай <ArrowRight/></a><span><ShieldCheck/> Сигурно онлайн плащане</span></div><div className="order-notice"><strong>Планирай своя сладък детайл навреме</strong><span>Поръчките се приемат минимум 2 седмици преди желаната дата.</span></div><div className="mini-notes"><div><strong>100%</strong><small>ръчна изработка</small></div><div><strong>Твой</strong><small>дизайн и послание</small></div><div><strong>Нежно</strong><small>индивидуално опаковани</small></div></div></div>
      <div className="hero-visual"><Image src="/hero-cookies.png" alt="Персонализирани маслени бисквити с фонданов печат" fill priority sizes="(max-width: 900px) 100vw, 55vw"/><div className="float-note"><Gift/><div><strong>Подарък, който се помни</strong><small>и е твърде вкусен, за да остане</small></div></div></div>
    </section>
    <section id="products" className="section products"><span className="section-label">Нашите бисквитки</span><div className="section-head"><h2>Избери своя сладък момент</h2><p>Всеки дизайн може да бъде адаптиран към цветовете, темата и посланието на твоя повод.</p></div><div className="filters">{["Всички",...settings.categories].map(c=><button className={category===c?"active":""} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div><div className="grid">{filtered.map(p=><ProductCard product={p} key={p.id} onOpen={()=>setSelected(p)}/>)}</div>{!filtered.length&&<div className="empty">Скоро ще добавим предложения в тази категория.</div>}</section>
    <section id="how" className="section steps"><div><span className="section-label">Лесно и лично</span><h2>От твоята идея до сладък подарък</h2></div><ol><li><span>01</span><div><h3>Избери бисквитки</h3><p>Посочи продукт, количество и повод.</p></div></li><li><span>02</span><div><h3>Разкажи ни идеята</h3><p>Добави текст, цветове и примерна снимка.</p></div></li><li><span>03</span><div><h3>Потвърди и плати</h3><p>Плащането е онлайн, а ние започваме изработката.</p></div></li></ol></section>
    <section id="about" className="section story"><div className="story-card"><span className="section-label">Направено с грижа</span><h2>Маслена основа. Фонданов печат. Безкрайно много идеи.</h2><p>{settings.about}</p><div className="story-facts"><span><Check/> Дизайн за всеки повод</span><span><Check/> Внимателна опаковка</span><span><Check/> Срок: {settings.leadDays}</span></div></div><div className="quote">„Най-красивите детайли са тези, които носят лично послание.“</div></section>
    <footer id="contact"><Image className="footer-logo-image" src="/sweet-details-logo.jpeg" alt="Sweet Details" width={128} height={128}/><p>Персонализирани бисквитки за всеки повод.</p><div className="socials">{settings.instagram&&<a href={settings.instagram} aria-label="Instagram">IG</a>}{settings.facebook&&<a href={settings.facebook} aria-label="Facebook">f</a>}{settings.tiktok&&<a href={settings.tiktok} aria-label="TikTok">TT</a>}</div><div className="contact-lines">{settings.phone&&<a href={`tel:${settings.phone}`}>{settings.phone}</a>}{settings.email&&<a href={`mailto:${settings.email}`}>{settings.email}</a>}</div><small>© {new Date().getFullYear()} {settings.brand}. Всички права запазени.</small></footer>
    {selected&&<OrderModal product={selected} onClose={()=>setSelected(null)}/>} 
  </main>
}

function OrderModal({product,onClose}:{product:Product;onClose:()=>void}) {
  const minimum=Math.max(10,product.minQuantity);
  const [quantity,setQuantity]=useState(minimum);
  const [values,setValues]=useState<Record<string, string|boolean>>({});
  const [file,setFile]=useState<File|null>(null);
  const [contact,setContact]=useState({name:"",email:"",phone:"",date:""});
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const total=useMemo(()=>{let extra=0; product.options.forEach(o=>{const v=values[o.id]; const ch=o.choices?.find(c=>c.label===v); extra+=ch?.price||0}); return (product.price+extra)*quantity},[values,quantity,product]);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage("");try{let designUrl="";if(file){const fd=new FormData();fd.append("file",file);const u=await fetch("/api/upload",{method:"POST",body:fd});if(u.ok)designUrl=(await u.json()).url}const r=await fetch("/api/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({product,quantity,values,contact,designUrl,total})});const data=await r.json();if(data.url)location.href=data.url;else setMessage(data.message||"Поръчката е приета.")}catch{setMessage("Не успяхме да изпратим поръчката. Опитай отново.")}finally{setBusy(false)}};
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><button className="modal-close" onClick={onClose}><X/></button><div className="modal-head"><span className="section-label">Твоята поръчка</span><h2>{product.title}</h2><p>Попълни детайлите — ще ги видиш обобщени преди плащане.</p></div><form onSubmit={submit}><div className="qty"><label>Количество <small>минимум {minimum} бр.</small></label><div><button type="button" onClick={()=>setQuantity(Math.max(minimum,quantity-1))}><Minus/></button><strong>{quantity}</strong><button type="button" onClick={()=>setQuantity(quantity+1)}><Plus/></button></div></div>
    {product.options.map(o=>{if(o.dependsOn&&!values[o.dependsOn])return null; if(o.type==="checkbox")return <label className="check" key={o.id}><input type="checkbox" checked={!!values[o.id]} onChange={e=>setValues({...values,[o.id]:e.target.checked})}/><span><Check/></span>{o.label}</label>;return <label className="field" key={o.id}>{o.label}{o.type==="select"?<select required={o.required} value={String(values[o.id]||"")} onChange={e=>setValues({...values,[o.id]:e.target.value})}><option value="">Избери</option>{o.choices?.map(c=><option key={c.label}>{c.label}</option>)}</select>:o.type==="textarea"?<textarea value={String(values[o.id]||"")} onChange={e=>setValues({...values,[o.id]:e.target.value})} placeholder="Цветове, тема, стил и други подробности…"/>:<input required={o.required} value={String(values[o.id]||"")} onChange={e=>setValues({...values,[o.id]:e.target.value})}/>}</label>})}
    <label className="upload"><Upload/><span><strong>{file?file.name:"Прикачи примерен дизайн"}</strong><small>JPG, PNG или WEBP до 8 MB</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><div className="contact-grid"><label className="field">Име<input required value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})}/></label><label className="field">Телефон<input required value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})}/></label><label className="field">Имейл<input type="email" required value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})}/></label><label className="field">Желана дата<input type="date" required value={contact.date} onChange={e=>setContact({...contact,date:e.target.value})}/></label></div>{message&&<div className="form-message">{message}</div>}<div className="checkout"><div><small>Общо</small><strong>{total.toFixed(2)} лв.</strong></div><button disabled={busy}>{busy?"Обработваме…":"Към сигурно плащане"}<ArrowRight/></button></div></form></div></div>
}
