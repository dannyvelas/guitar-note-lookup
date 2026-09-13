# Guitar Chord Transcriber

A fretboard chord/note lookup tool: pick a tuning and capo, select frets, and see (and hear) each string's resulting note.

## Run it

```bash
npm start
```

Serves `src/` at `http://localhost:8000`. No install needed just to run the app — `src/styles.css` is committed, pre-built.

You can also open `src/index.html` directly in a browser.

## Development

Styling is written with [Tailwind CSS](https://tailwindcss.com) utility classes, compiled ahead of time into `src/styles.css`.

**`src/styles.css` is generated — never edit it by hand.** Edit `src/tailwind.css` (theme tokens) or the utility classes in `src/index.html` / `src/lib/fretboard.js` instead.

If you're changing styles:

```bash
npm install               # first time only
npm run build:css         # compiles src/tailwind.css -> src/styles.css; commit the result
npm run watch:css         # optional: rebuilds on save while iterating
```

## Tests

```bash
npm test
```
