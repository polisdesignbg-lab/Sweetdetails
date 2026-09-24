import type { Metadata, Viewport } from "next";
import "../../public/admin.css";

export const metadata: Metadata = {
  // absolute avoids the root "%s | Sweet Details" template doubling the brand
  title: { absolute: "Вход" },
  description: null,
  keywords: [],
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },
  openGraph: {
    title: "Вход",
    description: "",
    url: "/admin",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Вход",
    description: "",
    images: [],
  },
  alternates: {
    canonical: null,
    languages: {},
  },
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
