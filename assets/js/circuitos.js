(function () {
  'use strict';

  var dataUrl = 'assets/data/boletos.json';
  var imageFallback = 'assets/img/image_box_2/box_1.png';
  var circuits = [];
  var activeCircuit = null;
  var activeImageIndex = 0;
  var elements = {
    heroSubtitle: document.getElementById('heroSubtitle'),
    mainImage: document.getElementById('mainImage'),
    locationTag: document.getElementById('locationTag'),
    ticketKicker: document.getElementById('ticketKicker'),
    ticketTitle: document.getElementById('ticketTitle'),
    ticketSummary: document.getElementById('ticketSummary'),
    validityText: document.getElementById('validityText'),
    nationalPrice: document.getElementById('nationalPrice'),
    studentPrice: document.getElementById('studentPrice'),
    durationLabel: document.getElementById('durationLabel'),
    placesList: document.getElementById('placesList'),
    thumbsTrack: document.getElementById('thumbsTrack'),
    galleryDots: document.getElementById('galleryDots'),
    buyButton: document.querySelector('.circuitos-buy')
  };
  var siteHeader = document.querySelector('.ticket-site-header');

  function updateHeaderOnScroll() {
    if (siteHeader) siteHeader.classList.toggle('is-scroll', window.scrollY > 40);
  }

  updateHeaderOnScroll();
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

  function safeImage(path) {
    var imagePath = String(path || '');
    return /^assets\/img\/[a-zA-Z0-9_./-]+$/.test(imagePath) && imagePath.indexOf('..') === -1
      ? imagePath
      : imageFallback;
  }

  function getPrices(ticket) {
    var pagePrices = ticket.circuitPage && ticket.circuitPage.prices;
    var types = ticket.ticketTypes || [];
    return {
      national: (pagePrices && pagePrices.national) || (types[0] && types[0].national) || 'Consultar',
      student: (pagePrices && pagePrices.student) || (types[1] && types[1].national) || 'Consultar'
    };
  }

  function getImages(ticket) {
    var gallery = (ticket.gallery || []).filter(function (image) {
      return image && image.src;
    });
    if (!gallery.length) {
      gallery = [{ src: ticket.heroImage || imageFallback, alt: ticket.title || 'Circuito turístico' }];
    }
    return gallery;
  }

  function setSelectedImage(index) {
    var images = getImages(activeCircuit);
    activeImageIndex = (index + images.length) % images.length;
    var image = images[activeImageIndex];
    elements.mainImage.src = safeImage(image.src);
    elements.mainImage.alt = image.alt || activeCircuit.title;

    Array.prototype.forEach.call(elements.thumbsTrack.children, function (thumb, thumbIndex) {
      thumb.classList.toggle('active', thumbIndex === activeImageIndex);
      thumb.setAttribute('aria-pressed', String(thumbIndex === activeImageIndex));
    });
    Array.prototype.forEach.call(elements.galleryDots.children, function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeImageIndex);
      dot.setAttribute('aria-pressed', String(dotIndex === activeImageIndex));
    });
  }

  function renderGallery(ticket) {
    var images = getImages(ticket);
    elements.thumbsTrack.innerHTML = '';
    elements.galleryDots.innerHTML = '';

    images.forEach(function (image, index) {
      var thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'circuitos-thumb';
      thumb.setAttribute('aria-label', 'Ver imagen ' + (index + 1));
      thumb.setAttribute('aria-pressed', 'false');
      var thumbImage = document.createElement('img');
      thumbImage.src = safeImage(image.src);
      thumbImage.alt = image.alt || ticket.title;
      thumb.appendChild(thumbImage);
      thumb.addEventListener('click', function () { setSelectedImage(index); });
      elements.thumbsTrack.appendChild(thumb);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', 'Ver imagen ' + (index + 1));
      dot.setAttribute('aria-pressed', 'false');
      dot.addEventListener('click', function () { setSelectedImage(index); });
      elements.galleryDots.appendChild(dot);
    });

    setSelectedImage(0);
  }

  function renderCircuit(ticket) {
    var page = ticket.circuitPage || {};
    var prices = getPrices(ticket);
    var displayName = page.name || ticket.title;
    var title = 'Boleto Turístico Parcial - ' + displayName;
    var duration = ticket.validity || 'Consultar';
    var phone = window.ticketWhatsapp || '51993651223';

    activeCircuit = ticket;
    elements.heroSubtitle.textContent = displayName;
    elements.ticketKicker.textContent = page.kicker || ticket.eyebrow || displayName.toUpperCase();
    elements.ticketTitle.textContent = title;
    elements.ticketSummary.textContent = ticket.description || ticket.subtitle || '';
    elements.locationTag.textContent = page.location || ticket.destination || 'Cusco';
    elements.validityText.textContent = 'Validez: ' + duration;
    elements.nationalPrice.textContent = prices.national;
    elements.studentPrice.textContent = prices.student;
    elements.durationLabel.textContent = duration;
    elements.placesList.innerHTML = '';

    (ticket.places || []).forEach(function (place) {
      var item = document.createElement('li');
      item.textContent = place;
      elements.placesList.appendChild(item);
    });

    renderGallery(ticket);
    document.title = title + ' | Kuntur Travel';
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', ticket.subtitle || ticket.description || title);

    if (elements.buyButton) {
      var message = 'Hola, quiero información sobre ' + title;
      elements.buyButton.onclick = function () {
        window.open('https://wa.me/' + encodeURIComponent(phone) + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
      };
    }
  }

  function showError(message) {
    var main = document.querySelector('.circuitos-main');
    if (!main) return;
    main.innerHTML = '<p class="circuitos-error" role="alert">' + message + '</p>';
  }

  document.getElementById('prevBtn').addEventListener('click', function () {
    if (activeCircuit) setSelectedImage(activeImageIndex - 1);
  });
  document.getElementById('nextBtn').addEventListener('click', function () {
    if (activeCircuit) setSelectedImage(activeImageIndex + 1);
  });

  fetch(dataUrl).then(function (response) {
    if (!response.ok) throw new Error('No se pudo cargar la información de los circuitos.');
    return response.json();
  }).then(function (data) {
    circuits = (data.tickets || []).filter(function (ticket) {
      return ticket.circuitPage && ticket.id.indexOf('circuito-') === 0;
    });
    if (!circuits.length) throw new Error('No hay circuitos parciales disponibles.');

    var params = new URLSearchParams(window.location.search);
    var requestedId = params.get('circuito') || 'circuito-i';
    var circuit = circuits.find(function (ticket) { return ticket.id === requestedId; });
    if (!circuit) {
      circuit = circuits[0];
      params.set('circuito', circuit.id);
      window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
    }

    window.ticketWhatsapp = data.whatsapp || '51993651223';
    renderCircuit(circuit);
  }).catch(function (error) {
    console.error('Error al cargar los circuitos:', error);
    showError(window.location.protocol === 'file:'
      ? 'Abre este sitio con Live Server para cargar la información del JSON.'
      : 'No se pudo cargar assets/data/boletos.json.');
  });
}());
