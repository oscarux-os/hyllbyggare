"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Configurator from "./Configurator";
import TypePicker from "./TypePicker";
import { buildConfigState, type State } from "@/lib/config";
import { CONFIGS } from "./series/data";

// Tvåstegsflöde: välj möbeltyp → konfigurera. Tillbaka-knappen i konfiguratorn
// återgår till väljaren. Med ?config=<id> (t.ex. "Välj" på seriesidan) hoppar vi
// direkt in i konfiguratorn med den färdiga konfigurationen förvald.
function configFromParam(id: string | null): State | null {
  if (!id) return null;
  const c = CONFIGS.find((x) => x.id === id);
  if (!c) return null;
  // Handkodad layout (foto-korten) öppnar exakt det bygget fotot visar. Klona så att
  // redigering i byggaren aldrig muterar den delade datan.
  if (c.layout) return structuredClone(c.layout);
  return buildConfigState(c.category, {
    style: c.style, material: c.material, color: c.color, front: c.front,
    cols: c.cols, heightUnits: c.heightUnits,
  });
}

export default function Studio() {
  const params = useSearchParams();
  const router = useRouter();
  // Kom vi in via djuplänk (?config= från seriesidan) eller via typväljaren? Källan styr
  // vart Tillbaka går: djuplänk → tillbaka till sidan man kom från, väljaren → väljaren.
  const fromSeries = useRef(false);
  const [config, setConfig] = useState<State | null>(() => {
    const s = configFromParam(params.get("config"));
    fromSeries.current = s !== null;
    return s;
  });
  if (!config)
    return <TypePicker onPick={(s) => { fromSeries.current = false; setConfig(s); }} />;
  const onBack = fromSeries.current ? () => router.back() : () => setConfig(null);
  return <Configurator initialState={config} onBack={onBack} />;
}
