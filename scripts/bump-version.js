const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Usage: npm run bump <version>');
  process.exit(1);
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = version;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`Version mise à jour : ${version}`);