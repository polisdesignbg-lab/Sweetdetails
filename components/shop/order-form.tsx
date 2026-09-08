"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Minus, Plus, ShoppingCart, Upload } from "lucide-react";
import type { OrderCustomization, ShopProduct, ShopShape } from "@/lib/shop/types";
import { calculateTotal, getUnitPrice, minLeadDate } from "@/lib/shop/pricing";
import { formatEuro } from "@/lib/format";
import { useCatalog } from "./catalog-context";
import { useCart } from "./cart-context";

type Props = {
  product: ShopProduct;
  categorySlug?: string;
  shapes?: ShopShape[];
};

export function ShopOrderForm({ product, categorySlug, shapes: shapeProp }: Props) {
  const { shapes: allShapes, settings } = useCatalog();
  const { addItem } = useCart();
  const shapes = (shapeProp ?? allShapes).filter(s => product.shapeIds.includes(s.id));
  const minQty = product.minQuantity;
  const step = product.quantityStep || 1;
  const minDate = minLeadDate(settings.minLeadDays);

  const [quantity, setQuantity] = useState(minQty);
  const [shapeId, setShapeId] = useState("");
  const [customization, setCustomization] = useState<OrderCustomization>({});
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const selectedShape = shapes.find(s => s.id === shapeId);
  const unitPrice = getUnitPrice(product, quantity);
  const total = calculateTotal(product, quantity, 0);

  useEffect(() => {
    if (shapes.length && !shapeId) setShapeId(shapes[0].id);
  }, [shapes, shapeId]);

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

  const addToCart = async () => {
    if (!validateForm()) return;
    setBusy(true);
    setError("");
    try {
      let referenceImageUrl = customization.referenceImageUrl || "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const u = await fetch("/api/upload", { method: "POST", body: fd });
        if (u.ok) referenceImageUrl = (await u.json()).url;
      }
      addItem({
        productId: product.id,
        productTitle: product.title,
        productSlug: product.slug,
        categorySlug,
        image: product.images[0] || "/products-showcase.png",
        shapeId: selectedShape?.id,
        shapeLabel: selectedShape?.label,
        quantity,
        unitPrice,
        minQuantity: minQty,
        quantityStep: step,
        customization: { ...customization, referenceImageUrl },
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2500);
    } catch {
      setError("Не успяхме да добавим продукта. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shop-order-form">
      <h3>Персонализирайте вашите бисквитки</h3>

      {!!shapes.length && (
        <div className="shape-picker">
          <span className="field-label">Изберете форма *</span>
          <div className="shape-grid">
            {shapes.map(s => (
              <button key={s.id} type="button" className={`shape-option${shapeId === s.id ? " active" : ""}`} onClick={() => setShapeId(s.id)}>
                <span className="shape-thumb"><img src={s.image} alt={s.label} draggable={false} /></span>
                <strong>{s.label}</strong>
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
      {added && <div className="form-message ok"><Check size={16} /> Добавено в количката</div>}
      <div className="shop-order-total"><span>Ориентировъчно</span><strong>{formatEuro(total)}</strong></div>
      <div className="shop-form-actions shop-form-actions-stack">
        <button type="button" className="shop-btn-primary shop-btn-block" disabled={busy} onClick={addToCart}>
          {busy ? "Добавяне…" : "Добави в количката"} <ShoppingCart size={18} />
        </button>
        <a href="/shop/cart" className="shop-btn-secondary shop-btn-block">Към количката <ArrowRight size={16} /></a>
      </div>
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
