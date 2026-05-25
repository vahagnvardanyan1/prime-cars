// Build an SEO-friendly slug segment for car detail URLs.
// Example: slugifyCar(2021, "Toyota", "RAV4") -> "2021-toyota-rav4"
// We append the raw ID separately in the URL to guarantee uniqueness:
// /cars/2021-toyota-rav4-<id>

const ARMENIAN_TO_LATIN: Record<string, string> = {
  ա: "a", բ: "b", գ: "g", դ: "d", ե: "e", զ: "z", է: "e", ը: "y",
  թ: "t", ժ: "zh", ի: "i", լ: "l", խ: "kh", ծ: "ts", կ: "k", հ: "h",
  ձ: "dz", ղ: "gh", ճ: "ch", մ: "m", յ: "y", ն: "n", շ: "sh", ո: "o",
  չ: "ch", պ: "p", ջ: "j", ռ: "r", ս: "s", վ: "v", տ: "t", ր: "r",
  ց: "ts", ու: "u", փ: "p", ք: "q", օ: "o", ֆ: "f",
};

const RUSSIAN_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const transliterate = (input: string): string => {
  let output = input.toLowerCase();
  // Armenian digraphs first (just "ու")
  for (const [src, dest] of Object.entries(ARMENIAN_TO_LATIN)) {
    if (src.length > 1) {
      output = output.replace(new RegExp(src, "g"), dest);
    }
  }
  return output
    .split("")
    .map((ch) => ARMENIAN_TO_LATIN[ch] ?? RUSSIAN_TO_LATIN[ch] ?? ch)
    .join("");
};

const slugify = (input: string): string =>
  transliterate(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const slugifyCar = (
  year: number | string | undefined,
  brand: string | undefined,
  model: string | undefined,
): string => {
  const parts = [year, brand, model].filter(Boolean).map(String).join(" ");
  return slugify(parts) || "car";
};

// Build the canonical car detail path (locale-agnostic, to be combined with locale prefix).
export const carDetailPath = (
  id: string,
  year?: number | string,
  brand?: string,
  model?: string,
): string => {
  const slug = slugifyCar(year, brand, model);
  return `/cars/${slug}-${id}`;
};

// Matches a standard UUID v1-v5 (8-4-4-4-12 hex), anchored to end of string.
// The backend's id format is opaque to us — if it emits UUIDs the raw
// "last-dash segment" approach would lose most of the UUID to the slug.
const UUID_TAIL_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Extract the raw car ID from a slug-suffixed segment. Handles three cases:
//   - UUIDs (which contain dashes): "2021-toyota-rav4-550e8400-e29b-41d4-a716-446655440000"
//   - Simple IDs after the last dash: "2021-toyota-rav4-abc123"
//   - Raw id with no slug prefix: "abc123"
export const extractCarIdFromSlug = (segment: string): string => {
  const decoded = decodeURIComponent(segment);

  const uuidMatch = decoded.match(UUID_TAIL_REGEX);
  if (uuidMatch) return uuidMatch[0];

  const lastDash = decoded.lastIndexOf("-");
  if (lastDash === -1) return decoded;
  const candidate = decoded.slice(lastDash + 1);
  return candidate.length > 0 ? candidate : decoded;
};
