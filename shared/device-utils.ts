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
    // Clean up IPv6-mapped IPv4 addresses (::ffff:127.0.0.1 -> 127.0.0.1)
    let cleanIP = ipAddress.replace('::ffff:', '');
    
    console.log(`[getLocationFromIP] Attempting to get location for IP: ${cleanIP} (original: ${ipAddress})`);
    
    // Check if it's a private/local IP address
    const isPrivateIP = 
      cleanIP === '127.0.0.1' || 
      cleanIP === 'localhost' || 
      cleanIP === '::1' ||
      cleanIP.startsWith('192.168.') ||
      cleanIP.startsWith('10.') ||
      cleanIP.startsWith('172.16.') ||
      cleanIP.startsWith('172.17.') ||
      cleanIP.startsWith('172.18.') ||
      cleanIP.startsWith('172.19.') ||
      cleanIP.startsWith('172.20.') ||
      cleanIP.startsWith('172.21.') ||
      cleanIP.startsWith('172.22.') ||
      cleanIP.startsWith('172.23.') ||
      cleanIP.startsWith('172.24.') ||
      cleanIP.startsWith('172.25.') ||
      cleanIP.startsWith('172.26.') ||
      cleanIP.startsWith('172.27.') ||
      cleanIP.startsWith('172.28.') ||
      cleanIP.startsWith('172.29.') ||
      cleanIP.startsWith('172.30.') ||
      cleanIP.startsWith('172.31.');
    
    // For private IPs, return local/development location
    if (isPrivateIP) {
      console.log(`[getLocationFromIP] Private IP detected (${ipAddress}), using default location`);
      return {
        city: 'Local',
        country: 'Development',
        location: 'Local Network'
      };
    }
    
    // Try primary service: ip-api.com (free, no API key, 45 req/min)
    try {
      console.log(`[getLocationFromIP] Trying ip-api.com for ${cleanIP}...`);
      const response = await fetch(`https://ip-api.com/json/${cleanIP}?fields=status,country,city,lat,lon,message`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; HotelManagementSystem/1.0)'
        },
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      console.log(`[getLocationFromIP] ip-api.com response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[getLocationFromIP] ip-api.com data:`, data);
        
        if (data.status === 'success' && data.city && data.country) {
          console.log(`[getLocationFromIP] ✓ Success for ${cleanIP}: ${data.city}, ${data.country}`);
          return {
            city: data.city,
            country: data.country,
            location: `${data.lat || 0}, ${data.lon || 0}`
          };
        }
      }
    } catch (apiError) {
      console.warn(`[getLocationFromIP] ip-api.com failed:`, apiError);
    }
    
    // Fallback: Try ipapi.co (free, 1000 req/day, no API key needed)
    try {
      console.log(`[getLocationFromIP] Trying fallback service ipapi.co for ${cleanIP}...`);
      const response = await fetch(`https://ipapi.co/${cleanIP}/json/`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; HotelManagementSystem/1.0)'
        },
        signal: AbortSignal.timeout(8000)
      });
      
      console.log(`[getLocationFromIP] ipapi.co response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[getLocationFromIP] ipapi.co data:`, data);
        
        if (data.city && data.country_name && !data.error) {
          console.log(`[getLocationFromIP] ✓ Fallback success for ${cleanIP}: ${data.city}, ${data.country_name}`);
          return {
            city: data.city,
            country: data.country_name,
            location: `${data.latitude || 0}, ${data.longitude || 0}`
          };
        }
      }
    } catch (fallbackError) {
      console.warn(`[getLocationFromIP] ipapi.co fallback failed:`, fallbackError);
    }
    
    // Both services failed
    console.error(`[getLocationFromIP] All geolocation services failed for IP: ${cleanIP}`);
    return {
      city: 'Unknown',
      country: 'Unknown',
      location: 'Unknown'
    };
    
  } catch (error) {
    console.error('[getLocationFromIP] Unexpected error:', error);
    return {
      city: 'Unknown',
      country: 'Unknown',
      location: 'Unknown'
    };
  }
}
