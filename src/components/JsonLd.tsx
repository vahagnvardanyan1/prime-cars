import "server-only";

// Server Component — renders a <script type="application/ld+json"> tag.
// Usage: <JsonLd data={organizationJsonLd()} />
//
// The `server-only` import above makes this a compile-time error if anything
// under a `'use client'` boundary tries to import it. Crawlers parse JSON-LD
// from the initial server HTML; there's no reason to ship it to the client
// bundle, and leaking the factories (which may close over secrets) would be
// a waste at best and a leak at worst.
//
// Pass a single object or an array. When given an array each element is
// emitted as its own <script> so crawlers parse them independently (avoids
// @graph edge cases).

type JsonLdProps = {
  // `data` intentionally untyped — each schema.org JSON-LD has a different shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> | Array<Record<string, any>>;
  id?: string;
};

export const JsonLd = ({ data, id }: JsonLdProps) => {
  const payloads = Array.isArray(data) ? data : [data];
  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={id ? `${id}-${index}` : index}
          type="application/ld+json"
          // JSON.stringify is safe against HTML injection because JSON.stringify
          // escapes quotes but it does NOT escape `<`. Manually escape `</` to
          // avoid an attacker embedding a `</script>` via user-controlled fields.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
};
