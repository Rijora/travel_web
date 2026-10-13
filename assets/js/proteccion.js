(function () {
  'use strict';

  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  document.addEventListener('copy', function (event) {
    event.preventDefault();
  }, true);

  document.addEventListener('cut', function (event) {
    event.preventDefault();
  }, true);

  document.addEventListener('dragstart', function (event) {
    if (!(event.target instanceof Element)) return;

    var image = event.target.closest('img');
    var linkWithImage = event.target.closest('a');

    if (image || (linkWithImage && linkWithImage.querySelector('img'))) {
      event.preventDefault();
    }
  }, true);

  document.addEventListener('keydown', function (event) {
    var key = event.key.toLowerCase();
    var modifier = event.ctrlKey || event.metaKey;
    var devToolsShortcut = modifier && event.shiftKey &&
      ['i', 'j', 'c', 'k', 'e'].indexOf(key) !== -1;
    var macDevToolsShortcut = event.metaKey && event.altKey &&
      ['i', 'j', 'c'].indexOf(key) !== -1;

    if (key === 'f12' || (modifier && key === 'u') ||
        devToolsShortcut || macDevToolsShortcut) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}());
