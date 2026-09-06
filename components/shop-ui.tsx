"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, Upload, X } from "lucide-react";
import type { Product } from "@/lib/defaults";
import { PACKAGING_NOTE } from "@/lib/defaults";
import { formatEuro } from "@/lib/format";

const productImagePosition: Record<string, string> = {
  baptism: "18% 58%",
  birthday: "50% 58%",
  wedding: "82% 58%",
};

export function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const [slide, setSlide] = useState(0);
  const images = product.images.length ? product.images : ["/products-showcase.png"];
  const objectPosition = productImagePosition[product.id] ?? "center";
  return (
    <article
      className="product-card product-card-clickable"
      onClick={onOpen}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onOpen()}
      role="button"
      tabIndex={0}
      aria-label={`Поръчай ${product.title}`}
    >
      <div className="product-image">
        <Image
          src={images[slide]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 33vw, 33vw"
          unoptimized
          style={{ objectFit: "cover", objectPosition }}
        />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {images.length > 1 && (
          <>
            <button className="slide prev" type="button" aria-label="Предишна" onClick={e => { e.stopPropagation(); setSlide((slide - 1 + images.length) % images.length); }}><ChevronLeft /></button>
            <button className="slide next" type="button" aria-label="Следваща" onClick={e => { e.stopPropagation(); setSlide((slide + 1) % images.length); }}><ChevronRight /></button>
          </>
        )}
      </div>
      <div className="product-copy">
        <h3>{product.title}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="price-row">
          <strong>{formatEuro(product.price)}</strong>
          <button type="button" aria-hidden="true" tabIndex={-1} onClick={e => { e.stopPropagation(); onOpen(); }}><Heart /></button>
        </div>
      </div>
    </article>
  );
}

