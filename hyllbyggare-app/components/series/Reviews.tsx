"use client";

import { useState } from "react";
import { Star, StarHalf, ShieldCheck } from "lucide-react";
import { Heading, Text } from "../Type";
import { RATING, RATING_BARS, AI_SUMMARY, REVIEWS, type Review } from "./data";

const DISCLAIMER =
  "Vi visar omdömen oavsett betyg och säkerställer att alla recensioner uteslutande skrivs av kunder som har köpt varan. Det görs med hjälp av Trustvoice som administrerar betyg och recensioner.";

// Svarta, ifyllda stjärnor (monokrom design). Stödjer halvstjärna för snittbetyg.
function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center" role="img" aria-label={`${value} av 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < full) return <Star key={i} size={size} className="fill-foreground text-foreground" />;
        if (i === full && half) return <StarHalf key={i} size={size} className="fill-foreground text-foreground" />;
        return <Star key={i} size={size} className="text-border" />;
      })}
    </span>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="py-6">
      <StarRating value={r.stars} />
      <Text className="mt-3">{r.text}</Text>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 font-body text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{r.name}</span>
        <span aria-hidden>·</span>
        <span>{r.date}</span>
      </div>
      <Text variant="small" className="mt-1 text-muted-foreground">{r.variant}</Text>
      {r.reply && (
        <div className="mt-4 border-l-2 border-border bg-secondary p-4">
          <Text variant="small" className="font-semibold">{r.reply.author}</Text>
          <Text variant="small" className="mt-1 text-muted-foreground">{r.reply.text}</Text>
        </div>
      )}
    </article>
  );
}

export default function Reviews() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? REVIEWS : REVIEWS.slice(0, 2);

  return (
    <section aria-label="Recensioner" className="mx-auto max-w-[1200px] px-2 py-16 md:px-6 md:py-20">
      <Heading level="display-sm">Upptäck varför så många väljer Anamosa</Heading>
      <Text className="mt-4 max-w-3xl text-muted-foreground">{DISCLAIMER}</Text>

      <div className="mt-10 grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        {/* Sammanfattning */}
        <div className="flex flex-col gap-8">
          <div className="border border-border p-6">
            <div className="flex items-center gap-3">
              <span className="font-heading text-5xl font-medium leading-none tracking-tight md:text-6xl">{RATING.score}</span>
              <StarRating value={RATING.value} size={22} />
            </div>
            <Text variant="small" className="mt-2 text-muted-foreground">Baserat på {RATING.count} betyg</Text>

            <div className="mt-5 flex flex-col gap-1.5">
              {RATING_BARS.map((b) => (
                <div key={b.stars} className="flex items-center gap-2">
                  <span className="w-3 text-right font-body text-sm">{b.stars}</span>
                  <Star size={12} className="fill-foreground text-foreground" />
                  <div className="h-1.5 flex-1 bg-secondary">
                    <div className="h-full bg-foreground" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Text className="font-semibold">Våra kunder säger</Text>
            <Text className="mt-2 text-muted-foreground">{AI_SUMMARY}</Text>
            <Text variant="caption" className="mt-2 text-muted-foreground">
              AI-genererad sammanfattning av produktens kundrecensioner
            </Text>
            <div className="mt-4 flex items-center gap-1.5 font-body text-sm text-muted-foreground">
              <ShieldCheck size={16} />
              Verified by Trustvoice
            </div>
          </div>
        </div>

        {/* Recensionslista */}
        <div>
          <div className="flex flex-col divide-y divide-border">
            {shown.map((r) => (
              <ReviewCard key={r.name + r.date} r={r} />
            ))}
          </div>
          {REVIEWS.length > 2 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-6 inline-flex h-12 items-center border border-foreground px-6 font-body font-semibold rounded-button transition-colors duration-fast hover:bg-accent"
            >
              {expanded ? "Visa färre recensioner" : "Visa fler recensioner"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
