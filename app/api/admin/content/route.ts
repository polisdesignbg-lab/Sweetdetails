import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveContent } from "@/lib/data";
import type { Product, SiteSettings } from "@/lib/defaults";

export async function PUT(request:Request){
 if(!await isAdmin())return NextResponse.json({error:"unauthorized"},{status:401});
 const body=await request.json() as {settings:SiteSettings;products:Product[]};
 if(!body.settings?.brand||!Array.isArray(body.products))return NextResponse.json({error:"invalid"},{status:400});
 await saveContent(body.settings,body.products);return NextResponse.json({ok:true});
}
