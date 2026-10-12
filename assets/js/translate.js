(function ($) {
  'use strict';

  $(function () {
    var googleTranslateElement = document.createElement('div');
    var translateObserver;
    var languageStorageKey = 'kuntur-selected-language';
    var supportedLanguages = ['es', 'en', 'pt', 'fr'];
    var pendingLanguage = window.localStorage.getItem(languageStorageKey) || 'es';

    if (supportedLanguages.indexOf(pendingLanguage) === -1) {
      pendingLanguage = 'es';
    }

    googleTranslateElement.id = 'google_translate_element';
    googleTranslateElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(googleTranslateElement);

    function updateLanguageLabel(language) {
      var selectedLanguage = document.querySelector(
        '.header__lang_box a[data-google-lang="' + language + '"] span'
      );
      if (selectedLanguage) {
        $('.header__lang > a span').text(selectedLanguage.textContent.trim());
      }
    }

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

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'es,en,pt,fr',
          autoDisplay: false
        },
        'google_translate_element'
      );

      applyGoogleTranslateLanguage();
    };

    updateLanguageLabel(pendingLanguage);
    requestGoogleTranslateLanguage(pendingLanguage);

    var translateScript = document.createElement('script');
    translateScript.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    translateScript.async = true;
    document.head.appendChild(translateScript);

    $(document).on('click', '.header__lang_box a[data-google-lang]', function (event) {
      event.preventDefault();
      var language = $(this).data('google-lang');
      window.localStorage.setItem(languageStorageKey, language);
      updateLanguageLabel(language);
      requestGoogleTranslateLanguage(language);
      $('.header__lang_box').slideUp();
    });
  });
})(jQuery);
