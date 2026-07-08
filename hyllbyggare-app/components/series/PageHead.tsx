import { Heading } from "../Type";

// Sidhuvud med serietitel.
export default function PageHead() {
  return (
    <header className="py-6">
      <Heading level="display-sm" as="h1" className="max-w-[680px]">
        Förvaring som formar sig efter ditt hem
      </Heading>
    </header>
  );
}
