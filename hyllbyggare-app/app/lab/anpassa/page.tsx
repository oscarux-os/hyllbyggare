import Anpassa from "@/components/anpassa/Anpassa";

// Lab-spår: produktsidan som råkar vara konfigurerbar. Egen route så byggaren på /bygg
// och den gamla FORM/FUNCTION-spiken på /lab står orörda.
export const metadata = { title: "Anpassa Anamosa – Mio" };

export default function AnpassaPage() {
  return <Anpassa />;
}
