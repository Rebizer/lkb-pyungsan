"""Export the running Razor preview as a GitHub Pages project site."""
import argparse
import html
import json
import re
import shutil
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default='http://127.0.0.1:5080')
    parser.add_argument('--site-url', required=True)
    args = parser.parse_args()
    source = args.source.rstrip('/')
    site_url = args.site_url.rstrip('/')
    site = urlsplit(site_url)
    if site.scheme != 'https' or not site.netloc:
        raise SystemExit('Use a full HTTPS site URL.')
    base = site.path.rstrip('/')
    output = ROOT / 'artifacts' / 'github-pages' / 'lkb-preview'
    output.mkdir(parents=True, exist_ok=True)
    controller = (ROOT / 'Controllers/HomeController.cs').read_text(encoding='utf-8-sig')
    routes = [r for r in re.findall(r'\[HttpGet\("([^"]+)"\)\]', controller)
              if not r.endswith(('.xml', '.txt'))]
    route_set = set(routes)

    def local_url(value):
        absolute = value.startswith(source + '/') or value == source
        if absolute:
            value = value[len(source):] or '/'
        if not value.startswith('/') or value.startswith('//'):
            return value
        parsed = urlsplit(value)
        path = parsed.path
        if path in route_set and not path.endswith('/'):
            path += '/'
        transformed = urlunsplit(('', '', base + path, parsed.query, parsed.fragment))
        return f'{site.scheme}://{site.netloc}{transformed}' if absolute else transformed

    def css_urls(text):
        return re.sub(r'url\(\s*([\'\"]?)(/(?!/)[^\)\'\"]+)\1\s*\)',
                      lambda m: 'url(' + m[1] + local_url(m[2]) + m[1] + ')', text)

    # Copy only browser-facing files. Project sources, logs, and authentication stay local.
    allowed = {'.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif',
               '.ico', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.mp4', '.webm',
               '.pdf', '.txt', '.map', '.avif', '.webmanifest', '.vcf', '.json'}
    copied = []
    for file in (ROOT / 'wwwroot').rglob('*'):
        if not file.is_file() or file.suffix.lower() not in allowed:
            continue
        if any(part.startswith('.') for part in file.relative_to(ROOT / 'wwwroot').parts):
            continue
        dest = output / file.relative_to(ROOT / 'wwwroot')
        dest.parent.mkdir(parents=True, exist_ok=True)
        if file.suffix.lower() == '.css':
            dest.write_text(css_urls(file.read_text(encoding='utf-8-sig')), encoding='utf-8')
        else:
            shutil.copy2(file, dest)
        copied.append(dest)

    def json_urls(value):
        if isinstance(value, str):
            return local_url(value) if value.startswith(source) else value
        if isinstance(value, list):
            return [json_urls(v) for v in value]
        if isinstance(value, dict):
            return {k: json_urls(v) for k, v in value.items()}
        return value

    for route in routes:
        with urllib.request.urlopen(source + route, timeout=30) as response:
            # Normalize source CRLF once; write LF explicitly to avoid Windows CRCRLF.
            markup = response.read().decode('utf-8').replace('\r\n', '\n').replace('\r', '\n')
        # Development browser-refresh helpers must never be published.
        markup = re.sub(r'<script\b[^>]*src=[\"\'][^\"\']*(?:aspnetcore-browser-refresh|browserLink)[^\"\']*[\"\'][^>]*>\s*</script>', '', markup, flags=re.I)
        markup = re.sub(r'\b(href|src|action|poster|content)="([^"]*)"',
                        lambda m: m[1] + '="' + html.escape(local_url(html.unescape(m[2])), quote=True) + '"', markup)
        markup = re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',
                        lambda m: m[1] + json.dumps(json_urls(json.loads(m[2])), ensure_ascii=False) + m[3], markup, flags=re.S)
        # This is a publishing review site, not the live law firm's search index.
        markup = re.sub(r'(<meta\s+name="robots"\s+content=")[^"]*(")', r'\1noindex,nofollow\2', markup, flags=re.I)
        dest = output / route.strip('/') / 'index.html'
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(css_urls(markup), encoding='utf-8', newline='\n')
    (output / '.nojekyll').write_text('', encoding='utf-8')
    (output / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
    (output / '404.html').write_text('<!doctype html><html lang="ko"><meta charset="utf-8"><title>페이지를 찾을 수 없습니다</title><h1>페이지를 찾을 수 없습니다.</h1><a href="' + base + '/">홈으로</a></html>', encoding='utf-8')
    (output / 'README.md').write_text('# LKB평산 퍼블리싱 미리보기\n\n' + site_url + '/\n\nRazor 화면을 정적 HTML로 내보낸 검토용 사이트입니다. 상담 전송·검색은 백엔드에 연결되어 있지 않습니다.\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'pages': len(routes), 'assets': len(copied),
                      'assetMB': round(sum(f.stat().st_size for f in copied) / 1024**2, 1)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
