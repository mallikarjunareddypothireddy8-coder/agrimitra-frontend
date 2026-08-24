# AgriMitra Deployment Guide

This guide takes the patched AgriMitra frontend from the downloaded ZIP to a public deployment connected to the real crop-disease backend.

## 1. Prepare the two project folders

Unzip `smart_kisan_backend.zip` into one folder and this patched frontend ZIP into another. The backend folder contains the trained checkpoint at `artifacts/crop_disease_mobilenetv3.pt`. The frontend folder contains the updated disease API proxy at `netlify/functions/crop-health.js` and the SEO files in `public/`.

## 2. Test the backend locally

From the backend folder, install dependencies and start FastAPI:

```bash
python3 -m pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

In a second terminal, check:

```bash
curl http://127.0.0.1:8000/health
```

The response should contain `"ok": true`, `"model_loaded": true`, and `"classes": 18`.

## 3. Test the frontend locally

From the frontend folder:

```bash
npm install
npm run dev
```

The page should load at the Vite URL. The disease scan will not reach the local FastAPI server through the production Netlify Function unless you use Netlify Dev or temporarily change the proxy URL for local testing. For a production-like local test, install the Netlify CLI and use:

```bash
npm install -g netlify-cli
netlify dev
```

Set `CROP_HEALTH_API_URL=http://127.0.0.1:8000` in the environment used by Netlify Dev. Upload a real leaf image and confirm that the response is a model result or the explicit low-confidence state, never a silently simulated diagnosis.

## 4. Deploy the backend

The recommended production target is a container host such as Google Cloud Run. From the backend folder:

```bash
docker build -t smart-kisan-crop-health .
docker run --rm -p 8080:8080 smart-kisan-crop-health
```

Once the container works locally, push it to a container registry and deploy it to Cloud Run. Configure the service to listen on the platform `PORT`, keep one worker per container, and set:

```text
CORS_ORIGINS=https://agriraksha.netlify.app
REJECT_THRESHOLD=0.85
REJECT_MARGIN=0.15
```

The result should be an HTTPS URL such as `https://smart-kisan-crop-health-xxxxx.a.run.app`. Test it before connecting the frontend:

```bash
curl https://YOUR_BACKEND_DOMAIN/health
```

Do not publish the service URL until `/health` returns a loaded model. Protect the service with authentication or rate limiting if it will not be public.

## 5. Connect Netlify to the backend

In the Netlify dashboard for the AgriMitra site, open **Site configuration → Environment variables** and add:

```text
CROP_HEALTH_API_URL=https://YOUR_BACKEND_DOMAIN
```

Do not add a trailing slash. The patched Netlify Function will forward the existing frontend request to `YOUR_BACKEND_DOMAIN/crop-health`, so the React disease-scan code does not need a new browser-side API key.

Trigger a new Netlify deploy. Open the site, enter the Disease Scan screen, upload a leaf photo, and verify the result shows a real-model response. If the response is low confidence, the interface should say that no reliable diagnosis was generated rather than displaying a fabricated disease.

## 6. Deploy the frontend

For a Git-connected Netlify deployment, commit the patched frontend source and configure:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
|

Alternatively, use Netlify Drop for a static preview, but the real disease proxy requires the `netlify/functions` folder and the `CROP_HEALTH_API_URL` environment variable, so a repository-connected deployment is preferred.

## 7. Verify production end to end

Run the following checks in order:

| Check | Expected result |
|---|---|
| `https://YOUR_BACKEND_DOMAIN/health` | Model is loaded and 18 classes are available |
| `https://agriraksha.netlify.app/` | Public landing page loads over HTTPS |
| `https://agriraksha.netlify.app/robots.txt` | Robots file is visible and names the sitemap |
| `https://agriraksha.netlify.app/sitemap.xml` | Sitemap contains the canonical homepage URL |
| Disease Scan upload | Real response, or explicit low-confidence response |
| Browser developer console | No CORS or proxy errors |
|

## 8. Google Search setup

Google Search visibility requires a public, crawlable page; it is not guaranteed immediately after deployment. In [Google Search Console](https://search.google.com/search-console), add and verify the property `https://agriraksha.netlify.app`, submit `https://agriraksha.netlify.app/sitemap.xml`, and request indexing for the homepage. The patched frontend includes a title, description, canonical URL, Open Graph metadata, JSON-LD WebApplication data, robots.txt, and sitemap.xml.

Keep authenticated dashboard screens out of search results. The public homepage is the page intended for indexing. Add useful text describing the service, supported crops, the intended farmer audience, and the limitation that AI disease results are preliminary and should be confirmed locally.

## 9. Before calling it production-ready

The current model is a real trained baseline, but its reported 88.06% test accuracy comes from a held-out split of the same published source dataset. Collect a separate field-photo validation set from the regions and phone cameras where AgriMitra will be used. Re-tune the confidence threshold with those images and have local agronomy experts review the disease labels and any treatment guidance before relying on the system for spraying decisions.
