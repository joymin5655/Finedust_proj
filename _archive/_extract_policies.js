/**
 * Extract hardcoded country policies from globe.js into JSON
 * Run: node _extract_policies.js
 */
const fs = require('fs');

const content = fs.readFileSync('app/js/globe.js', 'utf-8');

// Find loadCountryPolicies method
const marker = 'loadCountryPolicies() {';
const startIdx = content.indexOf(marker);
if (startIdx === -1) { console.error('NOT FOUND'); process.exit(1); }

// Find "return {" after the marker
const returnIdx = content.indexOf('return {', startIdx);

// Find the matching closing brace
let braceCount = 0;
let i = returnIdx + 7; // skip "return "
while (content[i] !== '{') i++;
braceCount = 1;
i++;
while (braceCount > 0 && i < content.length) {
  if (content[i] === '{') braceCount++;
  else if (content[i] === '}') braceCount--;
  i++;
}

const objText = content.substring(returnIdx + 7, i); // { ... }

// Convert JS object literal to valid JSON
// - Single quotes to double quotes (careful with escaped ones)
// - Remove trailing commas
// - Handle template literals
let jsonText = objText;

// We'll use eval to parse the JS object (safe since it's our own code)
let data;
try {
  data = eval('(' + objText + ')');
} catch(e) {
  console.error('Eval failed:', e.message);
  process.exit(1);
}

// Write as JSON
fs.writeFileSync(
  'app/data/country-policies.json',
  JSON.stringify(data, null, 2),
  'utf-8'
);

console.log(`✅ Extracted ${Object.keys(data).length} countries to app/data/country-policies.json`);
console.log(`Countries: ${Object.keys(data).join(', ')}`);

// Also output the line range for replacement
const startLine = content.substring(0, startIdx).split('\n').length;
const endLine = content.substring(0, i).split('\n').length;
console.log(`\nOriginal in globe.js: lines ${startLine} to ${endLine}`);
