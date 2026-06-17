import topsisConfig from "../data/topsisConfig.json";
import topsisBenchmark from "../data/topsisBenchmark.json";

const { criteria, types, weights } = topsisConfig;

function computeTopsis(matrix) {
  const n = matrix.length;
  const m = criteria.length;

  const norms = new Array(m).fill(0);
  for (let j = 0; j < m; j++) {
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      sumSq += matrix[i][j] ** 2;
    }
    norms[j] = Math.sqrt(sumSq) || 1;
  }

  const weighted = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < m; j++) {
      row.push((matrix[i][j] / norms[j]) * weights[j]);
    }
    weighted.push(row);
  }

  const idealPos = [];
  const idealNeg = [];
  for (let j = 0; j < m; j++) {
    let colMin = Infinity;
    let colMax = -Infinity;
    for (let i = 0; i < n; i++) {
      colMin = Math.min(colMin, weighted[i][j]);
      colMax = Math.max(colMax, weighted[i][j]);
    }
    if (types[j] === "benefit") {
      idealPos.push(colMax);
      idealNeg.push(colMin);
    } else {
      idealPos.push(colMin);
      idealNeg.push(colMax);
    }
  }

  const scores = [];
  for (let i = 0; i < n; i++) {
    let dPos = 0;
    let dNeg = 0;
    for (let j = 0; j < m; j++) {
      dPos += (weighted[i][j] - idealPos[j]) ** 2;
      dNeg += (weighted[i][j] - idealNeg[j]) ** 2;
    }
    dPos = Math.sqrt(dPos);
    dNeg = Math.sqrt(dNeg);
    const total = dPos + dNeg;
    scores.push(total === 0 ? 0 : dNeg / total);
  }

  return scores;
}

export function calculateTopsisForApplicant(applicantFeatures) {
  const benchmarkRows = topsisBenchmark.map((row) =>
    criteria.map((c) => Number(row[c]))
  );

  const applicantRow = criteria.map((c) => Number(applicantFeatures[c]));

  const combined = [...benchmarkRows, applicantRow];
  const scores = computeTopsis(combined);

  const applicantScore = scores[scores.length - 1];

  let ranking = 1;
  for (let i = 0; i < scores.length - 1; i++) {
    if (scores[i] > applicantScore) ranking++;
  }

  return {
    topsis_score: applicantScore,
    ranking,
    total_benchmark: scores.length,
  };
}
