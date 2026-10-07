(function () {
  'use strict';

  var app = document.getElementById('tour-app');
  var dataUrl = 'assets/data/tours.json';
  var allowedImage = /^(https:\/\/images\.unsplash\.com\/|assets\/img\/[a-zA-Z0-9_./-]+$)/;
  var menuButton = document.querySelector('.tour-site-header .navbar-toggle');
  var menu = document.querySelector('.tour-site-header .onepage-menu');

  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.classList.remove('active');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('active');
    document.body.classList.remove('mobile-menu-open');
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.classList.toggle('active', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('active', isOpen);
      document.body.classList.toggle('mobile-menu-open', isOpen);
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1200) closeMenu();
    });
  }

  var siteHeader = document.querySelector('.tour-site-header');
  if (siteHeader) {
    window.addEventListener('scroll', function () {
      siteHeader.classList.toggle('is-scroll', window.scrollY > 40);
    }, { passive: true });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function imagePath(value) {
    var path = String(value || '');
    return allowedImage.test(path) && path.indexOf('..') === -1 ? path : 'assets/img/hero/2.png';
  }

  function listItems(items, icon) {
    return (items || []).map(function (item) {
      return '<li><i class="fa ' + icon + '" aria-hidden="true"></i><span>' + escapeHtml(item) + '</span></li>';
    }).join('');
  }

  function renderTour(tour) {
    var contact = tour.contact || {};
    var gallery = Array.isArray(tour.gallery) ? tour.gallery.slice(0, 3) : [];
    var benefitDescriptions = tour.benefitDescriptions || [];
    var photos = gallery.map(function (photo) {
      return '<img src="' + escapeHtml(imagePath(photo.src)) + '" alt="' + escapeHtml(photo.alt) + '" loading="lazy">';
    }).join('');
    var itinerary = (tour.itinerary || []).map(function (step, index) {
      return '<li><span class="tour-timeline__number">' + (index + 1) + '</span><p>' + escapeHtml(step) + '</p></li>';
    }).join('');
    var highlights = (tour.highlights || []).map(function (item, index) {
      var icons = ['fa fa-globe', 'fa fa-cutlery', 'fa fa-users'];
      return '<div class="tour-benefit"><i class="' + icons[index % icons.length] + '" aria-hidden="true"></i><strong>' + escapeHtml(item) + '</strong><span>' + escapeHtml(benefitDescriptions[index] || '') + '</span></div>';
    }).join('');
    var whatsapp = String(contact.whatsapp || '').replace(/[^0-9]/g, '');

    app.innerHTML = '<header class="tour-hero" style="--tour-hero-image:url(\'' + escapeHtml(imagePath(tour.heroImage)) + '\')">' +
      '<div class="tour-hero__inner"><nav class="tour-breadcrumb" aria-label="Ruta de navegación"><a href="index.html">Inicio</a><i class="fa fa-angle-right" aria-hidden="true"></i><a href="index.html#experiencias">Tours</a><i class="fa fa-angle-right" aria-hidden="true"></i><span>' + escapeHtml(tour.cardTitle || tour.title) + '</span></nav>' +
      '<div class="tour-hero__copy"><span class="tour-eyebrow"><i class="fa fa-compass" aria-hidden="true"></i>' + escapeHtml(tour.category || 'Experiencia') + '</span><h1>' + escapeHtml(tour.title) + '</h1><p>' + escapeHtml(tour.heroSubtitle || tour.location) + '</p>' +
      '<div class="tour-hero__facts"><span><i class="fa fa-calendar" aria-hidden="true"></i><small>Duración<strong>' + escapeHtml(tour.duration) + '</strong></small></span><span><i class="fa fa-map-marker" aria-hidden="true"></i><small>Destino<strong>' + escapeHtml(tour.location) + '</strong></small></span><span><i class="fa fa-users" aria-hidden="true"></i><small>Tipo<strong>' + escapeHtml(tour.type) + '</strong></small></span></div></div></div></header>' +
      '<section class="tour-content"><div class="tour-main"><div class="tour-about"><span class="tour-kicker"><i class="fa fa-certificate" aria-hidden="true"></i> Sobre el tour</span><h2>' + escapeHtml(tour.title) + '</h2><p>' + escapeHtml(tour.summary) + '</p>' +
      '<aside class="tour-note"><i class="fa fa-calendar-check-o" aria-hidden="true"></i><p>' + escapeHtml(tour.notice) + '</p></aside><h3 class="tour-section-title">' + escapeHtml(tour.itineraryTitle || 'Itinerario') + '</h3><ol class="tour-timeline">' + itinerary + '</ol></div>' +
      '<div class="tour-gallery">' + photos + '</div><aside class="tour-booking"><span class="tour-booking__label">Precio desde</span><div class="tour-price"><span>$</span>' + escapeHtml(tour.price) + ' <small>' + escapeHtml(tour.currency || 'USD') + '</small></div><a class="tour-booking__button" href="https://wa.me/' + escapeHtml(whatsapp) + '?text=' + encodeURIComponent('Hola, quiero reservar el tour: ' + tour.title) + '" target="_blank" rel="noopener"><i class="fa fa-calendar-check-o" aria-hidden="true"></i> Reservar este tour</a>' +
      '<ul class="tour-facts"><li><i class="fa fa-calendar" aria-hidden="true"></i><span><b>Duración:</b> ' + escapeHtml(tour.duration) + '</span></li><li><i class="fa fa-clock-o" aria-hidden="true"></i><span><b>Salida:</b> Consulta horarios disponibles</span></li><li><i class="fa fa-users" aria-hidden="true"></i><span><b>Tipo:</b> ' + escapeHtml(tour.type) + '</span></li></ul>' +
      '<h3>Incluye</h3><ul class="tour-check-list">' + listItems(tour.included, 'fa-check') + '</ul><h3>No incluye</h3><ul class="tour-check-list tour-check-list--excluded">' + listItems(tour.notIncluded, 'fa-times') + '</ul></aside></div>' +
      '<section class="tour-benefits" aria-label="Lo que hace especial este tour">' + highlights + '<div class="tour-benefit"><i class="fa fa-map-marker" aria-hidden="true"></i><strong>' + escapeHtml(tour.location) + '</strong><span>' + escapeHtml(tour.locationDescription || '') + '</span></div></section>' +
      '<section class="tour-extras"><div class="tour-advice"><h2><i class="fa fa-suitcase" aria-hidden="true"></i> Recomendaciones antes del tour</h2><h3>¿Qué llevar?</h3><ul class="tour-check-list">' + listItems(tour.recommendations, 'fa-check') + '</ul></div>' +
      '<div class="tour-payment"><h2><i class="fa fa-credit-card" aria-hidden="true"></i> Nuestros métodos de pago</h2><p>Kuntur Shop Travel te ofrece todas las alternativas existentes en el mercado.</p><ul class="tour-check-list">' + listItems(tour.paymentMethods, 'fa-check') + '</ul><p class="tour-payment__note">' + escapeHtml(tour.paymentNote) + '</p></div>' +
      '<aside class="tour-contact"><img src="' + escapeHtml(imagePath(gallery[0] && gallery[0].src)) + '" alt="" loading="lazy"><div class="tour-contact__banner"><strong>' + escapeHtml(contact.title || '¿Tienes alguna consulta?') + '</strong><span>' + escapeHtml(contact.subtitle || 'Contáctanos y reserva tu experiencia') + '</span></div><div class="tour-contact__details"><a href="mailto:' + escapeHtml(contact.email || '') + '"><i class="fa fa-envelope" aria-hidden="true"></i>' + escapeHtml(contact.email || '') + '</a><a href="tel:' + escapeHtml(contact.phone || '') + '"><i class="fa fa-phone" aria-hidden="true"></i>' + escapeHtml(contact.phone || '') + '</a></div><a class="tour-contact__whatsapp" href="https://wa.me/' + escapeHtml(whatsapp) + '?text=' + encodeURIComponent('Hola, tengo una consulta sobre: ' + tour.title) + '" target="_blank" rel="noopener"><i class="fa fa-whatsapp" aria-hidden="true"></i> Escríbenos por WhatsApp</a></aside></section>' +
      '<footer class="tour-footer"><a href="index.html"><i class="fa fa-long-arrow-left" aria-hidden="true"></i> Volver a todos los tours</a><span>Kuntur Travel · Cusco, Perú</span></footer></section>';
    document.title = tour.title + ' | Kuntur Travel';
  }

  fetch(dataUrl).then(function (response) {
    if (!response.ok) throw new Error('No se pudo cargar la información de los tours.');
    return response.json();
  }).then(function (data) {
    if (!data || !Array.isArray(data.tours)) throw new Error('El archivo JSON no tiene el formato esperado.');
    var id = new URLSearchParams(window.location.search).get('id');
    var tour = data.tours.find(function (item) { return item.id === id; });
    if (!tour) {
      app.innerHTML = '<div class="tour-state tour-state--error"><i class="fa fa-map-signs" aria-hidden="true"></i><h1>Recorrido no encontrado</h1><p>El tour solicitado no existe o ya no está disponible.</p><a href="index.html">Volver al inicio</a></div>';
      return;
    }
    renderTour(tour);
  }).catch(function (error) {
    console.error('Error al cargar el recorrido:', error);
    var message = window.location.protocol === 'file:'
      ? 'Para cargar los recorridos desde JSON, abre el proyecto con Live Server o un servidor web local.'
      : 'No se pudo cargar assets/data/tours.json. Comprueba que el archivo esté disponible.';
    app.innerHTML = '<div class="tour-state tour-state--error"><h1>No se pudo cargar el recorrido</h1><p>' + escapeHtml(message) + '</p><a href="index.html">Volver al inicio</a></div>';
  });
}());
