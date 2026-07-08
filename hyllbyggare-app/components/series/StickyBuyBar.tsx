import Link from "next/link";
import { Text } from "../Type";

// Fast köpfält längst ner: frånpris + CTA in i byggaren.
export default function StickyBuyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-2 md:px-6">
        <div className="leading-none">
          <Text variant="caption" className="text-muted-foreground">Från</Text>
          <Text className="font-heading text-xl font-medium leading-6">8.995:-</Text>
        </div>
        <Link
          href="/bygg"
          className="inline-flex h-12 items-center bg-primary px-6 font-body font-semibold text-primary-foreground rounded-button transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          Bygg din egen
        </Link>
      </div>
    </div>
  );
}
