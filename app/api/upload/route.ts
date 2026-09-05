import { uploadImage } from "@/lib/upload";
export async function POST(request:Request){return uploadImage(request)}
