import "../../public/admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app notranslate" lang="bg" translate="no">
      {children}
    </div>
  );
}
