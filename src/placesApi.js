// Real nearby shop search via the Google Places API (New) — this is what
// makes "Navigate" point to an ACTUAL business with its own map pin and
// exact turn-by-turn directions, instead of a generic category search.
//
// SETUP (~5 minutes):
//   1. Go to https://console.cloud.google.com — use the SAME project your
//      Firebase project already created (Firebase projects are Google
//      Cloud projects underneath), or create a new one
//   2. APIs & Services > Enable APIs and services > search "Places API
//      (New)" > Enable
//   3. This requires a billing account on the project (the standard Google
//      Cloud "Blaze"-equivalent step) — Google gives a recurring free
//      monthly credit that comfortably covers normal testing/small-app use
//   4. APIs & Services > Credentials > Create credentials > API key
//   5. Click the new key > restrict it: under "API restrictions" limit it
//      to "Places API (New)" only, and under "Application restrictions"
//      add your site's domain (and localhost while developing) so the key
//      can't be reused elsewhere if it leaks
//   6. Add it to your `.env` as VITE_GOOGLE_PLACES_API_KEY
//
// Until this is set, ShopLocator automatically falls back to its existing
// category-search links — nothing breaks in the meantime.

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

export const placesApiReady = Boolean(import.meta.env.VITE_GOOGLE_PLACES_API_KEY);

// query e.g. "fertilizer shop", "seed shop"; lat/lng is the farmer's real location
export async function searchNearbyShops(query, lat, lng, radiusMeters = 8000) {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("places_api_not_configured");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.internationalPhoneNumber",
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusMeters } },
    }),
  });

  if (!res.ok) throw new Error(`places_http_${res.status}`);
  const data = await res.json();
  return (data.places || []).map((p) => ({
    id: p.id,
    name: p.displayName?.text || query,
    address: p.formattedAddress || "",
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    rating: p.rating || null,
    phone: p.internationalPhoneNumber || null,
  }));
}

// Directions to one exact real place — uses its place_id, so the route
// goes to the genuine business, not an approximate coordinate.
export function directionsUrl(place, originLat, originLng) {
  const base = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${place.lat},${place.lng}&travelmode=driving`;
  return place.id ? `${base}&destination_place_id=${place.id}` : base;
}
