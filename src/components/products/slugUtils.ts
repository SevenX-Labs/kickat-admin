/**
 * Professional URL slug generator.
 * Handles apostrophes, ampersands, punctuation, and multiple spaces cleanly.
 * Example: "Kickat Dog's Chew Stick & Treats!" -> "kickat-dogs-chew-stick-and-treats"
 */
export function slugify(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "") // Remove apostrophes (e.g. Dog's -> dogs)
    .replace(/&/g, "-and-") // Replace & with -and-
    .replace(/[^a-z0-9]+/g, "-") // Replace any non-alphanumeric with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Professional SKU / Product Code generator.
 * Formats:
 * - With Product Name: KKT-[PROD_PREFIX]-[OPTION_CODE]-[INDEX]
 * - Example: Product "Kickat Dog Chew Stick", Option "Red", Index 1 -> "KKT-DOG-CHEW-RED-01"
 * - Example: Product "Maxi Puppy", Option "1.5 kg", Index 2 -> "KKT-MAXI-PUPP-1.5KG-02"
 */
export function generateProductSku(
  productName: string,
  optionName: string,
  index?: number
): string {
  const cleanOption = (optionName || "")
    .toUpperCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/\s*(KG|G|GM|GMS|LBS|OZ|ML|L|LTR)\b/gi, "$1") // tighten units like "1.5 KG" -> "1.5KG"
    .replace(/[^A-Z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const productWords = (productName || "")
    .toUpperCase()
    .replace(/['’]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w && !["A", "AN", "THE", "AND", "FOR", "WITH", "OF", "IN", "TO"].includes(w));

  let prefix = "KKT";
  if (productWords.length > 0) {
    const effectiveWords = productWords[0] === "KICKAT" ? productWords.slice(1) : productWords;
    if (effectiveWords.length >= 2) {
      prefix = `KKT-${effectiveWords[0].slice(0, 4)}-${effectiveWords[1].slice(0, 4)}`;
    } else if (effectiveWords.length === 1) {
      prefix = `KKT-${effectiveWords[0].slice(0, 5)}`;
    }
  }

  const idxPart = typeof index === "number" && index > 0 ? `-${String(index).padStart(2, "0")}` : "";

  if (!cleanOption) {
    return `${prefix}${idxPart}`;
  }

  return `${prefix}-${cleanOption}${idxPart}`;
}
