#!/usr/bin/env python3
"""Version-assets: content-hash cache busting for Solace Society.

Rewrites every /assets/(css|js) reference in the HTML files to
/assets/...?v=<short-md5-of-file-content>. When an asset changes, its URL
changes, so browsers and CDNs never serve a stale copy — no manual cache
clears after deploys.

Run before every commit (or via `npm run build`):  python3 scripts/version-assets.py
Idempotent: running it twice produces identical output.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSET_RE = re.compile(r"(/(assets/(?:css|js)/[\w.-]+\.(?:css|js)))(\?v=[0-9a-f]{8})?")
# ES-module imports inside JS files use relative paths — version those too.
IMPORT_RE = re.compile(r"""((?:from\s+|import\s*\()\s*["'])(\./[\w.-]+\.(?:js))(["'])""")


def short_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()[:8]


def main() -> None:
    hashes = {}
    changed_files = 0

    def get_hash(rel: str) -> str:
        if rel not in hashes:
            hashes[rel] = short_hash(ROOT / rel.lstrip("/"))
        return hashes[rel]

    # 1) Version <link>/<script> references in HTML pages
    for html in sorted(ROOT.glob("*.html")):
        text = html.read_text(encoding="utf-8")

        def repl(m: re.Match) -> str:
            url, rel = m.group(1), m.group(2)
            if not (ROOT / rel.lstrip("/")).is_file():
                return m.group(0)
            return f"{url}?v={get_hash(rel)}"

        new = ASSET_RE.sub(repl, text)
        if new != text:
            html.write_text(new, encoding="utf-8")
            changed_files += 1
            print(f"  updated {html.name}")

    # 2) Version ES-module imports inside JS files (e.g. globe.js → three.module.min.js)
    for js in sorted((ROOT / "assets" / "js").glob("*.js")):
        if js.name in ("three.module.min.js", "land-data.js"):
            continue  # leaf assets, imported with a versioned URL already
        text = js.read_text(encoding="utf-8")

        def repl_import(m: re.Match) -> str:
            prefix, rel, quote = m.group(1), m.group(2), m.group(3)
            target = js.parent / rel.lstrip("./")
            if not target.is_file():
                return m.group(0)
            return f"{prefix}{rel}?v={short_hash(target)}{quote}"

        new = IMPORT_RE.sub(repl_import, text)
        if new != text:
            js.write_text(new, encoding="utf-8")
            changed_files += 1
            print(f"  updated {js.name} (imports)")

    print(f"Done. {changed_files} file(s) re-versioned, {len(hashes)} asset hash(es) computed.")


if __name__ == "__main__":
    main()
