const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');

exports.default = async function afterPack(context) {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'win32') {
    return;
  }

  const electronBinaryPath = `${appOutDir}/Hotel Management System.exe`;
  
  console.log('🔒 Applying Electron Fuses for security...');
  
  await flipFuses(
    electronBinaryPath,
    {
      version: FuseVersion.V1,
      resetAdHocDarwinSignature: false,
      runAsNode: false,
      enableCookieEncryption: true,
      enableNodeOptionsEnvironmentVariable: false,
      enableNodeCliInspectArguments: false,
      enableEmbeddedAsarIntegrityValidation: true,
      onlyLoadAppFromAsar: true,
      loadBrowserProcessSpecificV8Snapshot: false,
      grantFileProtocolExtraPrivileges: false
    }
  );
  
  console.log('✅ Electron Fuses applied successfully!');
};
