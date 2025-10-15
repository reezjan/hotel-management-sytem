// Device fingerprinting and location detection utilities

// Client-side: Generate device fingerprint using browser characteristics
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('generateDeviceFingerprint can only be called on the client side');
  }

  const { userAgent, language, platform } = window.navigator;
  const { width, height, colorDepth } = window.screen;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Combine all device characteristics
  const fingerprintData = [
    userAgent,
    `${width}x${height}x${colorDepth}`,
    timezone,
    language,
    platform
  ].join('|');

  // Generate SHA-256 hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Client-side: Detect browser and operating system from user agent
export function detectBrowserAndOS(): { browser: string; os: string } {
  if (typeof window === 'undefined') {
    throw new Error('detectBrowserAndOS can only be called on the client side');
  }

  const userAgent = window.navigator.userAgent;
  
  // Detect OS
  let os = 'Unknown';
  if (userAgent.indexOf('Win') !== -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') !== -1) os = 'MacOS';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
  else if (userAgent.indexOf('Android') !== -1) os = 'Android';
  else if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'iOS';
  
  // Detect Browser
  let browser = 'Unknown';
  if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (userAgent.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Internet';
  else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) browser = 'Opera';
  else if (userAgent.indexOf('Trident') !== -1) browser = 'Internet Explorer';
  else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
  else if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
  
  return { browser, os };
}

// Server-side: Get location information from IP address
export async function getLocationFromIP(ipAddress: string): Promise<{ city: string; country: string; location: string }> {
  try {
    // Use ip-api.com (free, no API key required)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city,lat,lon`);
    
    if (!response.ok) {
      throw new Error(`IP API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('IP API returned failure status');
    }
    
    return {
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      location: `${data.lat || 0}, ${data.lon || 0}`
    };
  } catch (error) {
    console.error('Error fetching location from IP:', error);
    // Return unknown values if API fails
    return {
      city: 'Unknown',
      country: 'Unknown',
      location: 'Unknown'
    };
  }
}
