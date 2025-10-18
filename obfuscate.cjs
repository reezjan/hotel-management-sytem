const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');

// Directories
const buildDir = path.join(__dirname, 'dist');
const serverFile = path.join(buildDir, 'index.js');
const outputDir = path.join(__dirname, 'app_dist');

// Obfuscation options
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 1,
    stringArrayEncoding: ['base64']
};

async function obfuscateAndPackage() {
    console.log('Starting obfuscation process...');

    // 1. Clean previous build output
    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }
    fs.mkdirSync(outputDir);

    // 2. Obfuscate the server entry point
    const serverCode = fs.readFileSync(serverFile, 'utf8');
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(serverCode, obfuscationOptions).getObfuscatedCode();
    fs.writeFileSync(path.join(outputDir, 'index.js'), obfuscatedCode);
    console.log('✅ Server code obfuscated.');

    // 3. Copy the frontend assets (Vite's output)
    const frontendDir = path.join(buildDir, 'assets');
    if (fs.existsSync(frontendDir)) {
        fs.copySync(frontendDir, path.join(outputDir, 'assets'));
    }
    const indexHtml = path.join(buildDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
        fs.copySync(indexHtml, path.join(outputDir, 'index.html'));
    }
    console.log('✅ Frontend assets copied.');
    
    console.log('Obfuscation and packaging complete!');
}

obfuscateAndPackage().catch(err => {
    console.error('An error occurred during obfuscation:', err);
    process.exit(1);
});