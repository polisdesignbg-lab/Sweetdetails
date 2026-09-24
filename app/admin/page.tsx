import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { getContent } from "@/lib/data";
import AdminPanel from "./panel";

export const dynamic = "force-dynamic";

/** Belt-and-suspenders: page-level noindex in case layout metadata merge fails. */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default async function AdminPage() {
  const authorized = await isAdmin();
  const content = authorized ? await getContent() : null;
  return <AdminPanel authorized={authorized} initial={content} />;
}
