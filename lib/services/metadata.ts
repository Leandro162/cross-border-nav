import { MetadataResponse } from '@/types/api';

export async function fetchMetadata(url: string): Promise<MetadataResponse> {
  try {
    // Validate URL
    const validUrl = new URL(url);
    if (!validUrl.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol');
    }

    // Try multiple fetch approaches for better compatibility
    let html: string | null = null;
    let lastError: Error | null = null;

    // Method 1: Direct fetch with standard headers
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        html = await response.text();
      }
    } catch (error) {
      lastError = error as Error;
      console.warn('First fetch attempt failed:', error);
    }

    // Method 2: Try with different user agent if first attempt failed
    if (!html) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          html = await response.text();
        }
      } catch (error) {
        console.warn('Second fetch attempt failed:', error);
      }
    }

    if (!html) {
      throw lastError || new Error('Failed to fetch website content');
    }

    // Extract metadata using regex and DOM parsing
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? decodeHtml(titleMatch[1].trim()) : '';

    // Try to get description from meta tags (multiple patterns)
    const descPatterns = [
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    ];

    let description = '';
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match) {
        description = decodeHtml(match[1].trim());
        break;
      }
    }

    // Try to get Open Graph image (multiple patterns)
    const imagePatterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["'][^>]*>/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    ];

    let image: string | undefined = undefined;
    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match) {
        image = decodeHtml(match[1].trim());
        break;
      }
    }

    // Try to get favicon (multiple patterns)
    const faviconPatterns = [
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["'][^>]*>/i,
      /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:icon|shortcut icon)["'][^>]*>/i,
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["'][^>]*>/i,
    ];

    let logo: string | undefined = undefined;
    for (const pattern of faviconPatterns) {
      const match = html.match(pattern);
      if (match) {
        logo = decodeHtml(match[1].trim());
        break;
      }
    }

    // Resolve relative URLs
    if (logo && !logo.startsWith('http')) {
      try {
        logo = new URL(logo, validUrl.origin).href;
      } catch {
        logo = undefined;
      }
    }

    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, validUrl.origin).href;
      } catch {
        image = undefined;
      }
    }

    return {
      title: title || undefined,
      description: description || undefined,
      image: image || undefined,
      logo: logo || undefined,
      url: url,
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}

// Decode HTML entities
function decodeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[a-z]+;|&#\d+;/gi, (entity) => entities[entity] || entity);
}

// Fallback to get favicon/logo
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
  } catch {
    return '';
  }
}
