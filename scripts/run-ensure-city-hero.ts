import { ensureCityHeroImage } from "@/lib/images/city-hero";

async function run() {
  const cityId = process.argv[2];
  if (!cityId) {
    console.error("Usage: ts-node scripts/run-ensure-city-hero.ts <cityId>");
    process.exit(1);
  }

  await ensureCityHeroImage(cityId);
  console.log(`ensureCityHeroImage completed for city ${cityId}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

