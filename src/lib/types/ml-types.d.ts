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
