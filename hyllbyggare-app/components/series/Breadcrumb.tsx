import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Brödsmulor: Sida / Anamosa
export default function Breadcrumb() {
  return (
    <nav aria-label="Brödsmulor" className="flex items-center gap-1 py-3 font-body text-sm text-muted-foreground">
      <Link href="/" className="transition-opacity duration-fast hover:opacity-70">
        Sida
      </Link>
      <ChevronRight size={16} className="text-border" aria-hidden />
      <span className="text-foreground" aria-current="page">
        Anamosa
      </span>
    </nav>
  );
}
