import { MetadataResponse } from '@/types/api';

export async function fetchMetadata(url: string): Promise<MetadataResponse> {
  try {
    // Validate URL
    const validUrl = new URL(url);
    if (!validUrl.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol');
    }

    // Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CrossBorderNav/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract metadata using regex and DOM parsing
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Try to get description from meta tags
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Try to get Open Graph image
    const ogImageMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["'][^>]*>/i);
    let image = ogImageMatch ? ogImageMatch[1].trim() : undefined;

    // Try to get favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["'][^>]*>/i);
    let logo = faviconMatch ? faviconMatch[1].trim() : undefined;

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
        // keep original
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

// Fallback to get favicon/logo
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
  } catch {
    return '';
  }
}
