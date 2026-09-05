import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getContent } from "@/lib/data";
import AdminPanel from "./panel";

export const dynamic = "force-dynamic";
export default async function AdminPage({params}:{params:Promise<{adminPath:string}>}) {
  const {adminPath}=await params;
  if(adminPath !== (process.env.ADMIN_PATH || "studio-poli-9f3")) notFound();
  const authorized=await isAdmin();
  const content=authorized?await getContent():null;
  return <AdminPanel authorized={authorized} initial={content}/>;
}
