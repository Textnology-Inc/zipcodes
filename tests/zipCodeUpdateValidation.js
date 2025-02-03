#!/usr/bin/env node

// ---------------------------------------------------------------------
// compareCodes.js
// ---------------------------------------------------------------------
// Usage: node compareCodes.js
// (Make sure codesOld.js and codes.js are in the same directory as this script)
//
// This script compares:
// 1) `codes` object: Added/removed zip codes and changed fields
// 2) `stateMap` object: Added/removed zip codes from each state's array
// ---------------------------------------------------------------------

const path = require("path");

// Load old and new data
const oldData = require(path.resolve(__dirname, "../lib/codesOld.js"));
const newData = require(path.resolve(__dirname, "../lib/codes.js"));

const oldCodes = oldData.codes;
const newCodes = newData.codes;

const oldStateMap = oldData.stateMap;
const newStateMap = newData.stateMap;

// ---------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------

/**
 * Deeply compare two objects (e.g., a zip-code object) field by field.
 * Returns an array of strings describing differences, or an empty array if no differences.
 */
function compareObjects(obj1, obj2) {
  const differences = [];

  // Gather all keys (union of obj1 + obj2)
  const allKeys = new Set([
    ...Object.keys(obj1 || {}),
    ...Object.keys(obj2 || {}),
  ]);

  for (const key of allKeys) {
    const val1 = obj1 ? obj1[key] : undefined;
    const val2 = obj2 ? obj2[key] : undefined;
    if (val1 !== val2) {
      differences.push(`Field "${key}" changed from "${val1}" to "${val2}"`);
    }
  }

  return differences;
}

/**
 * Compare arrays of strings (e.g. zip codes for a state).
 * Returns an object with `added` and `removed` arrays.
 */
function compareStringArrays(arr1, arr2) {
  const set1 = new Set(arr1 || []);
  const set2 = new Set(arr2 || []);

  const added = [];
  const removed = [];

  // Find which items are in set2 but not in set1
  for (const val of set2) {
    if (!set1.has(val)) added.push(val);
  }
  // Find which items are in set1 but not in set2
  for (const val of set1) {
    if (!set2.has(val)) removed.push(val);
  }

  return { added, removed };
}

// ---------------------------------------------------------------------
// 1) Compare the `codes` object
// ---------------------------------------------------------------------

// Collect all zip codes (old + new)
const allZips = new Set([...Object.keys(oldCodes), ...Object.keys(newCodes)]);

const codesAdded = [];
const codesRemoved = [];
const codesChanged = [];

for (const zip of allZips) {
  const oldEntry = oldCodes[zip];
  const newEntry = newCodes[zip];

  // If oldEntry exists but newEntry doesn't => removed
  if (oldEntry && !newEntry) {
    codesRemoved.push(zip);
  }
  // If newEntry exists but oldEntry doesn't => added
  else if (!oldEntry && newEntry) {
    codesAdded.push(zip);
  }
  // If both exist, compare fields
  else if (oldEntry && newEntry) {
    const diff = compareObjects(oldEntry, newEntry);
    if (diff.length > 0) {
      codesChanged.push({ zip, differences: diff });
    }
  }
}

// Log results for codes
if (codesAdded.length > 0) {
  console.log("Added ZIP codes in `codes`:", codesAdded);
}
if (codesRemoved.length > 0) {
  console.log("Removed ZIP codes in `codes`:", codesRemoved);
}
if (codesChanged.length > 0) {
  console.log("Modified ZIP codes in `codes`:");
  for (const { zip, differences } of codesChanged) {
    console.log(`  ZIP ${zip}:`);
    differences.forEach((line) => {
      console.log(`    - ${line}`);
    });
  }
}

// ---------------------------------------------------------------------
// 2) Compare the `stateMap` object
// ---------------------------------------------------------------------

// Gather all states (old + new)
const allStates = new Set([
  ...Object.keys(oldStateMap),
  ...Object.keys(newStateMap),
]);

const statesAdded = [];
const statesRemoved = [];
const statesChanged = [];

for (const state of allStates) {
  const oldArr = oldStateMap[state];
  const newArr = newStateMap[state];

  // If old exists but no new => entire state removed
  if (oldArr && !newArr) {
    statesRemoved.push(state);
  }
  // If new exists but no old => entire state added
  else if (!oldArr && newArr) {
    statesAdded.push(state);
  }
  // Otherwise, compare arrays for changes
  else if (oldArr && newArr) {
    const { added, removed } = compareStringArrays(oldArr, newArr);
    if (added.length > 0 || removed.length > 0) {
      statesChanged.push({ state, added, removed });
    }
  }
}

// Log results for stateMap
if (statesAdded.length > 0) {
  console.log("Added states in `stateMap`:", statesAdded);
}
if (statesRemoved.length > 0) {
  console.log("Removed states in `stateMap`:", statesRemoved);
}
if (statesChanged.length > 0) {
  console.log("Modified states in `stateMap`:");
  for (const { state, added, removed } of statesChanged) {
    console.log(`  State: ${state}`);
    if (added.length > 0) {
      console.log(`    Added zips: ${added.join(", ")}`);
    }
    if (removed.length > 0) {
      console.log(`    Removed zips: ${removed.join(", ")}`);
    }
  }
}

// ---------------------------------------------------------------------
// 3) If no differences, log that everything matches
// ---------------------------------------------------------------------

if (
  codesAdded.length === 0 &&
  codesRemoved.length === 0 &&
  codesChanged.length === 0 &&
  statesAdded.length === 0 &&
  statesRemoved.length === 0 &&
  statesChanged.length === 0
) {
  console.log("No differences found between codesOld.js and codes.js!");
}
