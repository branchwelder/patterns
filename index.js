import { EditorView } from "@codemirror/view";

import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";

import { editorSetup } from "./editor";
import { resizeHandler } from "./resize.js";

const workspace = document.getElementById("workspace");

const edHTML = document.getElementById("editor-html");
const edCSS = document.getElementById("editor-css");
const edJS = document.getElementById("editor-js");

let cssView = new EditorView({
  doc: `p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}`,
  parent: edCSS,
  extensions: [editorSetup, css()],
});

let htmlView = new EditorView({
  doc: `<div id="editor-container">
  <div id="editor-html"></div>
  <div id="editor-css"></div>
  <div id="editor-js"></div>
</div>
<div id="output"></div>`,
  parent: edHTML,
  extensions: [editorSetup, html()],
});

let jsView = new EditorView({
  doc: "console.log('hello world!)\n",
  parent: edJS,
  extensions: [editorSetup, javascript()],
});

resizeHandler(workspace);

// resizeHandler("split-resize");
// resizeHandler("title-css");
// resizeHandler("title-js");
