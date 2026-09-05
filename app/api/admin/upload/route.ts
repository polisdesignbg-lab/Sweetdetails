import { isAdmin } from "@/lib/admin-auth";
import { uploadImage } from "@/lib/upload";
export async function POST(request:Request){if(!await isAdmin())return Response.json({error:"unauthorized"},{status:401});return uploadImage(request)}
