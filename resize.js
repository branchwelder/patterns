const trigger = (e) => e.composedPath()[0];
const matchesTrigger = (e, selectorString) =>
  trigger(e).matches(selectorString);

// create on listener
export const createListener =
  (target) => (eventName, selectorString, event) => {
    // focus doesn't work with this, focus doesn't bubble, need focusin
    target.addEventListener(eventName, (e) => {
      e.trigger = trigger(e); // Do I need this? e.target seems to work in many (all?) cases
      if (selectorString === "" || matchesTrigger(e, selectorString)) event(e);
    });
  };

export function resizeHandler(parentEl) {
  const listen = createListener(parentEl);

  let resizer;
  let direction;
  let nextSibling;
  let prevSibling;

  let prevH, prevW, nextH, nextW;

  let x = 0;
  let y = 0;

  listen("pointerdown", ".resizable", mouseDownHandler);

  function parentRect() {
    return resizer.parentNode.getBoundingClientRect();
  }

  function mouseDownHandler(e) {
    resizer = e.target;

    direction = resizer.getAttribute("data-direction") || "horizontal";
    nextSibling = resizer.nextElementSibling;
    prevSibling = resizer.previousElementSibling;

    x = e.clientX;
    y = e.clientY;

    const prevRect = prevSibling.getBoundingClientRect();
    const nextRect = nextSibling.getBoundingClientRect();

    prevH = prevRect.height;
    prevW = prevRect.width;

    nextH = nextRect.height;
    nextW = nextRect.width;

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  }

  function mouseMoveHandler(e) {
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    if (direction == "vertical") {
      const h = ((prevH + dy) * 100) / parentRect().height;
      prevSibling.style.height = `${h}%`;
      const nh = ((nextH - dy) * 100) / parentRect().height;
      nextSibling.style.height = `${nh}%`;
    } else {
      const w = ((prevW + dx) * 100) / parentRect().width;
      prevSibling.style.width = `${w}%`;
    }

    const cursor = direction === "horizontal" ? "col-resize" : "row-resize";
    resizer.style.cursor = cursor;
    document.body.style.cursor = cursor;
  }

  const mouseUpHandler = function () {
    resizer.style.removeProperty("cursor");
    document.body.style.removeProperty("cursor");

    prevSibling.style.removeProperty("user-select");
    prevSibling.style.removeProperty("pointer-events");

    nextSibling.style.removeProperty("user-select");
    nextSibling.style.removeProperty("pointer-events");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };
}
