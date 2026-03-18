import { predictPlacement, createEmptyProfile } from "../src/lib/ml/placement-ml-engine";
try {
  const profile = createEmptyProfile();
  const res = predictPlacement(profile);
  console.log("Success:", res.probability);
} catch(e) {
  console.error("ERROR CAUGHT:");
  console.error(e);
}
