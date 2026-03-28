import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 验证 URL 格式
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // 获取网站内容
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 增加到30秒

    const response = await fetch(validUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // 解析 HTML 获取元信息
    const title = extractMetaContent(html, [
      '<title>(.*?)</title>',
      '<meta\\s+property="og:title"\\s+content="([^"]*)"',
      '<meta\\s+name="twitter:title"\\s+content="([^"]*)"',
    ]);

    const description = extractMetaContent(html, [
      '<meta\\s+name="description"\\s+content="([^"]*)"',
      '<meta\\s+property="og:description"\\s+content="([^"]*)"',
      '<meta\\s+name="twitter:description"\\s+content="([^"]*)"',
    ]);

    // 获取 favicon
    const icon = await extractFavicon(html, validUrl);

    // 获取网站预览图 (OG Image, Twitter Card 等)
    const image = await extractImage(html, validUrl);

    return NextResponse.json({
      title: title || new URL(url).hostname,
      description: description || '',
      icon: icon,
      image: image,
      url: url,
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);

    // 判断错误类型
    let errorMessage = '获取失败';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，网站响应太慢或无法访问';
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        errorMessage = '无法访问该网站，请检查网址是否正确';
      } else {
        errorMessage = `获取失败: ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        title: '',
        description: '',
        icon: '',
        image: '',
      },
      { status: 200 } // 仍然返回 200，让前端可以显示错误信息
    );
  }
}

function extractMetaContent(html: string, patterns: string[]): string {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'is');
    const match = html.match(regex);
    if (match) {
      return match[1]?.trim() || '';
    }
  }
  return '';
}

async function extractFavicon(html: string, url: URL): Promise<string> {
  const baseUrl = `${url.protocol}//${url.host}`;

  // 尝试多种方式获取 favicon
  const faviconPatterns = [
    '<link\\s+rel="(?:shortcut )?icon"\\s+href="([^"]*)"',
    '<link\\s+rel="apple-touch-icon"\\s+href="([^"]*)"',
    '<link\\s+rel="icon"\\s+href="([^"]*)"',
  ];

  for (const pattern of faviconPatterns) {
    const regex = new RegExp(pattern, 'is');
    const match = html.match(regex);
    if (match && match[1]) {
      let faviconUrl = match[1];
      if (faviconUrl.startsWith('//')) {
        faviconUrl = url.protocol + faviconUrl;
      } else if (faviconUrl.startsWith('/')) {
        faviconUrl = baseUrl + faviconUrl;
      } else if (!faviconUrl.startsWith('http')) {
        faviconUrl = baseUrl + '/' + faviconUrl;
      }
      return faviconUrl;
    }
  }

  // 使用 Google 的 favicon 服务作为备选
  return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
}

async function extractImage(html: string, url: URL): Promise<string> {
  const baseUrl = `${url.protocol}//${url.host}`;

  // 尝试多种方式获取预览图，优先级：og:image > twitter:image > apple-touch-icon > 其他大图
  const imagePatterns = [
    '<meta\\s+property="og:image"\\s+content="([^"]*)"',
    '<meta\\s+name="twitter:image"\\s+content="([^"]*)"',
    '<meta\\s+property="twitter:image"\\s+content="([^"]*)"',
    '<link\\s+rel="apple-touch-icon"\\s+href="([^"]*)"',
    '<link\\s+rel="apple-touch-icon-precomposed"\\s+href="([^"]*)"',
  ];

  for (const pattern of imagePatterns) {
    const regex = new RegExp(pattern, 'is');
    const match = html.match(regex);
    if (match && match[1]) {
      let imageUrl = match[1];
      if (imageUrl.startsWith('//')) {
        imageUrl = url.protocol + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = baseUrl + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = baseUrl + '/' + imageUrl;
      }
      return imageUrl;
    }
  }

  // 尝试找到页面中的大图（可能在 hero 区域）
  // 简单的启发式方法：找到第一个较大的 img 标签
  const imgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const imgMatch = html.match(imgPattern);
  if (imgMatch && imgMatch[1]) {
    let imageUrl = imgMatch[1];
    if (imageUrl.startsWith('//')) {
      imageUrl = url.protocol + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = baseUrl + imageUrl;
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = baseUrl + '/' + imageUrl;
    }
    // 过滤掉明显的小图标
    if (!imageUrl.includes('icon') && !imageUrl.includes('favicon') && !imageUrl.includes('logo')) {
      return imageUrl;
    }
  }

  return '';
}
