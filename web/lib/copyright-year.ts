import { cacheLife } from "next/cache";

// Public presentation data only; never cache member or session data here.
export async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
