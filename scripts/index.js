$(function() {
  // Common
  var windowEl = $(window);
  var htmlAndBodyEl = $('html,body');

  windowEl.on('scroll', function() {
    window.requestAnimationFrame(updateActiveMenuListAnchor);
  });

  windowEl.on('resize', function() {
    window.requestAnimationFrame(updateActiveMenuListAnchor);
  });

  // Menu list
  var SCROLL_OFFSET = $('.mobile-only:visible').length > 0 ? 15 : 100;
  var menuListEl = $('.menu-list');
  var menuListAnchorEls = $('.menu-list__anchor[href^="#"]');

  $('.menu-list__list-item--hamburger .menu-list__anchor').on('click', function() {
    menuListEl.toggleClass('menu-list--open');
  });

  $('a[href^="#"]').on('click', function(event) {
    var targetEl = $(this.getAttribute('href'));

    if (targetEl) {
      htmlAndBodyEl.stop().animate({
        scrollTop: targetEl.offset().top - SCROLL_OFFSET
      });
    }

    menuListEl.removeClass('menu-list--open');
    return false;
  });

  function updateActiveMenuListAnchor() {
    var scrollTop = windowEl.scrollTop() + SCROLL_OFFSET + 1;
    var activeLink = menuListAnchorEls.get(0);
    var maxNegativeOffset = 0;

    menuListAnchorEls.removeClass('menu-list__anchor--active').each(function() {
      var targetEl = $(this.getAttribute('href'));

      if (targetEl) {
        var offset = targetEl.offset().top;

        if (
          offset > maxNegativeOffset && // Is closer to the bottom
          (
            offset <= scrollTop || // Is above the scroll position
            document.body.scrollHeight <= scrollTop + window.innerHeight // Scroll reached the bottom
          )
        ) {
          maxNegativeOffset = offset;
          activeLink = this;
        }
      }
    });

    $(activeLink).addClass('menu-list__anchor--active');
  }

  // Section
  var SLIDE_INTERVAL = 8000;
  $('.section__block').each(createSlider);

  function createSlider() {
    var sectionBlockEl = $(this);
    var sliderEl = sectionBlockEl.find('.slider');
    var sliderIndicatorEls = sectionBlockEl.find('.slider__indicator');
    var sliderTimeout;

    sliderIndicatorEls.on('click', function() {
      slide($(this).index());
    });

    sectionBlockEl.on('mouseenter', pauseSliding);
    sectionBlockEl.on('mouseleave', startSliding);

    startSliding();

    function startSliding() {
      if (sliderIndicatorEls.filter(':visible').length > 0) {
        sliderTimeout = setTimeout(slide, SLIDE_INTERVAL);
      }
    }

    function pauseSliding() {
      if (sliderTimeout) {
        clearTimeout(sliderTimeout);
      }
    }

    function slide(index) {
      pauseSliding();

      var currentScroll = sliderEl.scrollLeft();
      var scrollWidth = sliderEl.get(0).scrollWidth;
      var width = sliderEl.get(0).clientWidth;

      var scrollTo;
      if (index !== undefined) {
        scrollTo = index * width;
      } else if (currentScroll + width >= scrollWidth) {
        scrollTo = 0;
      } else {
        scrollTo = currentScroll + width;
      }

      sliderEl.animate({
        scrollLeft: scrollTo
      });

      sliderIndicatorEls.removeClass('slider__indicator--active');
      sliderIndicatorEls.eq(Math.floor(scrollTo / width)).addClass('slider__indicator--active');

      startSliding();
    }
  }

  // Modal
  $('.modal__background, .modal__close').on('click', function() {
    $(this).closest('.modal').removeClass('modal--open');
    htmlAndBodyEl.removeClass('scroll-disabled');
  });

  // Form
  $('.form-input__input').on('change', function() {
    $(this).toggleClass('form-input__input--filled', Boolean(this.value));
  });

  // Contact form
  var contactFormModalEl = $('.contact-form__modal');
  var contactFormEl = $('#contactForm');

  $('.demo__button').on('click', function() {
    contactFormModalEl.addClass('modal--open');
    htmlAndBodyEl.addClass('scroll-disabled');
    $('input[name="message"]')
      .val('Quero uma demonstração!')
      .trigger('change');
  });

  $('.contact-form__button').on('click', function() {
    contactFormModalEl.addClass('modal--open');
    htmlAndBodyEl.addClass('scroll-disabled');
  });

  contactFormEl.on('submit', function(event) {
    event.preventDefault();

    var submitEl = contactFormEl.find('[type="submit"]');

    if (submitEl.prop('disabled')) {
      return;
    }

    submitEl.prop('disabled', true);
    submitEl.html('Enviando...');

    $.ajax({
      url: 'https://server.heycheff.com/classes/SiteContact',
      method: 'POST',
      headers: {
        'X-Parse-Application-Id': 'dIbPpMmwW27Wlo3i3l8gAPtzMYg0EsZrMmRYo9YH',
        'X-Parse-REST-API-Key': 'Ij3CJNQLwAbAVP06h84RWpqqTzlHvPWtMUVWjHJF'
      },
      contentType: 'application/json',
      data: JSON.stringify({
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value,
        restaurantName: this.restaurantName.value,
        message: this.message.value,
        referrer: window.location.search
      })
    })
      .done(function() {
        contactFormEl.animate({ top: '-=2000' }, 400, 'easeInBack', function() {
          contactFormModalEl.removeClass('modal--open');
          htmlAndBodyEl.removeClass('scroll-disabled');
          submitEl.prop('disabled', false);
          submitEl.html('Enviar');
          contactFormEl.css('top', 0);
          contactFormEl[0].reset();
        });
      })
      .fail(function() {
        window.alert('Não conseguimos enviar sua mensagem. \nVerifique sua conexão e tente novamente.');
        submitEl.prop('disabled', false);
        submitEl.html('Enviar');
      });
  });

  // Easing
  $.extend($.easing, {
    easeInBack: function (x, t, b, c, d, s) {
      if (s === undefined) {
        s = 1.70158;
      }

      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    }
  });

});