export function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const minimum = Math.max(10, product.minQuantity);
  const shapes = product.shapes ?? [];
  const modalRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(minimum);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [shapeId, setShapeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "err">("ok");

  const selectedShape = shapes.find(s => s.id === shapeId);

  const total = useMemo(() => {
    let unitExtra = 0;
    let orderExtra = 0;
    product.options.forEach(o => {
      const v = values[o.id];
      if (o.type === "checkbox" && v && o.addonPrice) orderExtra += o.addonPrice;
      if (o.type === "select") {
        const ch = o.choices?.find(c => c.label === v);
        unitExtra += ch?.price || 0;
      }
    });
    return (product.price + unitExtra) * quantity + orderExtra;
  }, [values, quantity, product]);

  const notify = (type: "ok" | "err", text: string) => {
    setMessageType(type);
    setMessage(text);
    modalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    const missing: string[] = [];
    if (shapes.length && !shapeId) missing.push("форма на бисквитката");
    product.options.forEach(o => {
      if (o.dependsOn && !values[o.dependsOn]) return;
      if (!o.required || o.type === "checkbox") return;
      if (!String(values[o.id] || "").trim()) missing.push(o.label.toLowerCase());
    });
    if (!contact.name.trim()) missing.push("име");
    if (!contact.email.trim()) missing.push("имейл");
    if (!contact.phone.trim()) missing.push("телефон");
    if (missing.length) {
      notify("err", `Моля, попълни: ${missing.join(", ")}.`);
      return false;
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setMessage("");
    try {
      let designUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const u = await fetch("/api/upload", { method: "POST", body: fd });
        if (u.ok) designUrl = (await u.json()).url;
      }
      const orderValues = {
        ...values,
        ...(selectedShape ? { shape: selectedShape.label, shapeId: selectedShape.id } : {}),
      };
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product, quantity, values: orderValues, contact, designUrl, total }),
      });
      const data = await r.json();
      if (!r.ok) {
        notify("err", data.error || "Не успяхме да изпратим поръчката. Опитай отново.");
        return;
      }
      if (data.url) {
        location.href = data.url;
        return;
      }
      notify("ok", data.message || `Поръчката е приета! Ще се свържем с теб скоро на ${contact.email}.`);
    } catch {
      notify("err", "Не успяхме да изпратим поръчката. Провери интернет връзката и опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" ref={modalRef}>
        <button className="modal-close" onClick={onClose} type="button"><X /></button>
        <div className="modal-head">
          <span className="section-label">Твоята поръчка</span>
          <h2>{product.title}</h2>
          <p>Опиши детайлите и остави контакт — ще се свържем с теб за потвърждение.</p>
        </div>
        {message && <div className={`form-message ${messageType}`}>{message}</div>}
        <form onSubmit={submit} noValidate>
          <div className="qty">
            <label>Количество <small>минимум {minimum} бр.</small></label>
            <div>
              <button type="button" onClick={() => setQuantity(Math.max(minimum, quantity - 1))}><Minus /></button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity(quantity + 1)}><Plus /></button>
            </div>
          </div>

          {!!shapes.length && (
            <div className={`shape-picker${!shapeId ? " shape-picker-required" : ""}`}>
              <span className="field-label">Избери форма *</span>
              <div className="shape-grid">
                {shapes.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`shape-option${shapeId === s.id ? " active" : ""}`}
                    onClick={() => setShapeId(s.id)}
                  >
                    <span className="shape-thumb">
                      {s.image ? <img src={s.image} alt={s.label} /> : <span className="shape-placeholder">{s.label.slice(0, 1)}</span>}
                    </span>
                    <strong>{s.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.options.map(o => {
            if (o.dependsOn && !values[o.dependsOn]) return null;
            const label = o.required && o.type !== "checkbox" ? `${o.label} *` : o.label;
            if (o.type === "checkbox") {
              return (
                <div className="option-block" key={o.id}>
                  <label className="check">
                    <input type="checkbox" checked={!!values[o.id]} onChange={e => setValues({ ...values, [o.id]: e.target.checked })} />
                    <span><Check /></span>
                    {o.label}
                    {o.addonPrice ? <em className="addon-price">+{formatEuro(o.addonPrice)}</em> : null}
                  </label>
                  {o.id === "ribbon" && !values.ribbon && (
                    <p className="packaging-note">{PACKAGING_NOTE}</p>
                  )}
                </div>
              );
            }
            return (
              <label className="field" key={o.id}>
                {label}
                {o.type === "select" ? (
                  <select value={String(values[o.id] || "")} onChange={e => setValues({ ...values, [o.id]: e.target.value })}>
                    <option value="">Избери</option>
                    {o.choices?.map(c => <option key={c.label}>{c.label}</option>)}
                  </select>
                ) : o.type === "textarea" ? (
                  <textarea value={String(values[o.id] || "")} onChange={e => setValues({ ...values, [o.id]: e.target.value })} placeholder="Цветове, тема, стил…" />
                ) : (
                  <input value={String(values[o.id] || "")} onChange={e => setValues({ ...values, [o.id]: e.target.value })} placeholder={o.id === "printText" ? "Напр. „Митко“ или „Happy Birthday“" : undefined} />
                )}
              </label>
            );
          })}

          <label className="upload">
            <Upload />
            <span><strong>{file ? file.name : "Прикачи примерен дизайн (по избор)"}</strong></span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
          <div className="contact-fields">
            <h3>Данни за връзка *</h3>
            <p className="contact-hint">Без регистрация — нужни са само име, имейл и телефон.</p>
            <label className="field">Име *<input required autoComplete="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} /></label>
            <label className="field">Имейл *<input type="email" required autoComplete="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
            <label className="field">Телефон *<input type="tel" required autoComplete="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></label>
          </div>
          <div className="checkout">
            <div><small>Ориентировъчно</small><strong>{formatEuro(total)}</strong></div>
            <button disabled={busy} type="submit">{busy ? "Изпращаме…" : "Изпрати поръчка"}<ArrowRight /></button>
          </div>
        </form>
      </div>
    </div>
  );
}
