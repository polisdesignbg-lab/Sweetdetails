"use client";

import type { ShopOrder } from "@/lib/shop/types";
import { ORDER_STATUS_LABELS } from "@/lib/shop/types";

export function OrderDetail({ order, onBack, onStatus, busy }: {
  order: ShopOrder;
  onBack: () => void;
  onStatus: (id: string, s: ShopOrder["status"]) => void;
  busy: boolean;
}) {
  const c = order.customization || {};
  const contact = order.contact || { fullName: "—", phone: "—", email: "" };
  const lineItems = order.items?.length
    ? order.items
    : [{
        productTitle: order.productTitle || "Поръчка",
        quantity: order.quantity || 0,
        shapeLabel: order.shapeLabel,
        unitPrice: order.unitPrice || 0,
        lineTotal: order.total || 0,
        image: undefined as string | undefined,
        customization: c,
      }];

  const field = (label: string, value?: string | null) => {
    const v = (value || "").trim();
    if (!v) return null;
    return (
      <div key={label}>
        <dt>{label}</dt>
        <dd>{v}</dd>
      </div>
    );
  };

  return (
    <div className="admin-card admin-card-body">
      <button type="button" className="admin-back-link" onClick={onBack}>← Назад към поръчките</button>

      <div className="admin-order-head">
        <div>
          <h2>Поръчка {(order.id || "").slice(0, 8).toUpperCase()}</h2>
          <p><small>{order.createdAt ? new Date(order.createdAt).toLocaleString("bg-BG") : "—"}</small></p>
        </div>
        <span className={`admin-status admin-status-${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <label className="admin-field">
        Статус
        <select
          value={order.status}
          disabled={busy}
          onChange={e => onStatus(order.id, e.target.value as ShopOrder["status"])}
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>

      <section className="admin-order-block">
        <h3>Поръчани продукти</h3>
        <div className="admin-order-items">
          {lineItems.map((item, idx) => {
            const custom = item.customization || c || {};
            const img = item.image || "";
            return (
              <article key={idx} className="admin-order-item">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="admin-order-item-img" src={img} alt={item.productTitle || "Продукт"} />
                ) : (
                  <div className="admin-order-item-img admin-order-item-img-empty">Няма снимка</div>
                )}
                <div className="admin-order-item-body">
                  <h4>{item.productTitle || "Продукт"}</h4>
                  <p>
                    <strong>Форма:</strong> {item.shapeLabel || "—"}
                    {" · "}
                    <strong>Количество:</strong> {item.quantity || 0} бр.
                  </p>
                  <p>
                    <strong>Цена:</strong> {Number(item.unitPrice || 0).toFixed(2)} € / бр.
                    {" · "}
                    <strong>Ред:</strong> {Number(item.lineTotal || 0).toFixed(2)} €
                  </p>
                  <dl className="admin-dl">
                    {field("Повод", custom.occasion)}
                    {field("Надпис", custom.inscription)}
                    {field("Име", custom.childName)}
                    {field("Дата върху дизайна", custom.designDate)}
                    {field(
                      "Цвят",
                      custom.themeColor === "Друго" ? custom.customColor || "Друго" : custom.themeColor,
                    )}
                    {field("Необходими до", custom.neededByDate)}
                    {field("Бележки", custom.notes)}
                  </dl>
                  {custom.referenceImageUrl ? (
                    <p>
                      <a href={custom.referenceImageUrl} target="_blank" rel="noopener noreferrer">
                        Референтна снимка от клиента
                      </a>
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
        <p className="admin-order-total">
          <strong>Обща сума: {Number(order.total || 0).toFixed(2)} €</strong>
        </p>
      </section>

      <section className="admin-order-block">
        <h3>Клиент и доставка</h3>
        <dl className="admin-dl">
          {field("Име", contact.fullName)}
          {field("Телефон", contact.phone)}
          {field("Имейл", contact.email)}
          {field("Град", contact.city)}
          {field("Еконт офис", contact.econtOffice)}
          {field("Бележки за доставка", contact.deliveryNotes)}
        </dl>
      </section>
    </div>
  );
}
