import { NextResponse } from "next/server";
import { makeAdminToken } from "@/lib/admin-auth";

export async function POST(request:Request){
  const {password}=await request.json() as {password?:string};
  if(!process.env.ADMIN_PASSWORD || password!==process.env.ADMIN_PASSWORD) return NextResponse.json({error:"unauthorized"},{status:401});
  const response=NextResponse.json({ok:true});
  response.cookies.set("cookie-admin",await makeAdminToken(),{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:60*60*12});
  return response;
}
