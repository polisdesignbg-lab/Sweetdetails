import type { Metadata, Viewport } from "next";
import "../../public/admin.css";

export const metadata: Metadata = {
  title: "Админ | Sweet Details",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SD Админ",
    statusBarStyle: "default",
  },
  other: {
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  themeColor: "#e92e72",
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app notranslate" lang="bg" translate="no">
      {children}
    </div>
  );
}
