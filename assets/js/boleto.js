(function () {
  'use strict';

  var root = document.getElementById('ticket-page');
  var dataUrl = 'assets/data/boletos.json';
  var fallbackImage = 'assets/img/hero/1.jpeg';
  var allowedImage = /^assets\/img\/[a-zA-Z0-9_./-]+$/;
  var siteHeader = document.querySelector('.ticket-site-header');
  var menuButton = document.querySelector('.ticket-site-header .navbar-toggle');
  var menu = document.querySelector('.ticket-site-header .onepage-menu');

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
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.ticket-site-header .onepage-nav')) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1200) closeMenu();
    });
  }

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

  function safeImage(path) {
    var value = String(path || '');
    return allowedImage.test(value) && value.indexOf('..') === -1 ? value : fallbackImage;
  }

  function bookingUrl(phone, ticket) {
    var message = 'Hola, quiero información sobre ' + ticket.title;
    return 'https://wa.me/' + encodeURIComponent(phone) + '?text=' + encodeURIComponent(message);
  }

  function renderPlaces(places) {
    return places.map(function (place, index) {
      var icon = index < 6 ? 'fa-university' : 'fa-picture-o';
      return '<li><i class="fa ' + icon + '" aria-hidden="true"></i><span>' + escapeHtml(place) + '</span></li>';
    }).join('');
  }

  function renderPrices(ticket) {
    return (ticket.ticketTypes || []).map(function (type) {
      return '<tr><th scope="row"><i class="fa ' + escapeHtml(type.icon || 'fa-ticket') + '" aria-hidden="true"></i><span>' + escapeHtml(type.name) + '</span></th>' +
        '<td data-label="Precio extranjero">' + escapeHtml(type.foreign) + '</td>' +
        '<td data-label="Precio nacional">' + escapeHtml(type.national) + '</td>' +
        '<td data-label="Vigencia">' + escapeHtml(type.validity || ticket.validity) + '</td></tr>';
    }).join('');
  }

  function renderTicket(ticket, allTickets, phone) {
    var gallery = (ticket.gallery || []).slice(0, 4);
    var currentIndex = allTickets.findIndex(function (item) { return item.id === ticket.id; });
    var previous = allTickets[(currentIndex - 1 + allTickets.length) % allTickets.length];
    var next = allTickets[(currentIndex + 1) % allTickets.length];
    var galleryMarkup = gallery.map(function (image, index) {
      return '<img class="ticket-gallery__image ticket-gallery__image--' + (index + 1) + '" src="' + escapeHtml(safeImage(image.src)) + '" alt="' + escapeHtml(image.alt || '') + '" loading="lazy">';
    }).join('');
    var placesMarkup = renderPlaces(ticket.places || []);

    root.innerHTML = '<section class="ticket-hero" style="--ticket-hero-image:url(\'' + escapeHtml(safeImage(ticket.heroImage)) + '\')">' +
      '<div class="ticket-hero__inner">' +
      '<div class="ticket-hero__content"><span class="ticket-eyebrow"><i class="fa fa-ticket" aria-hidden="true"></i>' + escapeHtml(ticket.eyebrow || 'Boleto turístico') + '</span><h1>' + escapeHtml(ticket.title) + '</h1><p>' + escapeHtml(ticket.subtitle) + '</p>' +
      '<div class="ticket-facts"><div><i class="fa fa-calendar" aria-hidden="true"></i><span><small>Vigencia</small><strong>' + escapeHtml(ticket.validity) + '</strong></span></div><div><i class="fa fa-map-marker" aria-hidden="true"></i><span><small>Destino</small><strong>' + escapeHtml(ticket.destination) + '</strong></span></div><div><i class="fa fa-ticket" aria-hidden="true"></i><span><small>Incluye</small><strong>' + escapeHtml(ticket.accessSummary) + '</strong></span></div></div></div></div></section>' +
      '<section class="ticket-body"><div class="ticket-overview"><div class="ticket-places"><span class="ticket-section-kicker"><i class="fa fa-certificate" aria-hidden="true"></i> ' + escapeHtml(ticket.placesTitle || 'Lugares incluidos') + '</span><p class="ticket-description">' + escapeHtml(ticket.description) + '</p><ul class="ticket-place-list">' + placesMarkup + '</ul></div>' +
      '<aside class="ticket-gallery" aria-label="Galería de atractivos">' + galleryMarkup + '<p>' + escapeHtml(ticket.accent || '') + '</p><span class="ticket-gallery__underline" aria-hidden="true"></span></aside></div>' +
      '<section class="ticket-pricing" aria-labelledby="ticket-pricing-title"><div class="ticket-pricing__table-wrap"><h2 id="ticket-pricing-title"><i class="fa fa-ticket" aria-hidden="true"></i> Tipos de boleto</h2><table><thead><tr><th scope="col">Tipo de boleto</th><th scope="col">Precio extranjero</th><th scope="col">Precio nacional</th><th scope="col">Vigencia</th></tr></thead><tbody>' + renderPrices(ticket) + '</tbody></table></div>' +
      '<aside class="ticket-callout"><div class="ticket-callout__mountain" aria-hidden="true"><i class="fa fa-map-o"></i><i class="fa fa-area-chart"></i></div><div><h2>' + escapeHtml(ticket.calloutTitle) + '</h2><p>' + escapeHtml(ticket.calloutText) + '</p></div><a href="' + escapeHtml(bookingUrl(phone, ticket)) + '" target="_blank" rel="noopener noreferrer"><i class="fa fa-ticket" aria-hidden="true"></i> Consultar y comprar <i class="fa fa-arrow-right" aria-hidden="true"></i></a></aside></section>' +
      '<nav class="ticket-circuit-nav" aria-label="Otros boletos">' +
        '<a href="boleto.html?circuito=' + encodeURIComponent(previous.id) + '"><i class="fa fa-angle-left" aria-hidden="true"></i><span><small>Anterior</small><strong>' + escapeHtml(previous.title.replace(' · ', ' ')) + '</strong></span></a>' +
        '<a class="ticket-circuit-nav__home" href="index.html#box-search"><i class="fa fa-home" aria-hidden="true"></i> Ver todos los circuitos</a>' +
        '<a href="boleto.html?circuito=' + encodeURIComponent(next.id) + '"><span><small>Siguiente</small><strong>' + escapeHtml(next.title.replace(' · ', ' ')) + '</strong></span><i class="fa fa-angle-right" aria-hidden="true"></i></a>' +
      '</nav></section><div class="ticket-bottom-band"><a href="index.html">Cusco te espera</a></div>';

    document.title = ticket.title + ' | Kuntur Travel';
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', ticket.subtitle);
  }

  fetch(dataUrl).then(function (response) {
    if (!response.ok) throw new Error('No se pudo cargar el archivo de boletos.');
    return response.json();
  }).then(function (data) {
    if (!data || !Array.isArray(data.tickets) || !data.tickets.length) throw new Error('No hay boletos disponibles.');
    var params = new URLSearchParams(window.location.search);
    var requestedId = params.get('circuito') || 'integral';
    var ticket = data.tickets.find(function (item) { return item.id === requestedId; });
    if (!ticket) {
      ticket = data.tickets[0];
      params.set('circuito', ticket.id);
      window.history.replaceState({}, '', 'boleto.html?' + params.toString());
    }
    renderTicket(ticket, data.tickets, data.whatsapp || '51993651223');
  }).catch(function (error) {
    console.error('Error al cargar los boletos turísticos:', error);
    var message = window.location.protocol === 'file:'
      ? 'Abre el sitio usando Live Server o un servidor web para cargar los datos del boleto.'
      : 'No pudimos cargar la información de los boletos. Revisa assets/data/boletos.json e inténtalo de nuevo.';
    root.innerHTML = '<section class="ticket-error"><i class="fa fa-exclamation-circle" aria-hidden="true"></i><h1>No se pudo cargar el boleto</h1><p>' + escapeHtml(message) + '</p><a href="index.html">Volver al inicio</a></section>';
  });
}());
