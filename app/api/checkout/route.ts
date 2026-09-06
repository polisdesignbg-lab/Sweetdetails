import { env } from "cloudflare:workers";

export async function POST(request:Request){
 const order=await request.json() as Record<string,any>;const id=crypto.randomUUID();
 if(!order.product?.title||!order.contact?.name||!order.contact?.email||!order.contact?.phone||Number(order.quantity)<10)return Response.json({error:"Попълни име, имейл, телефон и минимум 10 броя."},{status:400});
 await env.DB.prepare("INSERT INTO orders (id,data,status,created_at) VALUES (?,?,?,?)").bind(id,JSON.stringify(order),"awaiting_payment",new Date().toISOString()).run();
 const stripe=process.env.STRIPE_SECRET_KEY;
 if(!stripe)return Response.json({message:`Поръчката е записана с номер ${id.slice(0,8).toUpperCase()}. Онлайн плащането ще бъде активно след свързване на Stripe.`});
 const origin=new URL(request.url).origin;const amount=Math.max(100,Math.round(Number(order.total)*100));
 const form=new URLSearchParams();form.set("mode","payment");form.set("success_url",`${origin}/?payment=success&order=${id}`);form.set("cancel_url",`${origin}/?payment=cancelled`);form.set("customer_email",String(order.contact.email));form.set("client_reference_id",id);form.set("line_items[0][price_data][currency]","eur");form.set("line_items[0][price_data][unit_amount]",String(amount));form.set("line_items[0][price_data][product_data][name]",`${order.product.title} × ${order.quantity}`);form.set("line_items[0][quantity]","1");form.set("metadata[order_id]",id);
 const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{authorization:`Bearer ${stripe}`,"content-type":"application/x-www-form-urlencoded"},body:form});const data=await r.json() as {url?:string;error?:{message?:string}};if(!r.ok)return Response.json({error:data.error?.message||"stripe error"},{status:502});return Response.json({url:data.url});
}
