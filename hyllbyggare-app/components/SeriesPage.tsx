import Hero from "./series/Hero";
// import KeySpecs from "./series/KeySpecs"; // USP-block dolt tillsvidare
import ConfigCarousel from "./series/ConfigCarousel";
import MaterialColorsHead from "./series/MaterialColorsHead";
import InspirationGallery from "./series/InspirationGallery";
import Valmojligheter from "./series/Valmojligheter";
import Reviews from "./series/Reviews";

// Seriesida för Anamosa – byggd efter Figma ("Seriesida"). Sektionerna ligger i components/series.
export default function SeriesPage() {
  return (
    <main className="w-full pb-24">
      <Hero />
      {/* USP-block dolt tillsvidare – aktivera igen genom att avkommentera. */}
      {/* <KeySpecs /> */}
      <ConfigCarousel />
      <Valmojligheter />
      <MaterialColorsHead />
      <InspirationGallery />
      <Reviews />
    </main>
  );
}
