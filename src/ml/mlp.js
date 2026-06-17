import creditModel from "../data/creditModel.json";

const { layers } = creditModel.mlp;

function relu(x) {
  return x > 0 ? x : 0;
}

function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

export function runMLP(inputVector) {
  let current = inputVector;

  for (let i = 0; i < layers.length; i++) {
    const { weights, biases } = layers[i];
    const isLast = i === layers.length - 1;

    const output = new Array(biases.length).fill(0);

    for (let j = 0; j < biases.length; j++) {
      let sum = biases[j];
      for (let k = 0; k < current.length; k++) {
        sum += current[k] * weights[k][j];
      }
      output[j] = isLast ? sum : relu(sum);
    }

    current = output;
  }

  return softmax(current);
}
