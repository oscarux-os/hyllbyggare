import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Hyllbyggare – Mio",
  description: "Bygg din egen hylla – välj storlek, fack och finish.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Fonterna (Bulldog + Source Sans 3) är self-hostade via @font-face i globals.css.
  return (
    <html lang="sv">
      <body>
        <Header />
        {/* Ram i max-bredden ger innehållet en referens på breda skärmar. Labbytan
            (body.anpassa-page) släpper den och tar hela fönstret – se globals.css. */}
        <div className="site-frame mx-auto w-full max-w-content border-x border-border">{children}</div>
      </body>
    </html>
  );
}
