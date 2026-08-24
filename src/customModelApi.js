// Real crop disease identification using YOUR OWN model, trained on
// Kaggle (free GPU, free datasets) and run entirely in the browser via
// TensorFlow.js. This is the most sustainable "real" option in the whole
// app: no API key, no per-request cost, no CORS, no ongoing service to
// keep paying for — once it's trained and the files are in place, it
// just works, forever, for free.
//
// FULL PATH TO GET HERE (see README.md for the complete walkthrough):
//   1. Train a model on Kaggle using a free GPU notebook (kaggle.com/code)
//   2. Convert it to TensorFlow.js format (tensorflowjs_converter)
//   3. Download the converted folder — it contains a `model.json` and one
//      or more `.bin` weight files
//   4. Put those files in this project at: public/model/
//      (so the final path looks like public/model/model.json)
//   5. Copy the exact list of class names your model was trained on (in
//      the exact order Keras assigned them — printed by the training
//      script as `class_names`) into src/customModelClasses.js
//   6. Restart the dev server / rebuild — the app will automatically pick
//      up the model files and use this real, local model FIRST, before
//      even trying crop.health
//
// Until public/model/model.json exists, loading fails gracefully and the
// app falls through to crop.health (if configured) or the simulation —
// nothing breaks in the meantime.

import { CLASS_NAMES, CLASS_INFO } from "./customModelClasses.js";

let modelPromise = null;
let tfPromise = null;

function loadTf() {
  if (!tfPromise) tfPromise = import("@tensorflow/tfjs");
  return tfPromise;
}

function loadModel() {
  if (!modelPromise) {
    modelPromise = loadTf().then((tf) => tf.loadLayersModel("/model/model.json"));
  }
  return modelPromise;
}

// Quick check used by the UI to decide whether to even attempt loading —
// avoids a console error on every scan for people who haven't trained a
// model yet.
export async function customModelAvailable() {
  try {
    const res = await fetch("/model/model.json", { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// `imageEl` is an HTMLImageElement (already loaded/rendered) containing
// the photo to classify — the DiseaseDetection component creates this
// from the same data URL used for the preview.
export async function identifyWithCustomModel(imageEl) {
  const tf = await loadTf();
  const model = await loadModel();

  const prediction = tf.tidy(() => {
    // Standard MobileNetV2-style preprocessing: resize to 224x224, scale
    // pixel values to [-1, 1]. If your training script used a different
    // input size or normalization, update this to match exactly, or
    // results will be meaningless even though nothing "errors."
    const img = tf.browser.fromPixels(imageEl).resizeNearestNeighbor([224, 224]).toFloat();
    const normalized = img.sub(127.5).div(127.5).expandDims(0);
    return model.predict(normalized);
  });

  const scores = await prediction.data();
  prediction.dispose();

  let bestIdx = 0;
  for (let i = 1; i < scores.length; i++) if (scores[i] > scores[bestIdx]) bestIdx = i;

  const className = CLASS_NAMES[bestIdx] || `class_${bestIdx}`;
  const confidence = Math.round(scores[bestIdx] * 100);
  const info = CLASS_INFO[className] || {};

  return {
    name: info.name || className.replace(/_/g, " "),
    crop: info.crop || className.split("___")[0]?.replace(/_/g, " ") || "Unknown crop",
    confidence,
    symptoms: info.symptoms || "Not documented yet — add an entry for this class in customModelClasses.js.",
    causes: info.causes || "Not documented yet — add an entry for this class in customModelClasses.js.",
    treatment: info.treatment || "Not documented yet — add an entry for this class in customModelClasses.js.",
    medicines: info.medicines || "Not specified",
    prevention: info.prevention || "Not documented yet — add an entry for this class in customModelClasses.js.",
    isRealResult: true,
    isLocalModel: true,
  };
}
