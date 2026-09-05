import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sweetdetails.ink"),
  title: "Персонализирани бисквити за всеки повод | Sweet Details",
  description: "Маслени бисквити с персонализиран фонданов печат за рожден ден, кръщене, сватба, фирмен повод и всеки специален момент.",
  keywords: ["персонализирани бисквити","бисквити с фондан","маслени бисквити","бисквити за рожден ден","бисквити за кръщене","бисквити за сватба","сладки за празник","фирмени бисквити"],
  alternates: { canonical: "/" },
  openGraph: {type:"website",locale:"bg_BG",url:"/",siteName:"Sweet Details",title:"Персонализирани бисквити за всеки повод | Sweet Details",description:"Ръчно изработени маслени бисквити с персонализиран фонданов печат.",images:[{url:"/hero-cookies.png",width:1778,height:889,alt:"Персонализирани бисквити Sweet Details"}]},
  robots: {index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className="antialiased">{children}</body>
    </html>
  );
}
