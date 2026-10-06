(function () {
  var selector = document.getElementById('contact-agent-select');
  var agentName = document.getElementById('contact-agent-name');
  var phoneLink = document.getElementById('contact-agent-phone');
  var buttonLink = document.getElementById('contact-agent-button');

  if (!selector || !agentName || !phoneLink || !buttonLink) {
    return;
  }

  function updateAgentContact() {
    var option = selector.options[selector.selectedIndex];
    var phone = option.value;
    var formattedPhone = phone === '51971186810' ? '971 186 810' : '993 651 223';
    var name = option.getAttribute('data-name');
    var whatsappUrl = 'https://wa.me/' + phone;

    agentName.textContent = name;
    phoneLink.href = whatsappUrl;
    phoneLink.querySelector('span').textContent = formattedPhone;
    buttonLink.href = whatsappUrl;
    buttonLink.setAttribute('aria-label', 'Contactar a ' + name + ' por WhatsApp');
  }

  selector.addEventListener('change', updateAgentContact);
  updateAgentContact();
})();
