(function ($) {
  'use strict';

  $(function () {
    var googleTranslateElement = document.createElement('div');
    var translateObserver;
    var pendingLanguage = 'es';

    googleTranslateElement.id = 'google_translate_element';
    googleTranslateElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(googleTranslateElement);

    function applyGoogleTranslateLanguage() {
      var languageSelect = document.querySelector('.goog-te-combo');
      if (!languageSelect || !pendingLanguage) return false;
      if (!languageSelect.querySelector('option[value="' + pendingLanguage + '"]')) {
        return false;
      }

      languageSelect.value = pendingLanguage;
      languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
      pendingLanguage = null;

      if (translateObserver) {
        translateObserver.disconnect();
        translateObserver = null;
      }

      return true;
    }

    function requestGoogleTranslateLanguage(language) {
      pendingLanguage = language;

      if (!applyGoogleTranslateLanguage() && !translateObserver) {
        translateObserver = new MutationObserver(applyGoogleTranslateLanguage);
        translateObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    $('.header__lang > a span').text('ES');
    requestGoogleTranslateLanguage('es');

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,vi',
          autoDisplay: false
        },
        'google_translate_element'
      );

      applyGoogleTranslateLanguage();
    };

    var translateScript = document.createElement('script');
    translateScript.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    translateScript.async = true;
    document.head.appendChild(translateScript);

    $(document).on('click', '.header__lang_box a[data-google-lang]', function (event) {
      event.preventDefault();
      requestGoogleTranslateLanguage($(this).data('google-lang'));

      $('.header__lang > a span').text($(this).find('span').text());
      $('.header__lang_box').slideUp();
    });
  });
})(jQuery);
