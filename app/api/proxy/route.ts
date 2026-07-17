import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/html';

    if (contentType.includes('text/html')) {
      let html = await response.text();

      // Inject base href to fix relative URLs
      const baseTag = `<base href="${origin}/">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else if (html.includes('<HEAD>')) {
        html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
      } else {
        html = baseTag + html;
      }

      // Remove security headers that block embedding
      html = html.replace(/<meta[^>]*content-security-policy[^>]*>/gi, '');
      html = html.replace(/<meta[^>]*x-frame-options[^>]*>/gi, '');
      html = html.replace(/<meta[^>]*referrer-policy[^>]*>/gi, '');

      // Intercept in-frame navigation
      const script = `<script>(function(){
        document.addEventListener('click',function(e){
          var a=e.target.closest('a');
          if(a&&a.href&&!a.target&&!a.href.startsWith('javascript')&&!a.href.startsWith('#')){
            e.preventDefault();
            window.parent.postMessage({type:'BROWSER_NAVIGATE',url:a.href},'*');
          }
        },true);
        var _open=window.open;
        window.open=function(u){window.parent.postMessage({type:'BROWSER_NAVIGATE',url:u||''},'*');return null;};
      })();</script>`;
      html = html.includes('</head>') ? html.replace('</head>', script + '</head>') : html + script;

      return new Response(html, {
        status: response.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'ALLOWALL',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Non-HTML: proxy directly
    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Proxy error' }, { status: 500 });
  }
}
