# AgriMitra

AgriMitra is a farmer-facing agriculture platform with phone-OTP login, dashboard, AI assistant, crop disease scanning, live weather, shop locator, market prices, crop advisory, soil information, government schemes, notifications, reports, profile, settings, dark mode, and English/Telugu/Hindi support.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

For local Netlify Functions testing, install the CLI and run:

```bash
npm install -g netlify-cli
netlify dev
```

Use `netlify dev` when testing the AI assistant or the crop-disease proxy locally. The frontend itself is a Vite + React application, and `netlify.toml` already points Netlify to `dist` and `netlify/functions`.

## Real crop-disease detection

The disease-scan screen is connected to a trained FastAPI model through `netlify/functions/crop-health.js`. The flow is:

```text
Browser image upload
        ↓
/.netlify/functions/crop-health
        ↓
FastAPI /crop-health
        ↓
MobileNetV3-Small classifier
        ↓
Structured crop, disease, confidence, treatment, and prevention response
```

The backend model covers six crops: chilli, cotton, groundnut, maize, rice, and tomato. It returns a low-confidence result instead of forcing a diagnosis when confidence is insufficient. The interface should continue to use the wording **possible disease** and should encourage local agriculture-officer confirmation before spraying.

### Netlify configuration

1. Deploy the FastAPI backend to Cloud Run or another HTTPS host.
2. Copy the backend URL without a trailing slash.
3. In Netlify, open **Site configuration → Environment variables**.
4. Add:

```text
CROP_HEALTH_API_URL=https://your-fastapi-service.example.com
```

5. Redeploy the frontend.

The frontend request in `src/cropHealthApi.js` already sends `{ image, lang }` to `/.netlify/functions/crop-health`, so no client-side API key is required. The Netlify Function forwards the request to the FastAPI service and preserves the response shape expected by the disease-scan component.

### Direct frontend integration alternative

If you prefer to call the backend directly from the browser, change the API client to use a Vite variable such as `VITE_CROP_HEALTH_API_URL`. The backend must then allow `https://agriraksha.netlify.app` in `CORS_ORIGINS`. The Netlify proxy is recommended because it preserves the current frontend contract and avoids exposing deployment details in the browser.

## Real AI assistant

The AI assistant runs through `netlify/functions/ai-assistant.js` and reads `GEMINI_API_KEY` from Netlify server-side environment variables. Do not place this key in a `VITE_` variable or commit it to the repository.

## Firebase setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
2. Enable the required authentication method.
3. Create Firestore and configure the security rules before production use.
4. Add a Firebase Web App and copy its configuration values into a local `.env` file using `.env.example` as a template.
5. Add the live Netlify domain under Firebase Authentication authorized domains.

## Google Places setup

The shop locator can use the optional Places API for exact listings and directions. Enable the required Places API in Google Cloud, create a restricted browser key, and set `VITE_GOOGLE_PLACES_API_KEY` locally and in Netlify. Apply domain and API restrictions before using the key in production.

## Build and publish

```bash
npm run build
```

This creates the `dist/` folder. For a stable deployment, connect the project repository to Netlify and use:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
|

Netlify environment variables must be configured in the Netlify dashboard because `.env` files should not be committed. After changing `CROP_HEALTH_API_URL` or any other production variable, trigger a new deploy.

## Google Search visibility

The public landing page is rendered by the React application, but the current project still needs production SEO metadata and indexing setup. Before requesting indexing, add a descriptive title, meta description, canonical URL, Open Graph tags, `robots.txt`, and `sitemap.xml`. Then verify the site in [Google Search Console](https://search.google.com/search-console), submit the sitemap, and request indexing for the canonical homepage URL.

Google Search visibility is not immediate or guaranteed. The site must be publicly accessible, crawlable, useful, and free of blocking authentication for the pages intended to appear in search results. Private dashboard screens should not be indexed.

## Safety and accuracy notes

The crop model is a research baseline trained from the published [15 Crop and 45 Disease and Healthy dataset](https://data.mendeley.com/datasets/8fr7grr73p/1). It achieved 88.06% accuracy on its held-out source-dataset test split, but this number is not field-photo accuracy. Collect independent phone-camera images from the intended regions before presenting the system as production-ready. Do not show pesticide dosage instructions unless they have been reviewed against current local agricultural guidance.

Market prices and government-scheme details remain reference or sample data unless connected to verified official sources. Users should confirm time-sensitive agricultural decisions locally.

## Known gaps

Chat history is currently part of the general activity feed rather than a separate dedicated tab. Market Prices currently shows reference values rather than a verified multi-market comparison. Voice interaction is available for assistant chat but is not an app-wide navigation command system. Password reset is not applicable to the current phone-OTP flow.
