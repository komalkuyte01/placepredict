// Generate realistic placement training data based on Indian engineering placement patterns
// This generates 300 curated records across 5 student archetypes

const records = [];

function rand(min, max) {
  return min + Math.random() * (max - min);
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Archetype generators
// Features order: cgpa, backlogs, tenth, twelfth, branchRelevant, techSkills, dsaLevel, projects, hasInternship, certs, hackathons, openSource, atsScore, aptitude, communication, mockInterview, english

function highPerformer() {
  const cgpa = clamp(rand(8.5, 10), 0, 10);
  const backlogs = 0;
  const tenth = clamp(rand(85, 99), 0, 100);
  const twelfth = clamp(rand(82, 98), 0, 100);
  const branchRelevant = Math.random() > 0.1 ? 1 : 0;
  const techSkills = randInt(4, 6);
  const dsaLevel = Math.random() > 0.2 ? 3 : 2; // 3=Advanced, 2=Intermediate
  const projects = randInt(3, 7);
  const hasInternship = 1;
  const certs = randInt(2, 5);
  const hackathons = randInt(2, 6);
  const openSource = Math.random() > 0.3 ? 1 : 0;
  const atsScore = clamp(rand(78, 98), 0, 100);
  const aptitude = clamp(rand(80, 98), 0, 100);
  const communication = clamp(rand(7, 10), 1, 10);
  const mockInterview = clamp(rand(7, 10), 1, 10);
  const english = clamp(rand(7, 10), 1, 10);
  const placed = Math.random() > 0.1 ? 1 : 0; // 90% placed
  return {
    features: [
      cgpa,
      backlogs,
      tenth,
      twelfth,
      branchRelevant,
      techSkills,
      dsaLevel,
      projects,
      hasInternship,
      certs,
      hackathons,
      openSource,
      atsScore,
      aptitude,
      communication,
      mockInterview,
      english,
    ],
    label: placed,
  };
}

function aboveAverage() {
  const cgpa = clamp(rand(7.0, 8.5), 0, 10);
  const backlogs = Math.random() > 0.85 ? 1 : 0;
  const tenth = clamp(rand(72, 92), 0, 100);
  const twelfth = clamp(rand(70, 90), 0, 100);
  const branchRelevant = Math.random() > 0.2 ? 1 : 0;
  const techSkills = randInt(3, 5);
  const dsaLevel = Math.random() > 0.4 ? 2 : Math.random() > 0.5 ? 3 : 1; // mostly Intermediate
  const projects = randInt(2, 5);
  const hasInternship = Math.random() > 0.3 ? 1 : 0;
  const certs = randInt(1, 3);
  const hackathons = randInt(1, 3);
  const openSource = Math.random() > 0.6 ? 1 : 0;
  const atsScore = clamp(rand(65, 88), 0, 100);
  const aptitude = clamp(rand(65, 88), 0, 100);
  const communication = clamp(rand(6, 9), 1, 10);
  const mockInterview = clamp(rand(5.5, 8.5), 1, 10);
  const english = clamp(rand(6, 9), 1, 10);
  const placed = Math.random() > 0.3 ? 1 : 0; // 70% placed
  return {
    features: [
      cgpa,
      backlogs,
      tenth,
      twelfth,
      branchRelevant,
      techSkills,
      dsaLevel,
      projects,
      hasInternship,
      certs,
      hackathons,
      openSource,
      atsScore,
      aptitude,
      communication,
      mockInterview,
      english,
    ],
    label: placed,
  };
}

function average() {
  const cgpa = clamp(rand(6.0, 7.5), 0, 10);
  const backlogs = Math.random() > 0.7 ? randInt(1, 2) : 0;
  const tenth = clamp(rand(60, 82), 0, 100);
  const twelfth = clamp(rand(58, 80), 0, 100);
  const branchRelevant = Math.random() > 0.35 ? 1 : 0;
  const techSkills = randInt(2, 4);
  const dsaLevel = Math.random() > 0.5 ? 1 : 2; // mostly Basic
  const projects = randInt(1, 3);
  const hasInternship = Math.random() > 0.55 ? 1 : 0;
  const certs = randInt(0, 2);
  const hackathons = randInt(0, 2);
  const openSource = Math.random() > 0.8 ? 1 : 0;
  const atsScore = clamp(rand(50, 75), 0, 100);
  const aptitude = clamp(rand(50, 75), 0, 100);
  const communication = clamp(rand(4.5, 7.5), 1, 10);
  const mockInterview = clamp(rand(4, 7), 1, 10);
  const english = clamp(rand(5, 8), 1, 10);
  const placed = Math.random() > 0.55 ? 1 : 0; // 45% placed
  return {
    features: [
      cgpa,
      backlogs,
      tenth,
      twelfth,
      branchRelevant,
      techSkills,
      dsaLevel,
      projects,
      hasInternship,
      certs,
      hackathons,
      openSource,
      atsScore,
      aptitude,
      communication,
      mockInterview,
      english,
    ],
    label: placed,
  };
}

function belowAverage() {
  const cgpa = clamp(rand(5.0, 6.5), 0, 10);
  const backlogs = randInt(1, 3);
  const tenth = clamp(rand(50, 72), 0, 100);
  const twelfth = clamp(rand(48, 70), 0, 100);
  const branchRelevant = Math.random() > 0.5 ? 1 : 0;
  const techSkills = randInt(1, 3);
  const dsaLevel = Math.random() > 0.7 ? 1 : 0; // mostly None
  const projects = randInt(0, 2);
  const hasInternship = Math.random() > 0.75 ? 1 : 0;
  const certs = randInt(0, 1);
  const hackathons = randInt(0, 1);
  const openSource = Math.random() > 0.9 ? 1 : 0;
  const atsScore = clamp(rand(35, 60), 0, 100);
  const aptitude = clamp(rand(35, 60), 0, 100);
  const communication = clamp(rand(3.5, 6), 1, 10);
  const mockInterview = clamp(rand(3, 5.5), 1, 10);
  const english = clamp(rand(3.5, 6.5), 1, 10);
  const placed = Math.random() > 0.8 ? 1 : 0; // 20% placed
  return {
    features: [
      cgpa,
      backlogs,
      tenth,
      twelfth,
      branchRelevant,
      techSkills,
      dsaLevel,
      projects,
      hasInternship,
      certs,
      hackathons,
      openSource,
      atsScore,
      aptitude,
      communication,
      mockInterview,
      english,
    ],
    label: placed,
  };
}

function weakProfile() {
  const cgpa = clamp(rand(4.0, 5.5), 0, 10);
  const backlogs = randInt(2, 6);
  const tenth = clamp(rand(40, 62), 0, 100);
  const twelfth = clamp(rand(38, 60), 0, 100);
  const branchRelevant = Math.random() > 0.6 ? 1 : 0;
  const techSkills = randInt(0, 2);
  const dsaLevel = 0; // None
  const projects = randInt(0, 1);
  const hasInternship = 0;
  const certs = 0;
  const hackathons = 0;
  const openSource = 0;
  const atsScore = clamp(rand(20, 45), 0, 100);
  const aptitude = clamp(rand(25, 50), 0, 100);
  const communication = clamp(rand(3, 5), 1, 10);
  const mockInterview = clamp(rand(3, 5), 1, 10);
  const english = clamp(rand(3, 5.5), 1, 10);
  const placed = Math.random() > 0.95 ? 1 : 0; // 5% placed
  return {
    features: [
      cgpa,
      backlogs,
      tenth,
      twelfth,
      branchRelevant,
      techSkills,
      dsaLevel,
      projects,
      hasInternship,
      certs,
      hackathons,
      openSource,
      atsScore,
      aptitude,
      communication,
      mockInterview,
      english,
    ],
    label: placed,
  };
}

// Generate archetype counts — 3000 total records
// Core archetypes (same proportions as before, scaled 10x)
for (let i = 0; i < 500; i++) records.push(highPerformer());
for (let i = 0; i < 700; i++) records.push(aboveAverage());
for (let i = 0; i < 800; i++) records.push(average());
for (let i = 0; i < 600; i++) records.push(belowAverage());
for (let i = 0; i < 400; i++) records.push(weakProfile());

// Round all numeric values to 2 decimal places
for (const r of records) {
  r.features = r.features.map((v) => Math.round(v * 100) / 100);
}

// Shuffle
for (let i = records.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [records[i], records[j]] = [records[j], records[i]];
}

const fs = require("fs");
fs.writeFileSync(
  "src/lib/ml/placement-training-data.json",
  JSON.stringify(records, null, 2),
);

// Print stats
const placed = records.filter((r) => r.label === 1).length;
const notPlaced = records.filter((r) => r.label === 0).length;
console.log(`Total records: ${records.length}`);
console.log(
  `Placed: ${placed} (${((placed / records.length) * 100).toFixed(1)}%)`,
);
console.log(
  `Not Placed: ${notPlaced} (${((notPlaced / records.length) * 100).toFixed(1)}%)`,
);
console.log(`Saved to src/lib/ml/placement-training-data.json`);
