/**
 * Sanitizes a string input to prevent XSS attacks by removing HTML tags and scripts
 * Uses regex to strip all HTML/XML tags from the input
 * @param input - The string to sanitize
 * @returns Sanitized string with HTML/script tags removed
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove all HTML tags using regex
  // This strips <script>, <img>, and all other HTML tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Decode HTML entities
    .replace(/<[^>]+>/g, '') // Remove again in case entities were decoded
    .trim();
}

/**
 * Sanitizes all string values in an object recursively
 * @param obj - The object to sanitize
 * @returns New object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) :
        typeof item === 'object' ? sanitizeObject(item) :
        item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}
