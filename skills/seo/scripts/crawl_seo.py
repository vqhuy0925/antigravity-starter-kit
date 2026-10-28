#!/usr/bin/env python3
"""
crawl_seo.py - Lightweight Zero-Dependency SEO & Metadata Crawler
Extracts HTTP status, response time, meta tags, OpenGraph, Twitter cards,
heading hierarchy, canonicals, robots directives, image alt attributes,
and JSON-LD structured data.
"""

import sys
import json
import time
import urllib.request
import urllib.error
import urllib.parse
from html.parser import HTMLParser

class SEOHTMLParser(HTMLParser):
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.title = ""
        self.in_title = False
        self.meta_tags = []
        self.headings = [] # list of (tag, text)
        self.current_heading = None
        self.current_heading_text = []
        self.canonical = None
        self.json_ld = []
        self.in_json_ld = False
        self.json_ld_buffer = []
        self.images = [] # {src, alt, has_alt}
        self.links = [] # {href, is_internal, text}
        self.current_link = None
        self.current_link_text = []

    def handle_starttag(self, tag, attrs):
        attr_dict = {k.lower(): v for k, v in attrs if k}
        tag_lower = tag.lower()

        if tag_lower == 'title':
            self.in_title = True
        elif tag_lower == 'meta':
            self.meta_tags.append(attr_dict)
            # check meta robots
            name = attr_dict.get('name', '').lower()
            prop = attr_dict.get('property', '').lower()
            content = attr_dict.get('content', '')
        elif tag_lower == 'link':
            rel = attr_dict.get('rel', '').lower()
            if rel == 'canonical':
                self.canonical = attr_dict.get('href', '')
        elif tag_lower in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.current_heading = tag_lower
            self.current_heading_text = []
        elif tag_lower == 'script':
            script_type = attr_dict.get('type', '').lower()
            if script_type == 'application/ld+json':
                self.in_json_ld = True
                self.json_ld_buffer = []
        elif tag_lower == 'img':
            src = attr_dict.get('src', '')
            alt = attr_dict.get('alt')
            self.images.append({
                'src': src,
                'alt': alt,
                'has_alt': alt is not None and len(alt.strip()) > 0
            })
        elif tag_lower == 'a':
            href = attr_dict.get('href', '')
            if href:
                parsed_href = urllib.parse.urlparse(href)
                parsed_base = urllib.parse.urlparse(self.base_url)
                is_internal = not parsed_href.netloc or parsed_href.netloc == parsed_base.netloc
                self.current_link = {
                    'href': href,
                    'is_internal': is_internal,
                    'rel': attr_dict.get('rel', '')
                }
                self.current_link_text = []

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower == 'title':
            self.in_title = False
        elif tag_lower in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] and self.current_heading == tag_lower:
            text = " ".join("".join(self.current_heading_text).split())
            if text:
                self.headings.append({'level': tag_lower, 'text': text})
            self.current_heading = None
            self.current_heading_text = []
        elif tag_lower == 'script' and self.in_json_ld:
            self.in_json_ld = False
            raw_json = "".join(self.json_ld_buffer).strip()
            if raw_json:
                try:
                    parsed = json.loads(raw_json)
                    self.json_ld.append(parsed)
                except Exception as e:
                    self.json_ld.append({"_parse_error": str(e), "raw": raw_json[:200]})
            self.json_ld_buffer = []
        elif tag_lower == 'a' and self.current_link:
            self.current_link['text'] = " ".join("".join(self.current_link_text).split())
            self.links.append(self.current_link)
            self.current_link = None
            self.current_link_text = []

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        elif self.current_heading:
            self.current_heading_text.append(data)
        elif self.in_json_ld:
            self.json_ld_buffer.append(data)
        elif self.current_link:
            self.current_link_text.append(data)

