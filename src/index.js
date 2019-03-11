/* IE9+ Closest + Matches Polyfill */
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

/* Nodelist ForEach polyfill */
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

/* Disable native browser validatin */
document.querySelectorAll('._validate').forEach(function(elem){
  elem.setAttribute('novalidate', true);
})


window.onload = function() {
  initTextFields();
};

function initTextFields() {
  document
    .querySelectorAll(
      ".mdwc-text-field--outlined:not(.mdwc-text-field--disabled)"
    )
    .forEach(function(elem) {
      var input = elem.querySelector(".mdwc-text-field__form-control");
      if (String(input.value).trim().length > 0) {
        input.focus();
        input.blur();
      }
    });
}

/* Focus and blur methods for Floating Labels */
document.addEventListener(
  "focus",
  function(e) {
    if (e.target instanceof Element === false) return;
    if (
      e.target.closest(
        ".mdwc-text-field--outlined:not(.mdwc-text-field--disabled)"
      )
    ) {
      var container = e.target.closest(".mdwc-text-field--outlined"),
        notch = container.querySelector(".mdwc-notched-outline__notch"),
        label = notch.querySelector(".mdwc-floating-label");

      changeNotchWidth(label, notch);

      container.classList.add("mdwc-text-field--focused");
      notch.classList.add("mdwc-notched-outline__notch--notched");
    }
  },
  true
);

function changeNotchWidth(label, notch) {
  if (!notch.classList.contains("mdwc-notched-outline__notch--notched")) {
    var transformedWidth;
    label.style.transform = "scale(0.75, 0.75)";
    label.style.transition = "none";
    transformedWidth = label.getBoundingClientRect().width + 10;
    label.style.removeProperty("transform");
    label.style.removeProperty("transition");
    notch.style.width = transformedWidth + "px";
  }
}

document.addEventListener(
  "blur",
  function(e) {
    if (e.target instanceof Element === false) return;
    if (
      e.target.matches(".mdwc-text-field__form-control") &&
      e.target.closest(".mdwc-text-field--outlined")
    ) {
      var container = e.target.closest(".mdwc-text-field--outlined"),
        notch = container.querySelector(".mdwc-notched-outline__notch");

      container.classList.remove("mdwc-text-field--focused");
      if (!e.target.value) {
        notch.classList.remove("mdwc-notched-outline__notch--notched");
        notch.style.removeProperty("width");
      }
    }
  },
  true
);

// Firefox bug on input[number] not focusing on numeric stepper click
document.addEventListener("change", function(e) {
  if (e.target.type === "number") e.target.focus();
});

/* Toggle Input states */
document.querySelector("._toggleDisable").addEventListener(
  "click",
  function(e) {
    var inputContainers = document.querySelectorAll(".mdwc-text-field"),
      i = 0;
    for (; i < inputContainers.length; i++) {
      var elem = inputContainers[i],
        input = elem.querySelector(".mdwc-text-field__form-control");
      elem.classList.toggle("mdwc-text-field--disabled");
      input.disabled = !input.disabled;
    }
  },
  false
);

document.querySelector("._toggleError").addEventListener(
  "click",
  function(e) {
    var inputContainers = document.querySelectorAll(".mdwc-text-field"),
      i = 0;
    for (; i < inputContainers.length; i++) {
      var elem = inputContainers[i];
      elem.classList.toggle("mdwc-text-field--error");
    }
  },
  false
);
