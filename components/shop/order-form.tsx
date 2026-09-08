"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Minus, Plus, Upload } from "lucide-react";
import type { OrderCustomization, OrderContact, ShopProduct, ShopShape } from "@/lib/shop/types";
import { calculateTotal, getUnitPrice, minLeadDate } from "@/lib/shop/pricing";
import { formatEuro } from "@/lib/format";
import { useCatalog } from "./catalog-context";

type Props = {
  product: ShopProduct;
  categorySlug?: string;
  shapes?: ShopShape[];
};

export function ShopOrderForm({ product, categorySlug, shapes: shapeProp }: Props) {
  const { shapes: allShapes, settings } = useCatalog();
  const shapes = (shapeProp ?? allShapes).filter(s => product.shapeIds.includes(s.id));
  const minQty = product.minQuantity;
  const step = product.quantityStep || 1;
  const minDate = minLeadDate(settings.minLeadDays);

  const [quantity, setQuantity] = useState(minQty);
  const [shapeId, setShapeId] = useState("");
  const [customization, setCustomization] = useState<OrderCustomization>({});
  const [contact, setContact] = useState<OrderContact>({ fullName: "", email: "", phone: "", city: "", deliveryNotes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [stepView, setStepView] = useState<"form" | "summary">("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selectedShape = shapes.find(s => s.id === shapeId);
  const shapeAddon = (selectedShape?.addonPrice ?? 0) * quantity;
  const unitPrice = getUnitPrice(product, quantity);
  const total = calculateTotal(product, quantity, shapeAddon);

  const patch = (k: keyof OrderCustomization, v: string) => setCustomization({ ...customization, [k]: v });

  const validateForm = () => {
    const missing: string[] = [];
    if (shapes.length && !shapeId) missing.push("форма");
    if (!customization.neededByDate) missing.push("дата на готовност");
    if (product.isCustomDesign && !customization.occasion?.trim()) missing.push("повод");
    if (missing.length) {
      setError(`Моля, попълни: ${missing.join(", ")}.`);
      return false;
    }
    if (customization.neededByDate < minDate) {
      setError(`Минимален срок: ${settings.minLeadDays} дни (${minDate}).`);
      return false;
    }
    setError("");
    return true;
  };

  const validateContact = () => {
    if (!validateForm()) return false;
    const missing: string[] = [];
    if (!contact.fullName.trim()) missing.push("име");
    if (!contact.email.trim()) missing.push("имейл");
    if (!contact.phone.trim()) missing.push("телефон");
    if (!contact.city.trim()) missing.push("населено място");
    if (missing.length) {
      setError(`Моля, попълни: ${missing.join(", ")}.`);
      return false;
    }
    setError("");
    return true;
  };

  const submit = async () => {
    if (!validateContact()) return;
    setBusy(true);
    setError("");
    try {
      let referenceImageUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const u = await fetch("/api/upload", { method: "POST", body: fd });
        if (u.ok) referenceImageUrl = (await u.json()).url;
      }
      const r = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product,
          shape: selectedShape,
          quantity,
          customization: { ...customization, referenceImageUrl: referenceImageUrl || customization.referenceImageUrl },
          contact,
          categorySlug,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Грешка при изпращане.");
        return;
      }
      location.href = data.redirectUrl || `/shop/thank-you?order=${data.orderId}`;
    } catch {
      setError("Не успяхме да изпратим поръчката. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  const summaryRows = useMemo(() => [
    ...(product.isCustomDesign ? [["Повод", customization.occasion || "—"]] : []),
    ["Продукт", product.title],
    ["Форма", selectedShape?.label || "—"],
    ["Количество", `${quantity} бр.`],
    ["Надпис", customization.inscription || "—"],
    ["Име", customization.childName || "—"],
    ["Дата върху дизайна", customization.designDate || "—"],
    ["Цвят", customization.themeColor === "Друго" ? customization.customColor || "Друго" : customization.themeColor || "—"],
    ["Необходими до", customization.neededByDate || "—"],
    ["Бележки", customization.notes || "—"],
    ["Крайна цена", formatEuro(total)],
  ], [product.title, selectedShape, quantity, customization, total]);

  if (stepView === "summary") {
    return (
      <div className="shop-order-form">
        <h3>Обобщение на поръчката</h3>
        <dl className="shop-summary">
          {summaryRows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <h3>Данни за доставка</h3>
        <div className="shop-fields">
          <label className="field">Име и фамилия *<input value={contact.fullName} onChange={e => setContact({ ...contact, fullName: e.target.value })} /></label>
          <label className="field">Телефон *<input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></label>
          <label className="field">Имейл *<input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
          <label className="field">Населено място *<input value={contact.city} onChange={e => setContact({ ...contact, city: e.target.value })} /></label>
          <label className="field wide">Адрес / бележки за доставка<textarea value={contact.deliveryNotes || ""} onChange={e => setContact({ ...contact, deliveryNotes: e.target.value })} /></label>
        </div>
        {error && <div className="form-message err">{error}</div>}
        <div className="shop-form-actions">
          <button type="button" className="shop-btn-secondary" onClick={() => setStepView("form")}>Назад</button>
          <button type="button" className="shop-btn-primary" disabled={busy} onClick={submit}>{busy ? "Изпращаме…" : "Заяви поръчка"}<ArrowRight size={18} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-order-form">
      <h3>Персонализирайте вашите бисквитки</h3>

      {!!shapes.length && (
        <div className="shape-picker">
          <span className="field-label">Изберете форма *</span>
          <div className="shape-grid">
            {shapes.map(s => (
              <button key={s.id} type="button" className={`shape-option${shapeId === s.id ? " active" : ""}`} onClick={() => setShapeId(s.id)}>
                <span className="shape-thumb"><img src={s.image} alt={s.label} /></span>
                <strong>{s.label}</strong>
                {s.addonPrice > 0 && <small>+{formatEuro(s.addonPrice)}/бр.</small>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="shop-fields">
        {product.isCustomDesign && (
          <label className="field wide">Повод *<input placeholder="Напр. Кръщене, рожден ден…" value={customization.occasion || ""} onChange={e => patch("occasion", e.target.value)} /></label>
        )}
        <label className="field">Количество *<div className="qty-inline"><button type="button" onClick={() => setQuantity(Math.max(minQty, quantity - step))}><Minus size={16} /></button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity(quantity + step)}><Plus size={16} /></button></div><small>Мин. {minQty} бр. · {formatEuro(unitPrice)}/бр.</small></label>
        <label className="field">Надпис върху бисквитката<input placeholder="Напр. Свето Кръщение" value={customization.inscription || ""} onChange={e => patch("inscription", e.target.value)} /></label>
        <label className="field">Име<input placeholder="Напр. Изабел" value={customization.childName || ""} onChange={e => patch("childName", e.target.value)} /></label>
        <label className="field">Дата върху бисквитката<input type="date" value={customization.designDate || ""} onChange={e => patch("designDate", e.target.value)} /></label>
        <label className="field">Цвят на темата<select value={customization.themeColor || ""} onChange={e => patch("themeColor", e.target.value)}><option value="">Избери</option>{product.themeColors.map(c => <option key={c}>{c}</option>)}</select></label>
        {customization.themeColor === "Друго" && (
          <label className="field">Опишете желания цвят<input value={customization.customColor || ""} onChange={e => patch("customColor", e.target.value)} /></label>
        )}
        <label className="field wide">За коя дата са ви необходими? *<input type="date" min={minDate} value={customization.neededByDate || ""} onChange={e => patch("neededByDate", e.target.value)} /><small>Посочете датата, на която желаете поръчката да бъде готова.</small></label>
        <label className="field wide">Допълнителни уточнения<textarea placeholder="Напишете всичко друго, което искате да знаем…" value={customization.notes || ""} onChange={e => patch("notes", e.target.value)} /></label>
        <label className="upload"><Upload /><span><strong>{file ? file.name : "Референтна снимка (по избор)"}</strong></span><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      </div>

      {error && <div className="form-message err">{error}</div>}
      <div className="shop-order-total"><span>Ориентировъчно</span><strong>{formatEuro(total)}</strong></div>
      <button type="button" className="shop-btn-primary shop-btn-block" onClick={() => validateForm() && setStepView("summary")}>Преглед и заявка <ArrowRight size={18} /></button>
    </div>
  );
}

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["/products-showcase.png"];
  return (
    <div className="shop-gallery">
      <div className="shop-gallery-main">
        <Image src={list[active]} alt={title} fill unoptimized sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
      </div>
      {list.length > 1 && (
        <div className="shop-gallery-thumbs">
          {list.map((im, i) => (
            <button key={im + i} type="button" className={i === active ? "active" : ""} onClick={() => setActive(i)}>
              <Image src={im} alt="" width={64} height={64} unoptimized style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
