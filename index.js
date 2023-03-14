import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import Split from "split.js";
import { html, render } from "lit-html";

import { css } from "@codemirror/lang-css";
import { html as langHTML } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";

import { editorSetup } from "./editor";
import snippets from "./snippets.json";

let htmlView, cssView, jsView;

let snippet = snippets["downloadJSON"];

function copyCode(e, lang) {
  navigator.clipboard.writeText(snippet[lang]);

  e.target.classList.add("success");

  setTimeout(() => {
    e.target.classList.remove("success");
  }, 1);
}

function saveSnippet() {
  const downloadLink = document.createElement("a");
  downloadLink.href =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(snippet));
  downloadLink.download = "snippet.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function listener(lang) {
  return EditorView.updateListener.of((v) => {
    snippet[lang] = v.state.doc.toString();
    renderView();
  });
}

function setEditorStates() {
  cssView.setState(cssState(snippet.css));
  htmlView.setState(htmlState(snippet.html));
  jsView.setState(jsState(snippet.js));
}

function loadSnippet(e) {
  let snippetID = e.target.dataset.snippetid;
  snippet = snippets[snippetID];

  setEditorStates();
  renderView();
}

function cssState(stateDoc) {
  return EditorState.create({
    doc: stateDoc,
    extensions: [editorSetup, css(), listener("css")],
  });
}

function htmlState(stateDoc) {
  return EditorState.create({
    doc: stateDoc,
    extensions: [editorSetup, langHTML(), listener("html")],
  });
}

function jsState(stateDoc) {
  return EditorState.create({
    doc: stateDoc,
    extensions: [editorSetup, javascript(), listener("js")],
  });
}

function makeSrc() {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Output</title>
        <style>

          ${snippet.css}
        </style>
      </head>
      <body>
        ${snippet.html}
        <script>
          const _log = console.log;
          console.log = function(...rest) {
            window.parent.postMessage(
              {
                source: 'iframe',
                message: rest,
              },
              '*'
            );
            _log.apply(console, arguments);
          };
          ${snippet.js};
        </script>
      </body>
    </html>`;
}

window.addEventListener("message", function (response) {
  if (response.data && response.data.source === "iframe") {
    console.log("from output", response.data.message);
  }
});

function view() {
  return html` <div id="editor-container">
      <div id="toolbar">
        <span>snippets</span>
        <span id="icons">
          <i @click=${saveSnippet} class="fa-solid fa-floppy-disk fa-fw"></i>
          <i
            id="pattern-icon"
            @click=${loadSnippet}
            class="fa-solid fa-book fa-fw">
            <div id="pattern-dropdown">
              ${Object.keys(snippets).map(
                (snippetID) =>
                  html`<div data-snippetid=${snippetID}>${snippetID}</div>`
              )}
            </div>
          </i>
        </span>
      </div>
      <div id="editor-html" class="editor" style="--color: var(--orange)">
        <div class="editor-title">
          <span>html</span>
          <i
            @click=${(e) => copyCode(e, "html")}
            class="fa-solid fa-copy fa-xs">
            <div class="copied">copied!</div>
          </i>
        </div>
        <div id="html-container"></div>
      </div>
      <div id="editor-css" class="editor" style="--color: var(--green)">
        <div class="editor-title">
          <span>css</span>
          <i @click=${(e) => copyCode(e, "css")} class="fa-solid fa-copy fa-xs">
            <div class="copied">copied!</div>
          </i>
        </div>
        <div id="css-container"></div>
      </div>
      <div id="editor-js" class="editor" style="--color: var(--purple)">
        <div class="editor-title">
          <span>javascript</span>
          <i @click=${(e) => copyCode(e, "js")} class="fa-solid fa-copy fa-xs">
            <div class="copied">copied!</div>
          </i>
        </div>
        <div id="js-container"></div>
      </div>
    </div>
    <div id="output">
      <iframe srcdoc=${makeSrc()}></iframe>
    </div>`;
}

function renderView() {
  render(view(), document.body);
}

function init() {
  renderView();

  Split(["#editor-html", "#editor-css", "#editor-js"], {
    cursor: "row-resize",
    minSize: 0,
    direction: "vertical",
    gutterSize: 7,
  });

  Split(["#editor-container", "#output"], { gutterSize: 7 });

  cssView = new EditorView({
    parent: document.getElementById("css-container"),
    state: cssState("h1 {font-family: monospace;}"),
  });

  htmlView = new EditorView({
    parent: document.getElementById("html-container"),
    state: htmlState("<h1>hello world</h1>"),
  });

  jsView = new EditorView({
    parent: document.getElementById("js-container"),
    state: jsState("console.log('hello world');"),
  });

  setEditorStates();
  renderView();
}

init();
