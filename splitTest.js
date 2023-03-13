import Split from "split.js";

function gutterFunc(index, direction) {
  const gutter = document.createElement("div");
  gutter.className = `gutter gutter-${direction}`;
  return gutter;
}

Split(["#one", "#two", "#three"], {
  cursor: "row-resize",
  minSize: 0,
  direction: "vertical",
});

Split(["#editor-container", "#output"], {
  minSize: 200,
});
