# Dashboard

This project uses [Prettier](https://prettier.io/) to keep code formatting consistent.

## Formatting

Run Prettier before committing changes:

```bash
npx prettier --write .
```

Prettier is configured to use 2 spaces for indentation and omit semicolons.

## Viewing the dashboard

Prerequisites: Python 3 or Node.js.

The HTML files in this repo are static. You can open them directly in a browser, but it’s easier to run a local server. If you have Python installed, run:

```bash
python3 -m http.server
```

Then navigate to `http://localhost:8000` and open `index.html`.

If you prefer Node.js, install `serve` and run `npx serve`.
