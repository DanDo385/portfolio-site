/**
 * Renders a single JSON-LD <script> tag. Callers are responsible for keeping the
 * `data` object accurate and derived from real content (see lib/content.ts /
 * lib/constants.ts); this component does not validate or invent fields.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
