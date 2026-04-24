const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'liff', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = "disabled={isSubmitting || isAnalyzing || (!profileData?.isRegistered && detectedPlate === '')}";
const replacement = "disabled={isSubmitting || isAnalyzing || (profileData?.isRegistered && detectedPlate === '')}";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced the condition!");
} else {
    console.log("Could not find the target string.");
}
