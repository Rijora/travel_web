(function () {
  'use strict';

  var dataUrl = 'assets/data/festivals.json';
  var detailParam = 'fiesta';
  var page = document.querySelector('.festival-hero');
  var listView = document.getElementById('festival-list-view');
  var list = document.getElementById('festival-list');
  var detailView = document.getElementById('festival-detail-view');
  var error = document.getElementById('festival-error');
  var pageTitle = document.getElementById('festival-page-title');
  var pageSubtitle = document.getElementById('festival-page-subtitle');
  var breadcrumbCurrent = document.getElementById('festival-breadcrumb-current');
  var count = document.getElementById('festival-count');
  var monthHeading = document.getElementById('festival-month-heading');
  var eventsById = new Map();
  var calendar;
  var selectedMonth;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function safeImagePath(path) {
    var value = String(path || '');
    return /^assets\/img\/[a-zA-Z0-9_./-]+$/.test(value) && value.indexOf('..') === -1
      ? value
      : 'assets/img/image_box_3/enero_01.png';
  }

  function festivalUrl(id) {
    var url = 'blog.html?mes=' + encodeURIComponent(selectedMonth.slug);
    return id ? url + '&' + detailParam + '=' + encodeURIComponent(id) : url;
  }

  function currentFestivalId() {
    return new URLSearchParams(window.location.search).get(detailParam);
  }

  function normalizeMonthSlug(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function getMonthFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var requestedSlug = normalizeMonthSlug(params.get('mes') || 'enero');
    var month = calendar.months.find(function (item) {
      return item.slug === requestedSlug;
    });

    if (!month) {
      month = calendar.months[0];
      params.set('mes', month.slug);
      params.delete(detailParam);
      window.history.replaceState({}, '', 'blog.html?' + params.toString());
    }

    return month;
  }

  function renderList() {
    var events = selectedMonth.events;
    var monthName = selectedMonth.name.toLocaleLowerCase('es');
    monthHeading.textContent = monthName;
    pageTitle.textContent = 'Fiestas Tradicionales de ' + selectedMonth.name;
    pageSubtitle.textContent = selectedMonth.intro;
    breadcrumbCurrent.textContent = selectedMonth.name;
    count.textContent = events.length + (events.length === 1 ? ' festividad' : ' festividades');
    list.innerHTML = events.map(function (event) {
      var href = festivalUrl(event.id);
      return '<article class="festival-card">' +
        '<div class="festival-card__date"><span>' + escapeHtml(event.day || '—') + '</span><small>' + escapeHtml(selectedMonth.name) + '</small></div>' +
        '<a class="festival-card__image" href="' + escapeHtml(href) + '" aria-label="Ver ' + escapeHtml(event.title) + '">' +
          '<img src="' + escapeHtml(safeImagePath(event.image)) + '" alt="' + escapeHtml(event.imageAlt) + '" loading="lazy">' +
        '</a>' +
        '<div class="festival-card__description"><h2><a href="' + escapeHtml(href) + '">' + escapeHtml(event.title) + '</a></h2>' +
          '<p>' + escapeHtml(event.summary) + '</p></div>' +
        '<div class="festival-card__location"><i class="fa fa-map-marker" aria-hidden="true"></i><span>' + escapeHtml(event.location) + '</span></div>' +
        '<a class="festival-button" href="' + escapeHtml(href) + '">Ver detalle <i class="fa fa-arrow-right" aria-hidden="true"></i></a>' +
      '</article>';
    }).join('');
  }

  function renderRelated(currentEvent) {
    return selectedMonth.events.filter(function (event) {
      return event.id !== currentEvent.id;
    }).slice(0, 4).map(function (event) {
      var href = festivalUrl(event.id);
      return '<a class="festival-related__item" href="' + escapeHtml(href) + '">' +
        '<img src="' + escapeHtml(safeImagePath(event.image)) + '" alt="" loading="lazy">' +
        '<span class="festival-related__copy"><strong>' + escapeHtml(event.title) + '</strong>' +
          '<small><i class="fa fa-calendar" aria-hidden="true"></i> ' + escapeHtml(event.day ? event.day + ' de ' + selectedMonth.name.toLocaleLowerCase('es') : selectedMonth.name) + '</small>' +
          '<small><i class="fa fa-map-marker" aria-hidden="true"></i> ' + escapeHtml(event.location) + '</small></span>' +
        '<span class="festival-related__arrow" aria-hidden="true"><i class="fa fa-arrow-right"></i></span>' +
      '</a>';
    }).join('');
  }

  function renderDetail(event) {
    var paragraphs = event.paragraphs.map(function (paragraph) {
      return '<p>' + escapeHtml(paragraph) + '</p>';
    }).join('');
    var related = renderRelated(event);

    detailView.innerHTML = '<article class="festival-detail">' +
      '<nav class="festival-detail__breadcrumb" aria-label="Ruta de navegación">' +
        '<a href="index.html"><i class="fa fa-home" aria-hidden="true"></i> Inicio</a><i class="fa fa-angle-right" aria-hidden="true"></i>' +
        '<a href="' + escapeHtml(festivalUrl()) + '">Calendario de Fiestas</a><i class="fa fa-angle-right" aria-hidden="true"></i>' +
        '<a href="' + escapeHtml(festivalUrl()) + '">' + escapeHtml(selectedMonth.name) + '</a><i class="fa fa-angle-right" aria-hidden="true"></i>' +
        '<span>' + escapeHtml(event.title) + '</span>' +
      '</nav>' +
      '<div class="festival-detail__cover"><img src="' + escapeHtml(safeImagePath(event.image)) + '" alt="' + escapeHtml(event.imageAlt) + '"></div>' +
      '<div class="festival-detail__layout"><div class="festival-article">' +
        '<a class="festival-back-link" href="' + escapeHtml(festivalUrl()) + '"><i class="fa fa-long-arrow-left" aria-hidden="true"></i> Volver al calendario</a>' +
        '<h1>' + escapeHtml(event.title) + '</h1>' +
        '<div class="festival-detail__meta"><span><i class="fa fa-calendar" aria-hidden="true"></i> ' + escapeHtml(event.day ? event.day + ' de ' + selectedMonth.name.toLocaleLowerCase('es') : selectedMonth.name) + '</span>' +
          '<span><i class="fa fa-map-marker" aria-hidden="true"></i> ' + escapeHtml(event.location) + '</span></div>' +
        '<p class="festival-article__intro">' + escapeHtml(event.intro) + '</p>' +
        '<h2>' + escapeHtml(event.sectionTitle) + '</h2>' + paragraphs +
        '<div class="festival-note"><i class="fa fa-pagelines" aria-hidden="true"></i><div><strong>' + escapeHtml(event.highlightTitle) + '</strong><p>' + escapeHtml(event.highlight) + '</p></div></div>' +
      '</div>' + (related ? '<aside class="festival-related"><h2>Más festividades</h2><div class="festival-related__list">' + related + '</div></aside>' : '') + '</div>' +
    '</article>';
  }

  function renderRoute() {
    selectedMonth = getMonthFromUrl();
    var id = currentFestivalId();
    var event = id ? selectedMonth.events.find(function (item) { return item.id === id; }) : null;
    var detailIsOpen = Boolean(event);

    if (id && !event) {
      window.history.replaceState({}, '', festivalUrl());
    }

    page.hidden = detailIsOpen;
    listView.hidden = detailIsOpen;
    detailView.hidden = !detailIsOpen;
    error.hidden = true;

    if (detailIsOpen) {
      renderDetail(event);
      document.title = event.title + ' | Fiestas del Cusco | Kuntur Travel';
    } else {
      document.title = 'Fiestas Tradicionales de ' + selectedMonth.name + ' | Kuntur Travel';
    }
  }

  function loadCalendar() {
    fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('No se pudo leer el calendario');
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.events) || !data.events.length || !Array.isArray(data.otherMonths)) {
          throw new Error('El archivo JSON no contiene festividades');
        }
        calendar = data;
        calendar.months = [{
          slug: 'enero',
          name: data.month,
          intro: data.intro,
          events: data.events
        }].concat(data.otherMonths);
        calendar.months.forEach(function (month) {
          if (!month.slug || !month.name || !Array.isArray(month.events)) {
            throw new Error('Hay un mes incompleto en el archivo JSON');
          }
          month.slug = normalizeMonthSlug(month.slug);
          month.events.forEach(function (event) {
            if (!event.id || !event.title || !event.paragraphs || !Array.isArray(event.paragraphs)) {
              throw new Error('Hay una festividad incompleta en el archivo JSON');
            }
            if (eventsById.has(event.id)) {
              throw new Error('ID de festividad duplicado: ' + event.id);
            }
            eventsById.set(event.id, event);
          });
        });
        if (new Set(calendar.months.map(function (month) { return month.slug; })).size !== calendar.months.length) {
          throw new Error('Hay meses duplicados en el archivo JSON');
        }
        renderRoute();
        renderList();
      })
      .catch(function (loadError) {
        console.error('Error al cargar las festividades:', loadError);
        page.hidden = false;
        listView.hidden = true;
        error.textContent = window.location.protocol === 'file:'
          ? 'Para cargar el calendario JSON, abre el proyecto con Live Server o un servidor web local.'
          : 'No se pudo cargar assets/data/festivals.json. Comprueba que el archivo esté publicado y vuelve a intentarlo.';
        error.hidden = false;
      });
  }

  document.addEventListener('click', function (clickEvent) {
    var link = clickEvent.target.closest('a[href*="blog.html?"]');
    if (!link || clickEvent.defaultPrevented || clickEvent.button !== 0 || clickEvent.metaKey || clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.altKey) {
      return;
    }
    var url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname) {
      return;
    }
    clickEvent.preventDefault();
    window.history.pushState({}, '', url.pathname + url.search);
    renderRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.addEventListener('click', function (clickEvent) {
    var backLink = clickEvent.target.closest('.festival-back-link');
    if (!backLink || clickEvent.defaultPrevented || clickEvent.button !== 0 || clickEvent.metaKey || clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.altKey) {
      return;
    }
    clickEvent.preventDefault();
    window.history.pushState({}, '', 'blog.html');
    renderRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('popstate', function () {
    if (calendar) {
      renderRoute();
    }
  });

  loadCalendar();
}());
