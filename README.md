# Document Diff Tool

A React document comparison UI backed by a word-level Myers diff. It keeps whitespace tokens, groups adjacent changes at sentence boundaries, offers inline and side-by-side views, and provides jump-to-change navigation. Long shared prefixes and suffixes are trimmed before the algorithm runs; for highly divergent inputs the core deliberately emits one replacement block after a bounded edit search.

```sh
npm install
npm run dev
npm test
```

The test suite includes whitespace-only edits, moved paragraphs as deletion/insertion, and a 50,000-word document with a localized edit. No server or upload is involved; text remains in the browser.