def audit_url(url: str):
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AntigravitySEO/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }

    req = urllib.request.Request(url, headers=headers)
    start_time = time.time()
    
    result = {
        "url": url,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "status_code": None,
        "response_time_ms": None,
        "headers": {},
        "seo": {}
    }

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            elapsed_ms = int((time.time() - start_time) * 1000)
            result["status_code"] = resp.getcode()
            result["response_time_ms"] = elapsed_ms
            response_headers = {k.lower(): v for k, v in resp.info().items()}
            result["headers"] = {
                "content-type": response_headers.get('content-type', ''),
                "x-robots-tag": response_headers.get('x-robots-tag', ''),
                "cache-control": response_headers.get('cache-control', '')
            }
            
            content_charset = resp.headers.get_content_charset() or 'utf-8'
            html = resp.read().decode(content_charset, errors='replace')
    except urllib.error.HTTPError as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        result["status_code"] = e.code
        result["response_time_ms"] = elapsed_ms
        result["error"] = f"HTTP Error {e.code}: {e.reason}"
        return result
    except Exception as e:
        result["error"] = f"Connection Error: {str(e)}"
        return result

    parser = SEOHTMLParser(url)
    try:
        parser.feed(html)
    except Exception as e:
        result["parser_warning"] = str(e)

    # Process metadata
    meta_desc = None
    meta_robots = None
    viewport = None
    og = {}
    twitter = {}

    for m in parser.meta_tags:
        name = m.get('name', '').lower()
        prop = m.get('property', '').lower()
        content = m.get('content', '')

        if name == 'description':
            meta_desc = content
        elif name == 'robots':
            meta_robots = content
        elif name == 'viewport':
            viewport = content
        elif prop.startswith('og:'):
            og[prop[3:]] = content
        elif name.startswith('twitter:'):
            twitter[name[8:]] = content

    h1_list = [h['text'] for h in parser.headings if h['level'] == 'h1']
    h2_list = [h['text'] for h in parser.headings if h['level'] == 'h2']
    h3_list = [h['text'] for h in parser.headings if h['level'] == 'h3']

    total_imgs = len(parser.images)
    missing_alt_imgs = [img['src'] for img in parser.images if not img['has_alt']]

    internal_links = [l for l in parser.links if l['is_internal']]
    external_links = [l for l in parser.links if not l['is_internal']]

    title_clean = " ".join(parser.title.split())

    result["seo"] = {
        "title": {
            "value": title_clean,
            "length": len(title_clean),
            "status": "optimal" if 30 <= len(title_clean) <= 65 else ("too_short" if len(title_clean) < 30 else "too_long")
        },
        "description": {
            "value": meta_desc,
            "length": len(meta_desc) if meta_desc else 0,
            "status": "optimal" if meta_desc and 120 <= len(meta_desc) <= 160 else ("missing" if not meta_desc else ("too_short" if len(meta_desc) < 120 else "too_long"))
        },
        "canonical": parser.canonical,
        "robots_directive": meta_robots or result["headers"].get("x-robots-tag") or "index, follow (default)",
        "viewport": viewport,
        "is_mobile_responsive": viewport is not None and "width=device-width" in viewport,
        "open_graph": og,
        "twitter_cards": twitter,
        "headings": {
            "h1_count": len(h1_list),
            "h1_values": h1_list,
            "h2_count": len(h2_list),
            "h3_count": len(h3_list),
            "sample_h2": h2_list[:5]
        },
        "images": {
            "total": total_imgs,
            "missing_alt_count": len(missing_alt_imgs),
            "sample_missing_alt": missing_alt_imgs[:5]
        },
        "links": {
            "total_internal": len(internal_links),
            "total_external": len(external_links)
        },
        "schema_org": {
            "found_count": len(parser.json_ld),
            "types": [s.get("@type") if isinstance(s, dict) else [item.get("@type") for item in s if isinstance(item, dict)] for s in parser.json_ld],
            "items": parser.json_ld
        }
    }

    return result

if __name__ == '__main__':
    if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python crawl_seo.py <url>"}))
        sys.exit(1)
    
    target_url = sys.argv[1]
    res = audit_url(target_url)
    print(json.dumps(res, indent=2, ensure_ascii=False))
