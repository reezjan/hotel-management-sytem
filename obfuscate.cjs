const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');

// Directories
const buildDir = path.join(__dirname, 'dist');
const serverFile = path.join(buildDir, 'index.js');
const outputDir = path.join(__dirname, 'app_dist');

// Maximum obfuscation options for production
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.5,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
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
    const publicDir = path.join(buildDir, 'public');
    if (fs.existsSync(publicDir)) {
        fs.copySync(publicDir, path.join(outputDir, 'public'));
        console.log('✅ Frontend assets copied from dist/public to app_dist/public');
    } else {
        console.error('❌ Frontend assets not found at:', publicDir);
        process.exit(1);
    }
    
    console.log('Obfuscation and packaging complete!');
}

obfuscateAndPackage().catch(err => {
    console.error('An error occurred during obfuscation:', err);
    process.exit(1);
});