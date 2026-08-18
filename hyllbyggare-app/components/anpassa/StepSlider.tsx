"use client";

// Stegat reglage ur skissen: etikett till vänster, en skåra delad i lika segment med en prick
// vid varje stopp, och det valda värdet i en flytande chip ovanpå skåran.
//
// Interaktionen ligger i ett genomskinligt <input type="range"> ovanpå. Det ger drag, touch,
// piltangenter och rätt roll/aria gratis – att bygga om det för hand blir alltid sämre.

import { Text } from "@/components/Type";

// Skåran dras in i båda ändar. Chippen är centrerad över sitt stopp, så utan indraget skulle
// den hänga ut över kortkanten vid första och sista värdet. Indraget gäller linjen, prickarna,
// chippen OCH inputen, annars pekar man på ett annat ställe än det man ser.
const INSET = 28;

export default function StepSlider({
  label,
  value,
  min,
  max,
  format,
  onSet,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  /** Värdet som text i chippen, t.ex. 4 → "155 cm". */
  format: (v: number) => string;
  onSet: (v: number) => void;
}) {
  const steps = max - min;
  // Andelen av skåran där ett stopp ligger. Ett enda stopp → centrera.
  const frac = (v: number) => (steps > 0 ? (v - min) / steps : 0.5);
  // Position inom den indragna skåran.
  const posOf = (v: number) => `calc(${INSET}px + ${frac(v)} * (100% - ${INSET * 2}px))`;

  return (
    <div className="flex items-center gap-4 p-6">
      <Text as="span" className="w-16 shrink-0 text-foreground">{label}</Text>
      <div className="relative h-6 flex-1">
        {/* skåran */}
        <span
          aria-hidden
          className="absolute top-1/2 h-px -translate-y-1/2 bg-foreground"
          style={{ left: INSET, right: INSET }}
        />
        {/* stoppen */}
        {Array.from({ length: steps + 1 }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{ left: posOf(min + i) }}
          />
        ))}
        {/* värdet – chippen döljer stoppet den står på, precis som i skissen */}
        <span
          aria-hidden
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border border-border bg-card px-2 py-1 font-body text-base font-medium leading-none text-foreground transition-[left] duration-base ease-default"
          style={{ left: posOf(value) }}
        >
          {format(value)}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-label={label}
          onChange={(e) => onSet(Number(e.target.value))}
          style={{ left: INSET - 12, right: INSET - 12 }}
          className="absolute top-0 h-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
        />
      </div>
    </div>
  );
}
