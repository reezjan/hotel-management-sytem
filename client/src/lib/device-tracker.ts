import { generateDeviceFingerprint, detectBrowserAndOS } from '@shared/device-utils';

// Get complete device information
export async function getDeviceInfo(): Promise<{
  deviceFingerprint: string;
  browser: string;
  os: string;
}> {
  const deviceFingerprint = await generateDeviceFingerprint();
  const { browser, os } = detectBrowserAndOS();
  
  return {
    deviceFingerprint,
    browser,
    os
  };
}
