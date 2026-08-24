// Fill this in to match YOUR trained model exactly.
//
// CLASS_NAMES: must be in the exact order Keras assigned during training
// — that's normally alphabetical order of your dataset's folder names.
// Your training script should print this for you, e.g.:
//     print(train_ds.class_names)
// Copy that exact array here, in that exact order. If this order doesn't
// match your trained model, predictions will silently point to the wrong
// class — this is the single most common mistake when deploying a custom
// model, so double-check it against what training actually printed.
export const CLASS_NAMES = [
  // Example placeholders — replace with your real trained class names:
  // "Rice___Leaf_Blast",
  // "Rice___Brown_Spot",
  // "Rice___Healthy",
  // "Cotton___Bacterial_Blight",
  // "Cotton___Healthy",
  // "Tomato___Early_Blight",
  // ...
];

// CLASS_INFO: optional but recommended — one entry per class name above,
// giving the farmer-facing text the app displays (matching the same
// shape as the rest of the app's disease results). Any class you don't
// fill in here still works — it just shows less detail.
export const CLASS_INFO = {
  // "Rice___Leaf_Blast": {
  //   name: "Leaf Blast",
  //   crop: "Rice",
  //   symptoms: "Spindle-shaped grey-centered spots on leaves",
  //   causes: "Fungus Magnaporthe oryzae, favoured by high humidity",
  //   treatment: "Spray Tricyclazole 75% WP @ 0.6g/L",
  //   medicines: "Tricyclazole, Isoprothiolane",
  //   prevention: "Avoid excess nitrogen, use resistant varieties",
  // },
};
