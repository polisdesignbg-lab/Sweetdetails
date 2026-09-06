"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Minus, Plus, Upload, X } from "lucide-react";
import type { Product } from "@/lib/defaults";
import { formatEuro } from "@/lib/format";

export function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const minimum = Math.max(10, product.minQuantity);
  const shapes = product.shapes ?? [];
  const [quantity, setQuantity] = useState(minimum);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [shapeId, setShapeId] = useState(shapes.length === 1 ? shapes[0].id : "");
  const [file, setFile] = useState<File | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedShape = shapes.find(s => s.id === shapeId);

  const total = useMemo(() => {
    let extra = 0;
    product.options.forEach(o => {
      const v = values[o.id];
      const ch = o.choices?.find(c => c.label === v);
      extra += ch?.price || 0;
    });
    return (product.price + extra) * quantity;
  }, [values, quantity, product]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shapes.length && !shapeId) {
      setMessage("Моля, избери форма на бисквитката.");
      return;
    }
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
        ...(selectedShape ? { shape: selectedShape.name, shapeId: selectedShape.id } : {}),
      };
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product,
          quantity,
          values: orderValues,
          selectedShape: selectedShape || null,
          contact,
          designUrl,
          total,
        }),
      });
      const data = await r.json();
      if (data.url) location.href = data.url;
      else setMessage(data.message || "Поръчката е приета. Ще се свържем с теб скоро.");
    } catch {
      setMessage("Не успяхме да изпратим поръчката. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} type="button" aria-label="Затвори">
          <X />
        </button>
        <div className="modal-head">
          <span className="section-label">Твоята поръчка</span>
          <h2>{product.title}</h2>
          <p>Избери форма, опиши детайлите и остави контакт — ще се свържем с теб за потвърждение.</p>
        </div>
        <form onSubmit={submit}>
          {!!shapes.length && (
            <fieldset className="shape-picker">
              <legend>
                Избери форма <small>задължително</small>
              </legend>
              <div className="shape-grid">
                {shapes.map(shape => {
                  const active = shapeId === shape.id;
                  return (
                    <label key={shape.id} className={`shape-option${active ? " active" : ""}`}>
                      <input
                        type="radio"
                        name="cookie-shape"
                        value={shape.id}
                        checked={active}
                        onChange={() => setShapeId(shape.id)}
                        required
                      />
                      <span className="shape-thumb">
                        {shape.image ? (
                          <Image src={shape.image} alt={shape.name} fill sizes="120px" unoptimized style={{ objectFit: "cover" }} />
                        ) : (
                          <span className="shape-placeholder">🍪</span>
                        )}
                      </span>
                      <strong>{shape.name}</strong>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="qty">
            <label>
              Количество <small>минимум {minimum} бр.</small>
            </label>
            <div>
              <button type="button" onClick={() => setQuantity(Math.max(minimum, quantity - 1))} aria-label="Намали">
                <Minus />
              </button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Увеличи">
                <Plus />
              </button>
            </div>
          </div>

          {product.options.map(o => {
            if (o.dependsOn && !values[o.dependsOn]) return null;
            if (o.type === "checkbox") {
              return (
                <label className="check" key={o.id}>
                  <input
                    type="checkbox"
                    checked={!!values[o.id]}
                    onChange={e => setValues({ ...values, [o.id]: e.target.checked })}
                  />
                  <span>
                    <Check />
                  </span>
                  {o.label}
                </label>
              );
            }
            return (
              <label className="field" key={o.id}>
                {o.label}
                {o.type === "select" ? (
                  <select
                    required={o.required}
                    value={String(values[o.id] || "")}
                    onChange={e => setValues({ ...values, [o.id]: e.target.value })}
                  >
                    <option value="">Избери</option>
                    {o.choices?.map(c => (
                      <option key={c.label}>{c.label}</option>
                    ))}
                  </select>
                ) : o.type === "textarea" ? (
                  <textarea
                    value={String(values[o.id] || "")}
                    onChange={e => setValues({ ...values, [o.id]: e.target.value })}
                    placeholder="Цветове, тема, стил…"
                  />
                ) : (
                  <input
                    required={o.required}
                    value={String(values[o.id] || "")}
                    onChange={e => setValues({ ...values, [o.id]: e.target.value })}
                  />
                )}
              </label>
            );
          })}

          <label className="upload">
            <Upload />
            <span>
              <strong>{file ? file.name : "Прикачи примерен дизайн"}</strong>
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>

          <div className="contact-fields">
            <h3>Данни за връзка</h3>
            <p className="contact-hint">Без регистрация — нужни са само име, имейл и телефон.</p>
            <label className="field">
              Име
              <input required autoComplete="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
            </label>
            <label className="field">
              Имейл
              <input
                type="email"
                required
                autoComplete="email"
                value={contact.email}
                onChange={e => setContact({ ...contact, email: e.target.value })}
              />
            </label>
            <label className="field">
              Телефон
              <input
                type="tel"
                required
                autoComplete="tel"
                value={contact.phone}
                onChange={e => setContact({ ...contact, phone: e.target.value })}
              />
            </label>
          </div>

          {message && <div className="form-message">{message}</div>}

          <div className="checkout">
            <div>
              <small>Ориентировъчно</small>
              <strong>{formatEuro(total)}</strong>
            </div>
            <button disabled={busy} type="submit">
              {busy ? "Изпращаме…" : "Изпрати поръчка"}
              <ArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
