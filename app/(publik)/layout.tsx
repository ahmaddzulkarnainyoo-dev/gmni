import { SiteFooter } from "@/components/publik/SiteFooter";
import { SiteHeader } from "@/components/publik/SiteHeader";

export default function PublikLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}