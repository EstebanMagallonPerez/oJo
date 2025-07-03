# oJo Frontend Framework

## About

oJo is a custom frontend framework that lets you build web UIs using HTML templates and custom elements. Instead of writing JavaScript-heavy code, you define your UI in HTML and use special `is="component-name"` attributes to render components.

- Templates are stored in `www/template/` as HTML files.
- Custom elements like `bs-navbar`, `bs-carousel-container`, and `bs-container` are rendered dynamically.
- Data can be passed to components using the `data-template` attribute.
  - If a custom element does not have a `data-template` attribute directly attached, it will automatically inherit the nearest parent node's `data-template` value. This allows for implicit data context propagation, making deeply nested templates easier to manage and reducing the need to redundantly specify `data-template` on every element. If you want a component to use a specific data context, simply add `data-template` to that element; otherwise, it will use the closest ancestor's value.
- Template and custom element names must be in the format `somestring-somestring` (contain a hyphen `-`). This is required by the browser's custom elements specification.
- **Build Step:** You must run `python compile.py` to generate the JavaScript (`compiled/compiled.js`) that enables your custom template elements before starting the server.

---

## Template Usage Examples

### Example: Simple Template Usage

```html
<div is="bs-container">
  <h1>Hello World!</h1>
</div>
```

### Example: Nested Templates Unrolling

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

#### What this unrolls to at runtime:

```html
<div class="container">
  <div id="carouselExampleCaptions" class="carousel slide">
    <div class="carousel-indicators">...</div>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="..." class="d-block w-100" alt="" />
        <div class="carousel-caption d-none d-md-block">
          <h5>Nested!</h5>
          <p>This is deeply nested.</p>
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" ...>...</button>
    <button class="carousel-control-next" ...>...</button>
  </div>
</div>
```

The above single line of HTML will be expanded at runtime into a full carousel with all nested elements rendered and data applied, thanks to the oJo framework's template system.

---

## About WatchedObject and Live Data Binding

**WatchedObject** is a special JavaScript helper that lets you create objects whose properties are automatically observed for changes. When you use a `WatchedObject` as the data source for a component (by passing it to `data-template`), any changes you make to its properties in JavaScript will automatically update the corresponding element in the UI—no manual refresh or re-render is needed.

- Just create your data as `new WatchedObject({...})` and use it in your template.
- When you change a property (e.g. `myObj.title = 'New Title'`), the UI updates instantly.
- This enables true two-way data binding between your JavaScript and your HTML templates.

#### Example: Live Data Binding

```js
const navData = new WatchedObject({ title: "Home", link: "#" });
// ...
// In your HTML:
// <li is="bs-navbar-item" data-template="navData"></li>
// ...
// Later in JS:
navData.title = "Dashboard"; // The navbar item updates automatically!
```

---

## Template File Format

oJo template files are plain HTML files stored in `www/template/`. Each file defines the structure for a custom element, using standard HTML and `<slot>` for content insertion. You can use `{{variable}}` placeholders anywhere in the template to inject data from your JavaScript objects.

- **File location:** `www/template/your-component.html`
- **Placeholders:** Use `{{variable}}` to mark where data should be inserted.
- **Slots:** Use `<slot>` to allow child content to be inserted.
- **Custom attributes:** You can use `data-template` to pass data to the template. If a template does not have a `data-template` attribute, it will inherit the value from the nearest parent node with a `data-template`.

#### Example: Simple Template File

```html
<div class="container">
  <h1>{{title}}</h1>
  <slot></slot>
</div>
```

This template will render a Bootstrap container with a dynamic title and any child content placed inside the custom element.

---

## How <style> and <script> in Templates Work

When you include `<style>` or `<script>` tags in your template files, the build process will automatically extract them and compile their contents into the appropriate output files:

- **<style> blocks** from all templates are combined and written to `www/compiled/style.css`. This ensures all component styles are loaded globally and only once.
- **<script> blocks** from all templates are combined and written to `www/compiled/compiled.js`. This allows you to define component-specific JavaScript that is loaded with your app.
- Neither `<style>` nor `<script>` tags are included in the final rendered HTML at runtime—they are extracted at build time for performance and maintainability.

#### Example: Template with <style> and <script>

```html
<div class="my-widget">
  <h2>{{title}}</h2>
  <slot></slot>
</div>
<style>
  .my-widget {
    color: purple;
  }
</style>
<script>
  console.log("Widget loaded!");
</script>
```

When you run `python compile.py`, the CSS and JS above will be extracted and bundled into the global compiled files, not left in the HTML.

---

## Features

- Component-based: Build your UI with reusable HTML templates and custom elements.
- Bootstrap Integration: Leverage the full power of Bootstrap 5 for responsive, beautiful layouts.
- Declarative Syntax: Describe your UI in HTML, not JavaScript. Pass data easily with `data-template`.
- Live Data Binding: Use `WatchedObject` for instant UI updates from JavaScript changes.

---

## Navigation Example

If you want to add navigation to your sections, use a `navbarData` array like this:

```js
const n1 = new WatchedObject({ link: "#intro-section", title: "Intro" });
const n2 = new WatchedObject({ link: "#examples-section", title: "Examples" });
const n3 = new WatchedObject({
  link: "#watchedobject-section",
  title: "WatchedObject",
});
const n4 = new WatchedObject({
  link: "#template-format-section",
  title: "File Format",
});
const n5 = new WatchedObject({
  link: "#script-style-section",
  title: "Script/Style",
});
navbarData = [n1, n2, n3, n4, n5];
```

---

## Build & Usage

1. Run `python compile.py` to generate the compiled JS and CSS.
2. Start your server (e.g. `python server.py`).
3. Open `http://localhost:8000` in your browser.

---

## License

MIT
