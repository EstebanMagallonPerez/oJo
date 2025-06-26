import os
import re
from html.parser import HTMLParser

from pathlib import Path



html_tag_to_interface = {
    # Table-related
    "table": "HTMLTableElement",
    "tr": "HTMLTableRowElement",
    "td": "HTMLTableCellElement",
    "th": "HTMLTableCellElement",
    "thead": "HTMLTableSectionElement",
    "tbody": "HTMLTableSectionElement",
    "tfoot": "HTMLTableSectionElement",
    "caption": "HTMLTableCaptionElement",

    # Form-related
    "input": "HTMLInputElement",
    "textarea": "HTMLTextAreaElement",
    "select": "HTMLSelectElement",
    "option": "HTMLOptionElement",
    "button": "HTMLButtonElement",
    "form": "HTMLFormElement",
    "label": "HTMLLabelElement",
    "fieldset": "HTMLFieldSetElement",
    "legend": "HTMLLegendElement",
    "output": "HTMLOutputElement",
    "optgroup": "HTMLOptGroupElement",

    # Text & layout
    "p": "HTMLParagraphElement",
    "h1": "HTMLHeadingElement",
    "h2": "HTMLHeadingElement",
    "h3": "HTMLHeadingElement",
    "h4": "HTMLHeadingElement",
    "h5": "HTMLHeadingElement",
    "h6": "HTMLHeadingElement",
    "div": "HTMLDivElement",
    "span": "HTMLSpanElement",
    "pre": "HTMLPreElement",
    "blockquote": "HTMLQuoteElement",
    "hr": "HTMLHRElement",

    # Links & media
    "a": "HTMLAnchorElement",
    "img": "HTMLImageElement",
    "video": "HTMLVideoElement",
    "audio": "HTMLAudioElement",
    "canvas": "HTMLCanvasElement",
    "iframe": "HTMLIFrameElement",

    # Script & styles
    "script": "HTMLScriptElement",
    "style": "HTMLStyleElement",
    "link": "HTMLLinkElement",
    "template": "HTMLTemplateElement",

    # Lists
    "ul": "HTMLUListElement",
    "ol": "HTMLOListElement",
    "li": "HTMLLIElement",
    "dl": "HTMLDListElement",
    "dt": "HTMLElement",
    "dd": "HTMLElement",

    # Tables and structure
    "colgroup": "HTMLTableColElement",
    "col": "HTMLTableColElement",

    # Metadata (not extendable)
    "title": "HTMLTitleElement",
    "meta": "HTMLMetaElement",
    "base": "HTMLBaseElement",
    "head": "HTMLHeadElement",
    "body": "HTMLBodyElement",
    "html": "HTMLHtmlElement",
}









class FirstTagParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.first_tag = None

    def handle_starttag(self, tag, attrs):
        if not self.first_tag:
            self.first_tag = tag

# Optional: Install rjsmin with `pip install rjsmin`
from rjsmin import jsmin

dirname = "www/compiled"
template_folder = "www/template"
compiled_file = ""
global_style = ""

# Read helper.js
try:
    with open("./compileHelpers/helper.js", "r", encoding="utf-8") as f:
        compiled_file = f.read()
except Exception as e:
    print("Error reading helper.js:", e)

# Read componentRenderer.js
try:
    with open("./compileHelpers/componentRenderer.js", "r", encoding="utf-8") as f:
        component = f.read()
except Exception as e:
    print("Error reading componentRenderer.js:", e)

def on_error(err):
    print("Error:", err)

# Ensure output directory exists
os.makedirs(dirname, exist_ok=True)

try:
    filenames = os.listdir(template_folder)
except Exception as err:
    on_error(err)
    filenames = []

count = 0

for filename in filenames:
    print("Compiling", filename)
    filepath = os.path.join(template_folder, filename)
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Failed to read {filename}: {e}")
        continue

    parser = FirstTagParser()
    parser.feed(content)
    htmlElement = "HTMLElement"
    if parser.first_tag in html_tag_to_interface:
        htmlElement = html_tag_to_interface[parser.first_tag]
    # Replace placeholders
    component_text = component
    component_text = component_text.replace("FILENAME_REPLACE", f"/template/{filename}")
    component_text = component_text.replace("FILENAME_REPLACE", f"/template/{filename}")
    component_text = component_text.replace("CLASSNAME_REPLACE", f"template_{count}")
    component_text = component_text.replace("HTML_ELEMENT_TYPE", htmlElement)
    
    component_text += (
        f'customElements.define("{filename.replace(".html", "")}", template_{count}, {{ extends: "{parser.first_tag}" }});'
    )

    # Extract <script> content
    script_content = ""
    if "<script>" in content:
        script_match = re.search(r"<script>(.*?)</script>", content, re.DOTALL)
        if script_match:
            script_content = script_match.group(1)

    # Extract <style> content
    if "<style>" in content:
        style_match = re.search(r"<style>(.*?)</style>", content, re.DOTALL)
        if style_match:
            global_style += style_match.group(1)

    # Insert script into component
    component_text = component_text.replace("CUSTOM_ONLOAD", script_content)
    compiled_file += component_text

    print("Linting", filename)
    print("Compiled", filename)
    count += 1

# Write compiled.js
compiled_js_path = os.path.join(dirname, "compiled.js")
with open(compiled_js_path, "w", encoding="utf-8") as f:
    f.write(compiled_file)
print("Spitting out the compiled JS:", compiled_js_path)

# Minify
compiled_min_js_path = os.path.join(dirname, "compiled.min.js")
minified = jsmin(compiled_file)
with open(compiled_min_js_path, "w", encoding="utf-8") as f:
    f.write(minified)
print("Barfing out the minified JS:", compiled_min_js_path)

# Write stylesheet
style_path = os.path.join(dirname, "style.css")
with open(style_path, "w", encoding="utf-8") as f:
    f.write(global_style)
print("Spitting out the stylesheet:", style_path)