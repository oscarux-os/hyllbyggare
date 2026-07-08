import { Heading, Text } from "../Type";

// Rubrik före inspirationskarusellen.
export default function MaterialColorsHead() {
  return (
    <div className="flex flex-col gap-1 px-2 py-10 md:px-6">
      <Heading level="display-sm" className="max-w-[520px]">
        Hämta inspiration
      </Heading>
      <Text variant="lead" className="text-muted-foreground">
        Se hur andra har byggt sin Anamosa
      </Text>
    </div>
  );
}
