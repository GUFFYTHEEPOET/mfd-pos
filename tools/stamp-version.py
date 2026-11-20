#!/usr/bin/env python3
"""Give upload-this-folder a new version after editing its index.html directly.

Usage:  python tools/stamp-version.py [--force]
Rewrites the version in sw.js and version.txt (same format as build-web.py), so the
tills and the desktop app show "A new version of MFD POS is ready".
--force makes a new version even if no file changed (e.g. to refresh the devices'
offline copy after a change in the hosting settings).
"""
import hashlib, json, os, re, sys, time

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'upload-this-folder')

sw_path = os.path.join(OUT, 'sw.js')
sw = open(sw_path, encoding='utf-8').read()
shell = json.loads(re.search(r'const SHELL = (\[.*?\]);', sw).group(1))
digest = hashlib.sha256()
for f in shell[1:]:
    digest.update(open(os.path.join(OUT, f), 'rb').read())
version = time.strftime('%Y%m%d-%H%M') + '-' + digest.hexdigest()[:8]

old = open(os.path.join(OUT, 'version.txt'), encoding='utf-8').read().strip()
if old.split('-')[-1] == version.split('-')[-1] and '--force' not in sys.argv:
    print('No file changes since', old)
else:
    open(sw_path, 'w', encoding='utf-8').write(sw.replace(old, version))
    open(os.path.join(OUT, 'version.txt'), 'w').write(version + '\n')
    print('Version', old, '->', version)
