import { env } from "cloudflare:workers";

export async function uploadImage(request:Request){
 const form=await request.formData();const file=form.get("file");
 if(!(file instanceof File))return new Response(JSON.stringify({error:"missing file"}),{status:400,headers:{"content-type":"application/json"}});
 if(file.size>8*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))return new Response(JSON.stringify({error:"invalid file"}),{status:400,headers:{"content-type":"application/json"}});
 const ext=file.type.split('/')[1].replace('jpeg','jpg');const key=`uploads/${crypto.randomUUID()}.${ext}`;
 await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});
 return Response.json({url:`/api/media/${key}`});
}
