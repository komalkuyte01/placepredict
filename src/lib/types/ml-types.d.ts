/**
 * Ambient type declarations for ML libraries that lack native TypeScript types.
 */

declare module "ml-logistic-regression" {
  import { Matrix } from "ml-matrix";

  interface LogisticRegressionOptions {
    numSteps?: number;
    learningRate?: number;
  }

  /** Result may be a Matrix, number[], or scalar depending on the library version. */
  type PredictionResult = Matrix | number[] | number;

  export default class LogisticRegression {
    constructor(options?: LogisticRegressionOptions);
    train(features: Matrix, labels: Matrix): void;
    predict(features: Matrix): PredictionResult;
  }
}

declare module "ml-random-forest" {
  interface RandomForestOptions {
    nEstimators?: number;
    maxFeatures?: number;
    replacement?: boolean;
    seed?: number;
  }

  export class RandomForestClassifier {
    constructor(options?: RandomForestOptions);
    train(features: number[][], labels: number[]): void;
    predict(features: number[][]): number[];
    predictionValues?: number[][];
  }
}

declare module "ml-knn" {
  interface KNNOptions {
    k?: number;
  }

  export default class KNN {
    constructor(dataset: number[][], labels: number[], options?: KNNOptions);
    predict(samples: number[][]): number[];
  }
}

declare module "ml-kmeans" {
  interface KMeansOptions {
    initialization?: "random" | "kmeans++";
    seed?: number;
  }

  interface KMeansResult {
    clusters: number[];
    centroids: number[][];
    iterations: number;
  }

  export function kmeans(
    data: number[][],
    k: number,
    options?: KMeansOptions,
  ): KMeansResult;
}
