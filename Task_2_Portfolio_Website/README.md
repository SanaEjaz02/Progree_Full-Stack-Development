# Task 2: Portfolio Website

A responsive, single-page portfolio/profile website created for the Progree Full Stack Development internship.

## Project structure

- `index.html` - semantic page structure and content
- `css/styles.css` - custom responsive styling, Grid/Flexbox layouts, and motion
- `js/script.js` - accessible mobile navigation behavior
- `tests/portfolio.test.js` - Node built-in structural tests
- `REPORT.md` - responsive design approach and technical decisions
- `run.bat` - opens the site in the default browser
- `assets/` - reserved for future images and downloadable assets

## Run locally

Double-click `run.bat`, or open `index.html` directly in a browser. No build step or server is required for the current static site.

To run the tests, use:

```text
node --test tests/portfolio.test.js
```

The site uses Google Fonts when online and falls back gracefully to the declared font families when offline. Project links point to Sana Ejaz's public GitHub repositories, while the profile mark remains an intentional text-based visual identity.
