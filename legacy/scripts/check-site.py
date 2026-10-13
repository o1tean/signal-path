#!/usr/bin/env python3
"""Check static project-site links, fragments, duplicate IDs and inline scripts."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.duplicates, self.links, self.inline = set(), [], [], []
        self.capture = False
        self.h1 = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if 'id' in attrs:
            if attrs['id'] in self.ids: self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        for attr in ('href', 'src'):
            if attr in attrs: self.links.append(attrs[attr])
        if tag == 'script' and not attrs.get('src') and attrs.get('type', 'text/javascript') in ('text/javascript','module'):
            self.capture = True
            self.inline.append('')
    def handle_data(self, data):
        if self.capture: self.inline[-1] += data
    def handle_endtag(self, tag):
        if tag == 'script': self.capture = False

pages = {}
for file in list(ROOT.glob('*.html')) + list((ROOT / 'modules').glob('*.html')):
    parser = Page(); parser.feed(file.read_text()); pages[file.resolve()] = parser
errors = []
for file, page in pages.items():
    rel = file.relative_to(ROOT)
    if page.h1 != 1: errors.append(f'{rel}: expected one h1, found {page.h1}')
    if page.duplicates: errors.append(f'{rel}: duplicate IDs {page.duplicates}')
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc: continue
        path = unquote(url.path)
        if path.startswith('/signal-path/'):
            target = ROOT / path.removeprefix('/signal-path/')
        elif path.startswith('/'):
            errors.append(f'{rel}: domain-root link will escape project path: {link}'); continue
        else: target = file.parent / path if path else file
        if target.is_dir(): target /= 'index.html'
        target = target.resolve()
        if not target.is_relative_to(ROOT): errors.append(f'{rel}: link escapes site: {link}'); continue
        if not target.exists(): errors.append(f'{rel}: missing target {link}'); continue
        if url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{rel}: missing fragment {link}')
    for script in page.inline:
        with tempfile.NamedTemporaryFile(suffix='.js', mode='w') as temp:
            temp.write(script); temp.flush()
            result = subprocess.run(['node', '--check', temp.name], capture_output=True, text=True)
            if result.returncode: errors.append(f'{rel}: inline JavaScript syntax error: {result.stderr}')
for file in (ROOT / 'assets/js').rglob('*.js'):
    result = subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
    if result.returncode: errors.append(f'{file.relative_to(ROOT)}: {result.stderr}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages; all local assets, links, fragments, IDs and JavaScript syntax checked.')
