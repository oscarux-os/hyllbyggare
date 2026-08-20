"use client";

// Valcellerna: rutnätets högra halva i vila.
//
// Varje cell är två saker samtidigt – ingången till ett val OCH kvittot på vad man valt.
// Därför bär den sitt nuvarande värde i klartext och visar det som bild i stor storlek:
// rutnätet ska gå att läsa som en sammanfattning i ett svep, utan att öppna något.
//
// Cellerna har ingen egen radie och ingen ram. Det som skiljer dem åt är 1 px av sidans vita
// fond som lyser igenom `gap-px` – hårstrecken ÄR rutnätet (Figma "v4 Volvo stil konfig").

import { Plus } from "lucide-react";
import type { State } from "@/lib/config";
import { Text } from "@/components/Type";
import { GRID_CELLS, cellMedia, summaryFor, topicDisabled, type TopicId } from "./model";
import OptionMedia from "./OptionMedia";

export default function ValGrid({
  S,
  added,
  onOpen,
}: {
  S: State;
  added: Set<string>;
  onOpen: (id: TopicId) => void;
}) {
  // Ett ämne som inte går att välja visas inte alls. Ett nedtonat kort är fortfarande ett
  // kort: det tar plats i sammanfattningen och ser ut som något man ska kunna trycka på.
  // Handtag på en helt öppen möbel är inte ett val som är avstängt – det är ett val som inte
  // finns, och då hör det inte hemma i listan över vad man har valt.
  const cells = GRID_CELLS.filter((id) => !topicDisabled(S, id));

  return (
    <div className="grid grid-cols-1 gap-px bg-card sm:grid-cols-2 lg:h-full lg:grid-rows-2">
      {cells.map((id, i) => (
        <ValCell
          key={id}
          S={S}
          id={id}
          index={i}
          added={added}
          onOpen={onOpen}
          // Udda antal celler lämnar ett hål i sista raden. Cellen som blir ensam tar hela
          // bredden i stället: rutnätet är en sammanfattning, och en tom ruta läser som att
          // någonting saknas – inte som att det aldrig fanns.
          full={cells.length % 2 === 1 && i === cells.length - 1}
        />
      ))}
    </div>
  );
}

function ValCell({
  S,
  id,
  index,
  added,
  onOpen,
  full = false,
}: {
  S: State;
  id: TopicId;
  index: number;
  added: Set<string>;
  onOpen: (id: TopicId) => void;
  full?: boolean;
}) {
  const sum = summaryFor(S, id, added.size);
  const media = cellMedia(S, id, added);

  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      // Staggern: cellerna stiger in en i taget vid mount. `backwards` behövs – annars står en
      // cell med fördröjning synlig och hoppar till opacity 0 när dess animation startar.
      style={{ animationDelay: `${index * 40}ms` }}
      className={`stagger-in group flex min-h-[240px] flex-col bg-surface p-6 text-left transition-colors duration-fast hover:bg-secondary lg:min-h-0 ${full ? "sm:col-span-2" : ""}`}
    >
      <span className="flex w-full items-start gap-4">
        {/* key på värdet: texten glider upp när valet byts, så cellen kvitterar ändringen */}
        <span key={sum.value} className="copy-enter min-w-0 flex-1">
          <Text as="span" className="block truncate font-medium text-foreground">{sum.title}</Text>
          <Text as="span" variant="small" className="block truncate text-muted-foreground">{sum.value}</Text>
        </span>
        {id === "tillbehor" && <Plus size={24} className="shrink-0 text-foreground" aria-hidden />}
      </span>

      <span className="relative mt-6 block min-h-0 w-full flex-1">
        <OptionMedia
          media={media}
          sizes="(min-width: 1024px) 25vw, 100vw"
          shelfScale={4}
          pad="p-0"
        />
      </span>
    </button>
  );
}
