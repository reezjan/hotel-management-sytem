// Validate environment variables at startup
function getEnv(key: string, defaultValue?: string): string {
  const value = (import.meta as any).env[key];
  if (!value && !defaultValue) {
    console.error(`Missing environment variable: ${key}`);
    return '';
  }
  return value || defaultValue || '';
}

export const ENV = {
  API_URL: getEnv('VITE_API_URL', 'http://localhost:5000'),
  ENV: getEnv('MODE', 'development'),
} as const;

// Validate on app load
if ((import.meta as any).env.PROD && !ENV.API_URL) {
  alert('Application configuration error. Please contact support.');
}
