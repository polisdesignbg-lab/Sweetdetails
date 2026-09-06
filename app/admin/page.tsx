import { isAdmin } from "@/lib/admin-auth";
import { getContent } from "@/lib/data";
import AdminPanel from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authorized = await isAdmin();
  const content = authorized ? await getContent() : null;
  return <AdminPanel authorized={authorized} initial={content} />;
}
