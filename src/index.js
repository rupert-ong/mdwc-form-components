/* IE9+ Closest + Matches Polyfill */
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
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
document.querySelectorAll('._mdwc-validate').forEach(function(elem) {
  elem.setAttribute('novalidate', true);
});

window.onload = function() {
  initTextFields();
};

function initTextFields() {
  document.querySelectorAll('.mdwc-text-field--outlined:not(.mdwc-text-field--disabled)').forEach(function(elem) {
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
    if (e.target.closest('.mdwc-text-field--outlined:not(.mdwc-text-field--disabled)')) {
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

    if (e.target.matches('.mdwc-text-field__form-control') && e.target.closest('.mdwc-text-field--outlined')) {
      var container = e.target.closest('.mdwc-text-field--outlined'),
        notch = container.querySelector('.mdwc-notched-outline__notch');

      container.classList.remove('mdwc-text-field--focused');
      if (!e.target.value) {
        notch.classList.remove('mdwc-notched-outline__notch--notched');
        notch.style.removeProperty('width');
      }
    }

    // Form Validity
    if (e.target.form && !e.target.form.classList.contains('_mdwc-validate')) return;

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
  if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit') return;

  var validity = field.validity;

  if (validity.valid) return;

  if (validity.valueMissing) {
    if (field.type === 'radio' || field.type === 'checkbox' || field.nodeName.toLowerCase() === 'select')
      return 'Please select a value';
    return 'Please fill out this field';
  }
  if (validity.typeMismatch) {
    if (field.type === 'email') return 'Please enter an email address';
    if (field.type === 'url') return 'Please enter a URL';
  }

  if (validity.tooShort)
    return 'Please lengthen this text to ' + field.getAttribute('minLength') + ' characters or more';

  if (validity.tooLong)
    return 'Please shorten this text to less than ' + field.getAttribute('maxLength') + ' characters or less';

  if (validity.badInput) return 'Please enter a number';

  if (validity.stepMismatch) return 'Please select a valid value';

  if (validity.rangeOverflow) return 'Please enter a value smaller than or equal to ' + field.getAttribute('max');

  if (validity.rangeUnderflow) return 'Please enter a value larger than or equal to ' + field.getAttribute('min');

  if (validity.patternMismatch) {
    if (field.hasAttribute('title')) return field.getAttribute('title');
    return 'Please match the requested format';
  }

  return 'The value you entered for this field is invalid';
}

function hideError(field) {
  if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit') return;

  var isInlineField = field.type === 'radio' || field.type === 'checkbox',
    component = isInlineField ? field.closest('.mdwc-form-field') : field.closest('.mdwc-text-field'),
    helperLineText = component.nextElementSibling;

  component.classList.remove(isInlineField ? 'mdwc-form-field-error' : 'mdwc-text-field--error');
  helperLineText.innerHTML = helperLineText.dataset.helper ? helperLineText.dataset.helper : '';
}

function showError(field, error) {
  var isInlineField = field.type === 'radio' || field.type === 'checkbox',
    component = isInlineField ? field.closest('.mdwc-form-field') : field.closest('.mdwc-text-field'),
    helperLineText = component.nextElementSibling;

  component.classList.add(isInlineField ? 'mdwc-form-field--error' : 'mdwc-text-field--error');
  helperLineText.innerHTML = error;
}

// Firefox bug on input[number] not focusing on numeric stepper click
document.addEventListener('change', function(e) {
  if (e.target.type === 'number') e.target.focus();
});

// Validate on submit
document.addEventListener('submit', function(e) {
  if (!e.target.classList.contains('_mdwc-validate')) return;

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

/* Validity Polyfill */
(function(window, document, undefined) {
  var supported = function() {
    var input = document.createElement('input');
    return (
      'validity' in input &&
      'badInput' in input.validity &&
      'patternMismatch' in input.validity &&
      'rangeOverflow' in input.validity &&
      'stepMismatch' in input.validity &&
      'tooLong' in input.validity &&
      'tooShort' in input.validity &&
      'typeMismatch' in input.validity &&
      'valid' in input.validity &&
      'valueMissing' in input.validity
    );
  };

  var getValidityState = function(field) {
    var type = field.getAttribute('type') || field.nodeName.toLowerCase(),
      isNum = type === 'number' || type === 'range',
      length = field.value.length;

    if (field.type === 'radio' && field.name) {
      var group = document.getElementsByName(field.name);
      if (group.length > 0) {
        var i = 0;
        for (; i < group.length; i++) {
          if (group[i].form === field.form && field.checked) {
            field = group[i];
            break;
          }
        }
      }
    }

    var valid = true,
      checkValidity = {
        badInput: isNum && length > 0 && !/[+-]?[0-9]/.test(field.value),
        patternMismatch:
          field.hasAttribute('pattern') &&
          length > 0 &&
          new RegExp(field.getAttribute('pattern').test(field.value) === false),
        rangeOverflow:
          field.hasAttribute('max') &&
          isNum &&
          field.value > 1 &&
          parseInt(field.value, 10) > parseInt(field.getAttribute('max'), 10),
        rangeUnderflow:
          field.hasAttribute('min') &&
          isNum &&
          field.value > 1 &&
          parseInt(field.value, 10) < parseInt(field.getAttribute('min'), 10),
        stepMismatch:
          field.hasAttribute('step') &&
          field.getAttribute('step') !== 'any' &&
          isNum &&
          Number(field.value) % parseFloat(field.getAttribute('step')) !== 0,
        tooLong:
          field.hasAttribute('maxLength') &&
          field.getAttribute('maxLength') > 0 &&
          length > parseInt(field.getAttribute('maxLength'), 10),
        tooShort:
          field.hasAttribute('minLength') &&
          field.getAttribute('minLength') > 0 &&
          length > 0 &&
          length < parseInt(field.getAttribute('minLength'), 10),
        typeMismatch:
          length > 0 &&
          ((type === 'email' &&
            !/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(
              field.value
            )) ||
            (type === 'url' &&
              !/^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*)(?::\d{2,5})?(?:[\/?#]\S*)?$/.test(
                field.value
              ))),
        valueMissing:
          field.hasAttribute('required') &&
          (((type === 'checkbox' || type === 'radio') && !field.checked) ||
            (type === 'select' && field.options[field.selectedIndex].value < 1) ||
            (type !== 'checkbox' && type !== 'radio' && type !== 'select' && length < 1))
      };

    for (var key in checkValidity) {
      if (checkValidity.hasOwnProperty(key)) {
        if (checkValidity[key]) {
          valid = false;
          break;
        }
      }
    }

    checkValidity.valid = valid;
    return checkValidity;
  };

  if (!supported) {
    Object.defineProperty(HTMLInputElement.prototype, 'validity', {
      get: function ValidityState() {
        return getValidityState(this);
      },
      configurable: true
    });
  }
})(window, document);

/* Toggle Input states */
document.querySelector('._toggleDisable').addEventListener(
  'click',
  function(e) {
    var inputContainers = document.querySelectorAll('.mdwc-text-field, .mdwc-form-field'),
      i = 0;
    for (; i < inputContainers.length; i++) {
      var elem = inputContainers[i];

      if (elem.classList.contains('mdwc-text-field')) {
        var input = elem.querySelector('.mdwc-text-field__form-control');
        elem.classList.toggle('mdwc-text-field--disabled');
        input.disabled = !input.disabled;
      } else {
        elem.querySelectorAll('input').forEach(function(input) {
          input.disabled = !input.disabled;
        });
        elem.classList.toggle('mdwc-form-field--disabled');
      }
    }
  },
  false
);

document.querySelector('._toggleError').addEventListener(
  'click',
  function(e) {
    var inputContainers = document.querySelectorAll('.mdwc-text-field', '.mdwc-form-field'),
      i = 0;
    for (; i < inputContainers.length; i++) {
      var elem = inputContainers[i];
      elem.classList.toggle('mdwc-text-field--error');
    }
  },
  false
);

document.querySelector('._setNameField').addEventListener(
  'click',
  function(e) {
    var field = document.querySelector('#myText');
    field.value = 'Sherlock Holmes';
    field.focus();
    field.blur();
  },
  false
);
