# OpenCC character table (vendored)

- `STCharacters.txt`: simplified → traditional character mappings from
  [OpenCC](https://github.com/BYVoid/OpenCC), `data/dictionary/STCharacters.txt` at commit
  `3ac34aa439a9908dd49fa92b5174b46314787ac2` (downloaded 2026-10-06, unmodified).
- `LICENSE`: OpenCC's Apache License 2.0, which covers the file above and the lists derived from it.

Used only by `scripts/simplified-chars.mjs`, which derives `src/data/glossary/_simplified-only.txt` and
`_simplified-only-ja.txt` for the L-13 check ④ (doc 06 §4.3). To update, replace the file with a newer revision,
record the commit here and re-run the script.
