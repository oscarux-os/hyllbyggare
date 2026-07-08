"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
  return buildConfigState(c.category, {
    style: c.style, material: c.material, color: c.color, front: c.front,
    cols: c.cols, heightUnits: c.heightUnits,
  });
}

export default function Studio() {
  const params = useSearchParams();
  const [config, setConfig] = useState<State | null>(() => configFromParam(params.get("config")));
  if (!config) return <TypePicker onPick={setConfig} />;
  return <Configurator initialState={config} onBack={() => setConfig(null)} />;
}
