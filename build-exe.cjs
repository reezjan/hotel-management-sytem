const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('   Hotel Management System - Secure Build Process');
console.log('═══════════════════════════════════════════════════════════\n');

async function buildSecureExe() {
  try {
    console.log('📦 Step 1: Building frontend and backend...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete!\n');

    console.log('🔒 Step 2: Obfuscating code for security...');
    execSync('node obfuscate.cjs', { stdio: 'inherit' });
    console.log('✅ Code obfuscated!\n');

    console.log('📦 Step 3: Packaging Electron app with security fuses...');
    console.log('   - ASAR integrity validation: ENABLED');
    console.log('   - Developer tools: DISABLED');
    console.log('   - Debug mode: BLOCKED');
    console.log('   - Code inspection: PREVENTED\n');
    
    execSync('npm run electron:build', { stdio: 'inherit' });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ BUILD SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📦 Your secure executable is ready!');
    console.log('📂 Location: release/HotelManagement-Setup-1.0.0.exe\n');
    
    console.log('🔐 Security Features Enabled:');
    console.log('   ✓ Maximum code obfuscation (RC4 encryption)');
    console.log('   ✓ Self-defending code');
    console.log('   ✓ Debug protection');
    console.log('   ✓ Developer tools completely disabled');
    console.log('   ✓ ASAR integrity validation');
    console.log('   ✓ All inspection methods blocked');
    console.log('   ✓ URL/address bar hidden');
    console.log('   ✓ Context menu restricted\n');
    
    console.log('📋 Installation Instructions:');
    console.log('   1. Copy HotelManagement-Setup-1.0.0.exe to client computer');
    console.log('   2. Run the installer');
    console.log('   3. Everything will be installed automatically');
    console.log('   4. The app will run completely standalone\n');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildSecureExe();