import { Suspense } from "react";
import Studio from "@/components/Studio";

// Byggaren: välj möbeltyp → konfigurera. Nås från Anamosa-startsidan.
export default function Bygg() {
  // Suspense krävs eftersom Studio läser query-parametern ?config= via useSearchParams.
  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}
