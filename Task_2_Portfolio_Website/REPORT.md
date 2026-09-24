# Task 2 Portfolio Website Report

## Overview

This project is a semantic, single-page portfolio website for Sana Ejaz. It is built with plain HTML5, custom CSS, and a small vanilla JavaScript module so the implementation demonstrates core front-end skills without a heavy framework. The content now presents Sana's education, internship experience, technical skills, and four real projects.

## Responsive design approach

The layout uses a mobile-first responsive strategy with CSS Grid for major page compositions and Flexbox for navigation, actions, metadata, and footer alignment. Fluid sizing uses `clamp()` for display typography and constrained shell widths so the content remains readable on large screens without becoming cramped on smaller ones.

The visual system uses a graphite background for high contrast, a warm paper surface, and mint/coral accents to create a professional but memorable interface. Four cohesive CSS project visuals keep the page lightweight while linking directly to the corresponding GitHub repositories.

## Breakpoints

- Base styles: mobile and narrow screens, with a single-column content flow.
- `max-width: 760px`: switches the header to a hamburger menu, collapses grids to one column, and changes the footer/contact alignment for touch layouts.
- Desktop: wider two-column hero and about layouts, three-column skills/projects compositions, and expanded navigation.

## Accessibility and interaction

Semantic `header`, `nav`, `main`, `section`, `article`, and `footer` elements establish the document structure. A skip link, descriptive link labels, visible focus states, keyboard Escape handling, and `aria-expanded`/`aria-controls` navigation state support keyboard and assistive technology users. The CSS honors `prefers-reduced-motion`.

The mobile navigation is controlled by `js/script.js`. It animates open and closed, closes after a section link is selected, and returns focus to the toggle when Escape is pressed.

## Technical decisions

- No framework or runtime dependency is needed for the site.
- The test suite uses Node's built-in test runner, avoiding an unnecessary dependency install for structural checks.
- `run.bat` opens the static entry point directly because there is no server-side behavior yet.
- Contact actions use Sana's Gmail, GitHub, and LinkedIn profiles.
