$.fn.dropdownMenu = function (opt) {
    var optsDefault = {
        menuClass: 'dropdown-menu-list',
        breakpoint: 1000,
        toggleClass: 'active',
        classButtonToggle: 'toggle-menu',
        subMenu: {
            class: 'sub-menu',
            parentClass: 'menu-item-has-children',
            toggleClass: 'active'
        }
    };
    var options = $.extend(true, {}, optsDefault, opt);

    return this.each(function () {
        var el = $(this);
        var menu = el.find('.' + options.menuClass).first();
        var toggle = el.find('.' + options.classButtonToggle).first();
        var backdrop = $('.mobile-menu-backdrop');

        if (!backdrop.length) {
            backdrop = $('<button type="button" class="mobile-menu-backdrop" aria-label="Cerrar menú"></button>')
                .appendTo('body');
        }

        function closeMenu() {
            menu.removeClass(options.toggleClass);
            el.removeClass('menu-open');
            toggle.removeClass('active').attr('aria-expanded', 'false');
            backdrop.removeClass('is-visible');
            $('body').removeClass('mobile-menu-open');
        }

        function toggleMenu(event) {
            event.preventDefault();
            event.stopPropagation();
            if (menu.hasClass(options.toggleClass)) {
                closeMenu();
                return;
            }
            menu.addClass(options.toggleClass);
            el.addClass('menu-open');
            toggle.addClass('active').attr('aria-expanded', 'true');
            backdrop.addClass('is-visible');
            $('body').addClass('mobile-menu-open');
        }

        toggle.off('click.dropdownMenu').on('click.dropdownMenu', toggleMenu);
        backdrop.off('click.dropdownMenu').on('click.dropdownMenu', closeMenu);
        menu.off('click.dropdownMenu').on('click.dropdownMenu', 'a', closeMenu);
        $(document).off('keydown.dropdownMenu').on('keydown.dropdownMenu', function (event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
        $(window).off('resize.dropdownMenu').on('resize.dropdownMenu', function () {
            if (window.innerWidth > options.breakpoint) {
                closeMenu();
            }
        });

        el.find('.' + options.subMenu.parentClass).off('click.dropdownMenu', '> a')
            .on('click.dropdownMenu', '> a', function (event) {
                event.preventDefault();
                var link = $(this);
                link.next('.' + options.subMenu.class).stop(true, true).slideToggle(250);
                link.parent().toggleClass(options.subMenu.toggleClass);
            });
    });
};


