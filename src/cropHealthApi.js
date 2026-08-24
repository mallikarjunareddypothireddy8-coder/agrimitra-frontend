// Real crop disease identification — calls crop.kindwise.com through a
// Netlify Function (netlify/functions/crop-health.js) instead of directly
// from the browser, to avoid CORS issues and keep the API key server-side.
// See that file for setup instructions (free, no card).
//
// Throws if the function isn't deployed/configured yet, or the call fails
// for any reason — the DiseaseDetection component catches that and falls
// back to the built-in simulated result automatically, so the feature
// keeps working either way.

// `imageDataUrl` is the base64 data URL from FileReader.readAsDataURL.
// `lang` is the app's current language — kindwise supports disease details
// in Hindi but not Telugu, so Telugu results come back in English (their
// limitation, not something fixable client-side).
export async function identifyCropDisease(imageDataUrl, lang = "en") {
  const res = await fetch("/.netlify/functions/crop-health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl, lang }),
  });
  if (!res.ok) throw new Error(`crophealth_http_${res.status}`);
  const data = await res.json();

  const cropSuggestion = data?.result?.crop?.suggestions?.[0];
  const diseaseSuggestion = data?.result?.disease?.suggestions?.[0];
  if (!diseaseSuggestion) throw new Error("crophealth_no_result");

  const details = diseaseSuggestion.details || {};
  const treatment = details.treatment || {};
  const chemical = Array.isArray(treatment.chemical) ? treatment.chemical : [];
  const biological = Array.isArray(treatment.biological) ? treatment.biological : [];
  const prevention = Array.isArray(treatment.prevention) ? treatment.prevention : [];

  return {
    name: details.local_name || diseaseSuggestion.name || "Unknown issue",
    crop: cropSuggestion?.name || "Unknown crop",
    confidence: Math.round((diseaseSuggestion.probability || 0) * 100),
    // kindwise's crop.health doesn't return a separate "symptoms" field —
    // their compiled `description` is the closest equivalent.
    symptoms: details.description || "Not provided by the identification service for this result.",
    causes: details.description || "Not provided by the identification service for this result.",
    treatment: chemical.length || biological.length
      ? [...chemical, ...biological].join("; ")
      : "No specific treatment listed for this result — see prevention below, or consult a local agriculture officer.",
    medicines: chemical.length ? chemical.join(", ") : "Not specified for this result",
    prevention: prevention.length ? prevention.join("; ") : "Not provided by the identification service for this result.",
    isRealResult: true,
  };
}
