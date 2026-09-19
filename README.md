# Sahit Personal Portfolio

This is a personal brand website for Sahit Mandapati. It presents a modern, responsive site built around writing, books, and projects, with work experience as one part of the picture rather than the focus.

## Overview

The website is a static single-page portfolio built using:

- HTML
- CSS
- JavaScript
- JSON data files for structured content
- Markdown files for blog posts

The content is loaded dynamically from the `data/` folder and rendered into the page using JavaScript. This makes it easy to update personal information without changing the page structure.

Blog posts are automatically discovered from the `data/blogs/` folder. Any new `.md` file dropped into that folder will appear in the Writing section without additional configuration.

## Features

- Responsive portfolio layout
- Dark/light theme toggle
- Hero section with intro and profile picture
- Work experience timeline
- Featured projects section
- Writing and notes section
- Books section
- Certifications section
- Contact section with social links
- Clean, modern design

## Project Structure

```text
.
├── index.html
├── data/
│   ├── assets/
│   ├── books.json
│   ├── certifications.json
│   ├── experience.json
│   ├── projects.json
│   ├── social.json
│   └── blogs/
│       └── your-blog-post.md
├── js/
│   ├── components.js
│   ├── data.js
│   ├── main.js
│   └── theme.js
├── styles/
│   ├── main.css
│   ├── revamp.css
│   └── themes.css
├── .gitignore
├── README.md
└── .vscode/
```

## Prerequisites

You need:

- A modern web browser
- Python 3 (recommended) or Node.js

## How to Run

Because the site loads JSON files with browser fetch requests, it should be served from a local web server instead of opening the HTML file directly.

### Option 1: Python

From the project root, run:

```bash
cd /Users/sahitmandapati/Documents/GitHub/SahitPersonalPortfolio
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: Node.js

If you have Node.js installed, run:

```bash
cd /Users/sahitmandapati/Documents/GitHub/SahitPersonalPortfolio
npx serve .
```

Then open the local URL printed in the terminal.

## Stop the Server

Press:

```bash
Ctrl + C
```

## Updating Content

### Blog posts

Add a new Markdown file to `data/blogs/` and it will appear automatically in the Writing section when the page loads.

Example:

```md
---
title: My New Blog Post
description: A short summary that appears on the card.
category: Notes
date: 2026-09-19
---

# My New Blog Post

Your blog content goes here...
```

Optional front matter fields include `title`, `description`, `category`, and `date`.

### Other portfolio data

You can update the rest of the portfolio content by editing the JSON files in the `data/` directory:

- `data/social.json`
- `data/experience.json`
- `data/projects.json`
- `data/certifications.json`
- `data/books.json`

The page automatically reads these files when the site loads.

## Notes

- Do not open the main HTML file directly in the browser if you want the JSON content to load correctly.
- A local HTTP server is required for proper data fetching.
- This project is designed for static hosting and can be deployed to GitHub Pages, Netlify, Vercel, or similar platforms.

## License

This project is intended for personal use. Please check with the owner before reusing or republishing content.
