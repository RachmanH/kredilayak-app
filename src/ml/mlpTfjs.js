import * as tf from "@tensorflow/tfjs";

let model = null;
let loading = null;

export async function loadModel() {
  if (model) return model;
  if (loading) return loading;
  loading = tf.loadLayersModel("/tfjs_model/model.json").then((m) => {
    model = m;
    return m;
  });
  return loading;
}

export function isModelLoaded() {
  return model !== null;
}

export async function runMLP(inputVector) {
  const m = await loadModel();
  return tf.tidy(() => {
    const input = tf.tensor2d([inputVector]);
    const output = m.predict(input);
    return Array.from(output.dataSync());
  });
}
