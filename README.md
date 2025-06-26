# oJo Frontend Framework

A simple, declarative frontend framework using HTML templates and custom elements. This project uses Bootstrap 5 as an example, but you can use any frontend library or CSS framework in place of Bootstrap.

## Getting Started

1. **Install Python 3** (if not already installed)
2. Build the project to generate the JavaScript for template elements:
   ```sh
   python compile.py
   ```
3. Start the server:
   ```sh
   python server.py
   ```
4. Open your browser to [http://localhost:3000](http://localhost:3000)

## Project Structure

- `www/` — All static files and templates
- `www/template/` — HTML templates for custom elements
- `server.py` — Python HTTP server
- `compile.py` — Build script to generate the JavaScript for custom elements

## How It Works

- Use custom elements with the `is` attribute to declare UI components.
- Templates are stored as HTML files in `www/template/`.
- Data can be passed to components using the `data-template` attribute.
- The framework expands a single line of HTML with nested custom elements into full markup at runtime.
- While Bootstrap 5 is used in this example, you can adapt the templates to use any frontend library or CSS framework you prefer.
- **Note:** Template and custom element names must be in the format `somestring-somestring` (contain a hyphen `-`). This is required by the browser's custom elements specification and is necessary for your components to work correctly.
- **Note:** You must run `python compile.py` to generate the JavaScript (`compiled/compiled.js`) that enables your custom template elements before starting the server.

## Example: Simple Template Usage

```html
<div is="bs-container">
  <h1>Hello World!</h1>
</div>
```

## Example: Nested Templates Unrolling

```html
<div is="bs-container">
  <div is="bs-carousel-container">
    <div is="bs-carousel-item" data-template="{isActive:'active'}">
      <div
        is="bs-carousel-caption"
        data-template="{captionTitle:'Nested!',captionText:'This is deeply nested.'}"
      ></div>
    </div>
  </div>
</div>
```

The above single line of HTML will be expanded at runtime into a full Bootstrap carousel with all nested elements rendered and data applied, thanks to the oJo framework's template system.

## Features

- Component-based UI with reusable HTML templates
- Bootstrap 5 integration for modern, responsive layouts (or use your own framework)
- Declarative syntax: describe your UI in HTML, not JavaScript
- Easy data binding with `data-template`

---

© 2025 oJo Frontend Framework Demo
