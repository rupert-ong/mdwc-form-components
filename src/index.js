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
document.querySelectorAll('._validate').forEach(function(elem) {
  elem.setAttribute('novalidate', true);
});

window.onload = function() {
  initTextFields();
};

function initTextFields() {
  document
    .querySelectorAll(
      '.mdwc-text-field--outlined:not(.mdwc-text-field--disabled)'
    )
    .forEach(function(elem) {
      var input = elem.querySelector('.mdwc-text-field__form-control');
      if (String(input.value).trim().length > 0) {
        input.focus();
        input.blur();
      }
    });
}

/* Focus and blur methods for Floating Labels */
document.addEventListener(
  'focus',
  function(e) {
    if (e.target instanceof Element === false) return;
    if (
      e.target.closest(
        '.mdwc-text-field--outlined:not(.mdwc-text-field--disabled)'
      )
    ) {
      var container = e.target.closest('.mdwc-text-field--outlined'),
        notch = container.querySelector('.mdwc-notched-outline__notch'),
        label = notch.querySelector('.mdwc-floating-label');

      changeNotchWidth(label, notch);

      container.classList.add('mdwc-text-field--focused');
      notch.classList.add('mdwc-notched-outline__notch--notched');
    }
  },
  true
);

function changeNotchWidth(label, notch) {
  if (!notch.classList.contains('mdwc-notched-outline__notch--notched')) {
    var transformedWidth;
    label.style.transform = 'scale(0.75, 0.75)';
    label.style.transition = 'none';
    transformedWidth = label.getBoundingClientRect().width + 10;
    label.style.removeProperty('transform');
    label.style.removeProperty('transition');
    notch.style.width = transformedWidth + 'px';
  }
}

document.addEventListener(
  'blur',
  function(e) {
    // Input Styles
    if (e.target instanceof Element === false) return;

    if (
      e.target.matches('.mdwc-text-field__form-control') &&
      e.target.closest('.mdwc-text-field--outlined')
    ) {
      var container = e.target.closest('.mdwc-text-field--outlined'),
        notch = container.querySelector('.mdwc-notched-outline__notch');

      container.classList.remove('mdwc-text-field--focused');
      if (!e.target.value) {
        notch.classList.remove('mdwc-notched-outline__notch--notched');
        notch.style.removeProperty('width');
      }
    }

    // Form Validity
    if (!e.target.form.classList.contains('_validate')) return;

    var error = hasError(e.target);
    if (error) {
      showError(e.target, error);
      return;
    }
    hideError(e.target);
  },
  true
);

// Validity function
function hasError(field) {
  if (
    field.disabled ||
    field.type === 'file' ||
    field.type === 'reset' ||
    field.type === 'submit'
  )
    return;

  var validity = field.validity;

  if (validity.valid) return;

  if (validity.valueMissing) return 'Please fill out this field';

  if (validity.typeMismatch) {
    if (field.type === 'email') return 'Please enter an email address';
    if (field.type === 'url') return 'Please enter a URL';
  }

  if (validity.tooShort)
    return (
      'Please lengthen this text to ' +
      field.getAttribute('minLength') +
      ' characters or more'
    );

  if (validity.tooLong)
    return (
      'Please shorten this text to less than ' +
      field.getAttribute('maxLength') +
      ' characters or less'
    );

  if (validity.badInput) return 'Please enter a number';

  if (validity.stepMismatch) return 'Please select a valid value';

  if (validity.rangeOverflow)
    return (
      'Please select a value smaller than or equal to ' + field.getAttribute('max')
    );

  if (validity.rangeUnderflow)
    return (
      'Please select a value larger than or equal to ' + field.getAttribute('min')
    );

  if (validity.patternMismatch) {
    if (field.hasAttribute('title')) return field.getAttribute('title');
    return 'Please match the requested format';
  }

  return 'The value you entered for this field is invalid';
}

function hideError(field) {
  if (
    field.disabled ||
    field.type === 'file' ||
    field.type === 'reset' ||
    field.type === 'submit'
  )
    return;

  var isInlineField = field.type === 'radio' || field.type === 'checkbox',
    component = isInlineField
      ? field.closest('.mdwc-form-field')
      : field.closest('.mdwc-text-field'),
    helperLineText = component.nextElementSibling.querySelector(
      isInlineField
        ? '.mdwc-form-field-helper-line__text'
        : '.mdwc-text-field-helper-line__text'
    );

  component.classList.remove(
    isInlineField ? 'mdwc-form-field-error' : 'mdwc-text-field--error'
  );
  helperLineText.innerHTML = helperLineText.dataset.helper
    ? helperLineText.dataset.helper
    : '';
}

function showError(field, error) {
  var isInlineField = field.type === 'radio' || field.type === 'checkbox',
    component = isInlineField
      ? field.closest('.mdwc-form-field')
      : field.closest('.mdwc-text-field'),
    helperLineText = component.nextElementSibling.querySelector(
      isInlineField
        ? '.mdwc-form-field-helper-line__text'
        : '.mdwc-text-field-helper-line__text'
    );

  component.classList.add(
    isInlineField ? 'mdwc-form-field--error' : 'mdwc-text-field--error'
  );
  helperLineText.innerHTML = error;
}

// Firefox bug on input[number] not focusing on numeric stepper click
document.addEventListener('change', function(e) {
  if (e.target.type === 'number') e.target.focus();
});

// Validate on submit
document.addEventListener('submit', function(e) {
  if (!e.target.classList.contains('_validate')) return;

  var fields = e.target.elements,
    i = 0,
    error,
    fieldWithError;

  for (; i < fields.length; i++) {
    var field = fields[i];
    error = hasError(field);
    if (error) {
      showError(field, error);
      fieldWithError = !fieldWithError ? field : fieldWithError;
    }

    if (fieldWithError) {
      e.preventDefault();
      fieldWithError.focus();
    }
  }
});

/* Toggle Input states */
document.querySelector('._toggleDisable').addEventListener(
  'click',
  function(e) {
    var inputContainers = document.querySelectorAll('.mdwc-text-field'),
      i = 0;
    for (; i < inputContainers.length; i++) {
      var elem = inputContainers[i],
        input = elem.querySelector('.mdwc-text-field__form-control');
      elem.classList.toggle('mdwc-text-field--disabled');
      input.disabled = !input.disabled;
    }
  },
  false
);

document.querySelector('._toggleError').addEventListener(
  'click',
  function(e) {
    var inputContainers = document.querySelectorAll('.mdwc-text-field'),
      i = 0;
    for (; i < inputContainers.length; i++) {
      var elem = inputContainers[i];
      elem.classList.toggle('mdwc-text-field--error');
    }
  },
  false
);
