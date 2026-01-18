import { createClient } from "@supabase/supabase-js";
import * as countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

const BLOCKED_COUNTRIES = new Set(["RU", "BY", "CU", "IR", "KP", "SY"]);

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
    process.exit(1);
  }

const supabase = createClient(url, serviceRoleKey);

  const countryNames = countries.getNames("en", { select: "official" }) as Record<
    string,
    string
  >;

  // Fetch existing iso_codes to compute insert vs update counts
const { data: existingRows, error: existingError } = await supabase
  .from("countries")
  .select("iso_code");

  if (existingError) {
    console.error("Failed to read existing countries:", existingError.message);
    process.exit(1);
  }

const existingIsoCodes = new Set(
  (existingRows ?? []).map((row: { iso_code: string }) => row.iso_code)
);

const rows: { iso_code: string; name: string; is_supported: boolean }[] = Object.entries(countryNames).map(([iso, name]) => {
  const isoCode = iso.toUpperCase();

  return {
    iso_code: isoCode,
    name,
      is_supported: !BLOCKED_COUNTRIES.has(isoCode),
    };
  });

const { error: upsertError } = await supabase
  .from("countries")
  .upsert(rows, {
    onConflict: "iso_code",
  });

  if (upsertError) {
    console.error("Upsert failed:", upsertError.message);
    process.exit(1);
  }

  const insertedCount = rows.filter((row) => !existingIsoCodes.has(row.iso_code)).length;
  const updatedCount = rows.length - insertedCount;

  console.log(
    `Countries upsert complete. Inserted: ${insertedCount}, Updated: ${updatedCount}. Total processed: ${rows.length}.`
  );
}

main().catch((err) => {
  console.error("Unexpected error seeding countries:", err);
  process.exit(1);
});
