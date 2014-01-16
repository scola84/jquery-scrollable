(function ($) {
  'use strict';

  $.widget('scola.scrollable', {
    options: {
      buttonInterval: 100,
      isWrapper: false,
      minHandleSize: 20,
      scrollDelta: 60,
      selectorContent: '.content',
      selectorX: null,
      selectorY: null,
      showButtons: true,
      touchNative: true
    },

    _create: function () {
      this.setupObjects();

      this.addContentHandlers();

      if (this.isTouchDevice() && this.options.touchNative) {
        this.addTouchClass();
      } else {
        this.addWindowHandlers();
        this.addWrapperHandlers();

        if (this.fromSelector) {
          this.createScrollbarXFromSelector();
          this.createScrollbarYFromSelector();
        } else {
          this.createScrollbarX();
          this.createScrollbarY();
          this.createCorner();
        }

        this.update();
      }
    },

    _destroy: function () {
      this.restore();

      if (this.isTouchDevice() && this.options.touchNative) {
        this.removeTouchClass();
      } else {
        if (this.fromSelector) {
          this.destroyScrollbarXFromSelector();
          this.destroyScrollbarYFromSelector();
        } else {
          this.destroyScrollbarX();
          this.destroyScrollbarY();
          this.destroyCorner();
        }

        this.removeWindowHandlers();
        this.removeWrapperHandlers();
      }

      this.removeContentHandlers();

      this.teardownObjects();
    },

    setupObjects: function () {
      if (this.options.isWrapper) {
        this.wrapper = this.element.addClass('scola-scrollable');
        this.content = this.wrapper.children(this.options.selectorContent);
      } else {
        this.content = this.element.wrap('<div>');
        this.wrapper = this.content.parent().addClass('scola-scrollable');
      }

      this.scrollPosition = this.content.scrollPosition();

      this.fromSelector = (this.options.selectorX !== null || this.options.selectorY !== null);

      this.showScrollbarX = true;
      this.disableScrollbarX = false;

      this.showScrollbarY = true;
      this.disableScrollbarY = false;

      this.showCorner = true;
    },

    teardownObjects: function () {
      if (this.options.isWrapper) {
        this.element.removeClass('scola-scrollable');
      } else {
        this.element.unwrap();
      }
    },

    isTouchDevice: function () {
      return ('ontouchstart' in window || navigator.msMaxTouchPoints);
    },

    setButtonInterval: function (method) {
      var context = this;

      this.buttonInterval = setInterval(function () {
        method.call(context);
      }, this.options.buttonInterval);
    },

    addTouchClass: function () {
      this.wrapper.addClass('scola-touch');
    },

    removeTouchClass: function () {
      this.wrapper.removeClass('scola-touch');
    },

    addWindowHandlers: function () {
      $(window).on('mouseup.scola-scrollable', $.proxy(this.handleWindowMouseUp, this));
    },

    removeWindowHandlers: function () {
      $(window).off('.scola-scrollable');
    },

    handleWindowMouseUp: function () {
      if (this.activeScrollbar) {
        this.activeScrollbar.removeClass('scola-active');
        this.activeScrollbar = null;
      }

      if (this.activeHandle) {
        this.activeHandle.removeClass('scola-active');
        this.activeHandle = null;
      }

      if (this.activeButton) {
        this.activeButton.removeClass('scola-active');

        clearInterval(this.buttonInterval);

        this.activeButton = null;
      }
    },

    addWrapperHandlers: function () {
      this.wrapper.on('resize.scola-scrollable', $.proxy(this.update, this));
    },

    removeWrapperHandlers: function () {
      this.wrapper.off('.scola-scrollable');
    },

    addContentHandlers: function () {
      this.content.on({
        'input.scola-scrollable': $.proxy(this.update, this),
        'mouseenter.scola-scrollable': $.proxy(this.handleContentMouseEnter, this),
        'mouseleave.scola-scrollable': $.proxy(this.handleContentMouseLeave, this),
        'mousewheel.scola-scrollable': $.proxy(this.handleContentMouseWheel, this),
        'resize.scola-scrollable': $.proxy(this.update, this),
        'scroll.scola-scrollable': $.proxy(this.handleContentScroll, this)
      });
    },

    removeContentHandlers: function () {
      this.content.off('.scola-scrollable');
    },

    handleContentMouseWheel: function (event, delta) {
      if (!this.showScrollbarY && this.showScrollbarX) {
        event.preventDefault();

        this.content.scrollLeft(this.content.scrollLeft() - (delta * this.options.scrollDelta));
      }
    },

    handleContentMouseEnter: function () {
      this.wrapper.addClass('scola-hover');
    },

    handleContentMouseLeave: function () {
      this.wrapper.removeClass('scola-hover');
    },

    handleContentScroll: function () {
      this.setHandlePosition();
      this.triggerScrollEdge();
    },

    triggerScrollEdge: function () {
      var oldPosition = this.scrollPosition;
      var newPosition = this.content.scrollPosition();

      this.scrollPosition = newPosition;

      if (newPosition.left < oldPosition.left && this.content.scrollLeft() === 0) {
        this.content.trigger('scrollleft');
      }

      if (newPosition.left > oldPosition.left && this.content.scrollLeft() === this.scrollSize.width - this.innerSize.width) {
        this.content.trigger('scrollright');
      }

      if (newPosition.top < oldPosition.top && this.content.scrollTop() === 0) {
        this.content.trigger('scrolltop');
      }

      if (newPosition.top > oldPosition.top && this.content.scrollTop() === this.scrollSize.height - this.innerSize.height) {
        this.content.trigger('scrollbottom');
      }
    },

    createScrollbarXFromSelector: function () {
      this.scrollbarX = $(this.options.selectorX, this.element);
      this.addScrollbarXOuterHandlers();

      this.handleContainerX = this.scrollbarX.children('.scola-handle-container');
      this.addHandleContainerXHandlers();

      this.handleX = this.handleContainerX.children('.scola-handle');
      this.addHandleXHandlers();

      this.buttonLeft = this.scrollbarX.children('.scola-button.scola-left');

      if (this.buttonLeft.length > 0) {
        this.addButtonLeftHandlers();
      }

      this.buttonRight = this.scrollbarX.children('.scola-button.scola-right');

      if (this.buttonRight.length > 0) {
        this.addButtonRightHandlers();
      }
    },

    destroyScrollbarXFromSelector: function () {
      if (this.buttonRight.length > 0) {
        this.removeButtonRightHandlers();
      }

      if (this.buttonLeft.length > 0) {
        this.removeButtonLeftHandlers();
      }

      this.removeHandleXHandlers();
      this.removeHandleContainerXHandlers();
      this.removeScrollbarXOuterHandlers();
    },

    createScrollbarX: function () {
      this.createScrollbarXOuter();
      this.addScrollbarXOuterHandlers();

      if (this.options.showButtons) {
        this.createButtonLeft();
        this.addButtonLeftHandlers();

        this.createButtonRight();
        this.addButtonRightHandlers();
      }

      this.createHandleContainerX();
      this.addHandleContainerXHandlers();

      this.createHandleX();
      this.addHandleXHandlers();
    },

    destroyScrollbarX: function () {
      this.removeHandleXHandlers();
      this.destroyHandleX();

      this.removeHandleContainerXHandlers();
      this.destroyHandleContainerX();

      if (this.options.showButtons) {
        this.removeButtonRightHandlers();
        this.destroyButtonRight();

        this.removeButtonLeftHandlers();
        this.destroyButtonLeft();
      }

      this.removeScrollbarXOuterHandlers();
      this.destroyScrollbarXOuter();
    },

    createScrollbarXOuter: function () {
      this.scrollbarX = $('<div class="scola-scrollbar scola-x">').css({
        position: 'absolute'
      }).appendTo(this.wrapper);
    },

    destroyScrollbarXOuter: function () {
      this.scrollbarX.remove();
    },

    addScrollbarXOuterHandlers: function () {
      this.scrollbarX.on({
        'mouseenter.scola-scrollable': $.proxy(this.handleScrollbarXMouseEnter, this),
        'mouseleave.scola-scrollable': $.proxy(this.handleScrollbarXMouseLeave, this)
      });
    },

    removeScrollbarXOuterHandlers: function () {
      this.scrollbarX.off('.scola-scrollable');
    },

    handleScrollbarXMouseEnter: function () {
      this.wrapper.addClass('scola-hover');
      this.scrollbarX.addClass('scola-hover');
    },

    handleScrollbarXMouseLeave: function () {
      this.wrapper.removeClass('scola-hover');
      this.scrollbarX.removeClass('scola-hover');
    },

    createButtonLeft: function () {
      this.buttonLeft = $('<div class="scola-button scola-left">').css({
        position: 'absolute',
        width: $.scrollbar.height,
        height: $.scrollbar.height
      }).appendTo(this.scrollbarX);
    },

    destroyButtonLeft: function () {
      this.buttonLeft.remove();
    },

    addButtonLeftHandlers: function () {
      this.buttonLeft.on('mousedown.scola-scrollable', $.proxy(this.handleButtonLeftMouseDown, this));
    },

    removeButtonLeftHandlers: function () {
      this.buttonLeft.off('.scola-scrollable');
    },

    handleButtonLeftMouseDown: function () {
      this.buttonLeft.addClass('scola-active');
      this.scrollbarX.addClass('scola-active');

      this.scrollLeft();

      this.activeButton = this.buttonLeft;
      this.activeScrollbar = this.scrollbarX;

      this.setButtonInterval(this.scrollLeft);
    },

    scrollLeft: function () {
      this.content.scrollLeft(this.content.scrollLeft() - this.options.scrollDelta);
    },

    createButtonRight: function () {
      this.buttonRight = $('<div class="scola-button scola-right">').css({
        position: 'absolute',
        width: $.scrollbar.height,
        height: $.scrollbar.height,
        right: 0
      }).appendTo(this.scrollbarX);
    },

    destroyButtonRight: function () {
      this.buttonRight.remove();
    },

    addButtonRightHandlers: function () {
      this.buttonRight.on('mousedown.scola-scrollable', $.proxy(this.handleButtonRightMouseDown, this));
    },

    removeButtonRightHandlers: function () {
      this.buttonRight.off('.scola-scrollable');
    },

    handleButtonRightMouseDown: function () {
      this.buttonRight.addClass('scola-active');
      this.scrollbarX.addClass('scola-active');

      this.scrollRight();

      this.activeButton = this.buttonRight;
      this.activeScrollbar = this.scrollbarX;

      this.setButtonInterval(this.scrollRight);
    },

    scrollRight: function () {
      this.content.scrollLeft(this.content.scrollLeft() + this.options.scrollDelta);
    },

    createHandleContainerX: function () {
      this.handleContainerX = $('<div class="scola-handle-container scola-x">').css({
        position: 'absolute',
        left: 0,
        right: 0,
        height: $.scrollbar.height
      }).appendTo(this.scrollbarX);

      if (this.options.showButtons) {
        this.handleContainerX.css({
          left: $.scrollbar.height,
          right: $.scrollbar.height
        });
      }
    },

    destroyHandleContainerX: function () {
      this.handleContainerX.remove();
    },

    addHandleContainerXHandlers: function () {
      this.handleContainerX.on({
        'mousewheel.scola-scrollable': $.proxy(this.handleContainerXMouseWheel, this),
        'mousedown.scola-scrollable': $.proxy(this.handleContainerXMouseDown, this)
      });
    },

    removeHandleContainerXHandlers: function () {
      this.handleContainerX.off('.scola-scrollable');
    },

    handleContainerXMouseWheel: function (event, delta) {
      event.preventDefault();

      this.content.scrollLeft(this.content.scrollLeft() - (delta * this.options.scrollDelta));
    },

    handleContainerXMouseDown: function (event) {
      if (this.handleX.is(event.target)) {
        return;
      }

      var ratio = (event.clientX - this.handleContainerX.offset().left) / (this.handleContainerXSize.width - this.handleXOuterSize.width);
      var correction = (this.handleXOuterSize.width / 2 / this.handleContainerXSize.width) * (this.scrollSize.width - this.innerSize.width);

      this.content.scrollLeft(((this.scrollSize.width - this.innerSize.width) * ratio) - correction);
    },

    createHandleX: function () {
      this.handleX = $('<div class="scola-handle scola-x">').css({
        position: 'absolute',
        left: 0,
        top: 0,
        height: $.scrollbar.height
      }).appendTo(this.handleContainerX);
    },

    destroyHandleX: function () {
      this.handleX.remove();
    },

    addHandleXHandlers: function () {
      this.handleX.draggable({
        containment: 'parent',
        drag: $.proxy(this.handleXDrag, this),
        stop: $.proxy(this.handleXDragStop, this)
      }).on({
        'mousedown.scola-scrollable': $.proxy(this.handleXMouseDown, this),
        'mouseup.scola-scrollable': $.proxy(this.handleXMouseUp, this)
      });
    },

    removeHandleXHandlers: function () {
      this.handleX.draggable('destroy').off('.scola-scrollable');
    },

    handleXDrag: function (event, ui) {
      this.content.scrollLeft((ui.position.left / (this.handleContainerXSize.width - this.handleXOuterSize.width)) *
        (this.scrollSize.width - this.innerSize.width));
    },

    handleXDragStop: function () {
      $(window).trigger('mouseup');
    },

    handleXMouseDown: function () {
      this.handleX.addClass('scola-active');
      this.scrollbarX.addClass('scola-active');

      this.activeHandle = this.handleX;
      this.activeScrollbar = this.scrollbarX;
    },

    handleXMouseUp: function () {
      $(window).trigger('mouseup');
    },

    createScrollbarYFromSelector: function () {
      this.scrollbarY = $(this.options.selectorY, this.element);
      this.addScrollbarYOuterHandlers();

      this.handleContainerY = this.scrollbarY.children('.scola-handle-container');
      this.addHandleContainerYHandlers();

      this.handleY = this.handleContainerY.children('.scola-handle');
      this.addHandleYHandlers();

      this.buttonUp = this.scrollbarY.children('.scola-button.scola-up');

      if (this.buttonUp.length > 0) {
        this.addButtonUpHandlers();
      }

      this.buttonDown = this.scrollbarY.children('.scola-button.scola-down');

      if (this.buttonDown.length > 0) {
        this.addButtonDownHandlers();
      }
    },

    destroyScrollbarYFromSelector: function () {
      if (this.buttonDown.length > 0) {
        this.removeButtonDownHandlers();
      }

      if (this.buttonUp.length > 0) {
        this.removeButtonUpHandlers();
      }

      this.removeHandleYHandlers();
      this.removeHandleContainerYHandlers();
      this.removeScrollbarYOuterHandlers();
    },

    createScrollbarY: function () {
      this.createScrollbarYOuter();
      this.addScrollbarYOuterHandlers();

      if (this.options.showButtons) {
        this.createButtonUp();
        this.addButtonUpHandlers();

        this.createButtonDown();
        this.addButtonDownHandlers();
      }

      this.createHandleContainerY();
      this.addHandleContainerYHandlers();

      this.createHandleY();
      this.addHandleYHandlers();
    },

    destroyScrollbarY: function () {
      this.removeHandleYHandlers();
      this.destroyHandleY();

      this.removeHandleContainerYHandlers();
      this.destroyHandleContainerY();

      if (this.options.showButtons) {
        this.removeButtonUpHandlers();
        this.destroyButtonUp();

        this.removeButtonDownHandlers();
        this.destroyButtonDown();
      }

      this.removeScrollbarYOuterHandlers();
      this.destroyScrollbarYOuter();
    },

    createScrollbarYOuter: function () {
      this.scrollbarY = $('<div class="scola-scrollbar scola-y">').css({
        position: 'absolute'
      }).appendTo(this.wrapper);
    },

    destroyScrollbarYOuter: function () {
      this.scrollbarY.remove();
    },

    addScrollbarYOuterHandlers: function () {
      this.scrollbarY.on({
        'mouseenter.scola-scrollable': $.proxy(this.handleScrollbarYMouseEnter, this),
        'mouseleave.scola-scrollable': $.proxy(this.handleScrollbarYMouseLeave, this)
      });
    },

    removeScrollbarYOuterHandlers: function () {
      this.scrollbarY.off('.scola-scrollable');
    },

    handleScrollbarYMouseEnter: function () {
      this.wrapper.addClass('scola-hover');
      this.scrollbarY.addClass('scola-hover');
    },

    handleScrollbarYMouseLeave: function () {
      this.wrapper.removeClass('scola-hover');
      this.scrollbarY.removeClass('scola-hover');
    },

    createButtonUp: function () {
      this.buttonUp = $('<div class="scola-button scola-up">').css({
        position: 'absolute',
        width: $.scrollbar.width,
        height: $.scrollbar.width
      }).appendTo(this.scrollbarY);
    },

    destroyButtonUp: function () {
      this.buttonUp.remove();
    },

    addButtonUpHandlers: function () {
      this.buttonUp.on({
        'mousedown.scola-scrollable': $.proxy(this.handleButtonUpMouseDown, this)
      });
    },

    removeButtonUpHandlers: function () {
      this.buttonUp.off('.scola-scrollable');
    },

    handleButtonUpMouseDown: function () {
      this.buttonUp.addClass('scola-active');
      this.scrollbarY.addClass('scola-active');

      this.scrollUp();

      this.activeButton = this.buttonUp;
      this.activeScrollbar = this.scrollbarY;

      this.setButtonInterval(this.scrollUp);
    },

    scrollUp: function () {
      this.content.scrollTop(this.content.scrollTop() - this.options.scrollDelta);
    },

    createButtonDown: function () {
      this.buttonDown = $('<div class="scola-button scola-down">').css({
        position: 'absolute',
        width: $.scrollbar.width,
        height: $.scrollbar.width,
        bottom: 0
      }).appendTo(this.scrollbarY);
    },

    destroyButtonDown: function () {
      this.buttonDown.remove();
    },

    addButtonDownHandlers: function () {
      this.buttonDown.on({
        'mousedown.scola-scrollable': $.proxy(this.handleButtonDownMouseDown, this)
      });
    },

    removeButtonDownHandlers: function () {
      this.buttonDown.off('.scola-scrollable');
    },

    handleButtonDownMouseDown: function () {
      this.buttonDown.addClass('scola-active');
      this.scrollbarY.addClass('scola-active');

      this.scrollDown();

      this.activeButton = this.buttonDown;
      this.activeScrollbar = this.scrollbarY;

      this.setButtonInterval(this.scrollDown);
    },

    scrollDown: function () {
      this.content.scrollTop(this.content.scrollTop() + this.options.scrollDelta);
    },

    createHandleContainerY: function () {
      this.handleContainerY = $('<div class="scola-handle-container scola-y">').css({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: $.scrollbar.width
      }).appendTo(this.scrollbarY);

      if (this.options.showButtons) {
        this.handleContainerY.css({
          top: $.scrollbar.width,
          bottom: $.scrollbar.width
        });
      }
    },

    destroyHandleContainerY: function () {
      this.handleContainerY.remove();
    },

    addHandleContainerYHandlers: function () {
      this.handleContainerY.on({
        'mousewheel.scola-scrollable': $.proxy(this.handleContainerYMouseWheel, this),
        'mousedown.scola-scrollable': $.proxy(this.handleContainerYMouseDown, this)
      });
    },

    removeHandleContainerYHandlers: function () {
      this.handleContainerY.off('.scola-scrollable');
    },

    handleContainerYMouseWheel: function (event, delta) {
      event.preventDefault();

      this.content.scrollTop(this.content.scrollTop() - (delta * this.options.scrollDelta));
    },

    handleContainerYMouseDown: function (event) {
      if (this.handleY.is(event.target)) {
        return;
      }

      var ratio = (event.clientY - this.handleContainerY.offset().top) / (this.handleContainerYSize.height - this.handleYOuterSize.height);
      var correction = (this.handleYOuterSize.height / 2 / this.handleContainerYSize.height) * (this.scrollSize.height - this.innerSize.height);

      this.content.scrollTop(((this.scrollSize.height - this.innerSize.height) * ratio) - correction);
    },

    createHandleY: function () {
      this.handleY = $('<div class="scola-handle scola-y">').css({
        position: 'absolute',
        left: 0,
        top: 0,
        width: $.scrollbar.width
      }).appendTo(this.handleContainerY);
    },

    destroyHandleY: function () {
      this.handleY.remove();
    },

    addHandleYHandlers: function () {
      this.handleY.draggable({
        containment: 'parent',
        stop: $.proxy(this.handleYDragStop, this),
        drag: $.proxy(this.handleYDrag, this)
      }).on({
        'mousedown.scola-scrollable': $.proxy(this.handleYMouseDown, this),
        'mouseup.scola-scrollable': $.proxy(this.handleYMouseUp, this)
      });
    },

    removeHandleYHandlers: function () {
      this.handleY.draggable('destroy').off('.scola-scrollable');
    },

    handleYDrag: function (event, ui) {
      this.content.scrollTop((ui.position.top / (this.handleContainerYSize.height - this.handleYOuterSize.height)) *
        (this.scrollSize.height - this.innerSize.height));
    },

    handleYDragStop: function () {
      $(window).trigger('mouseup');
    },

    handleYMouseDown: function () {
      this.handleY.addClass('scola-active');
      this.scrollbarY.addClass('scola-active');

      this.activeHandle = this.handleY;
      this.activeScrollbar = this.scrollbarY;
    },

    handleYMouseUp: function () {
      $(window).trigger('mouseup');
    },

    createCorner: function () {
      this.corner = $('<div class="scola-corner">').css({
        position: 'absolute',
        width: $.scrollbar.width,
        height: $.scrollbar.height
      }).appendTo(this.wrapper);
    },

    destroyCorner: function () {
      if (this.corner) {
        this.corner.remove();
      }
    },

    update: function () {
      this.overflowX = this.content.overflow('x');
      this.overflowY = this.content.overflow('y');

      this.position = this.content.position();
      this.innerSize = this.content.innerSize(true);
      this.scrollSize = this.content.scrollSize();

      this.calculateInnerOuterDelta();
      this.calculateHandleSize();

      this.setScrollbarVisibility();

      if (this.fromSelector) {
        this.setContentSize();

        // innerSize/scrollSize may have been changed
        this.innerSize = this.content.innerSize(true);
        this.scrollSize = this.content.scrollSize();
      } else {
        this.setScrollbarPosition();
        this.setScrollbarSize();

        this.setCornerVisibility();
        this.setCornerPosition();
      }

      this.calculateHandleContainerSize();

      this.setHandlePosition();
      this.setHandleSize();

      this.calculateHandleSize();
    },

    restore: function () {
      if (this.fromSelector) {
        this.restoreContentSize();
      }

      this.restoreScrollbarVisibility();
    },

    calculateInnerOuterDelta: function () {
      this.innerOuterDelta = {
        left: parseFloat(this.content.css('margin-left')) + parseFloat(this.content.css('border-left-width')),
        right: parseFloat(this.content.css('margin-right')) + parseFloat(this.content.css('border-right-width')),
        top: parseFloat(this.content.css('margin-top')) + parseFloat(this.content.css('border-top-width')),
        bottom: parseFloat(this.content.css('margin-bottom')) + parseFloat(this.content.css('border-bottom-width'))
      };
    },

    calculateHandleSize: function () {
      // Check visibility, otherwise jQuery will perform a very costly operation
      // to calculate width/height
      this.handleXOuterSize = (this.handleX.is(':visible')) ? this.handleX.outerSize(true) : {};
      this.handleYOuterSize = (this.handleY.is(':visible')) ? this.handleY.outerSize(true) : {};
    },

    calculateHandleContainerSize: function () {
      this.handleContainerXSize = (this.handleContainerX.is(':visible')) ? this.handleContainerX.size() : {};
      this.handleContainerYSize = (this.handleContainerY.is(':visible')) ? this.handleContainerY.size() : {};
    },

    setContentSize: function () {
      if (this.scrollbarX && this.showScrollbarX) {
        this.content.css('margin-bottom', -$.scrollbar.height);
      }

      if (this.scrollbarY && this.showScrollbarY) {
        this.content.css('margin-right', -$.scrollbar.width);
      }
    },

    restoreContentSize: function () {
      if (this.scrollbarX) {
        this.content.css('margin-bottom', '');
      }

      if (this.scrollbarY) {
        this.content.css('margin-right', '');
      }
    },

    setScrollbarVisibility: function () {
      if (this.scrollbarX) {
        this.setScrollbarXVisibility();
      }

      if (this.scrollbarY) {
        this.setScrollbarYVisibility();
      }
    },

    setScrollbarXVisibility: function () {
      var hasOverflowX = (this.scrollSize.width > this.innerSize.width);
      var showScrollbarX = (this.overflowX === 'scroll' || (this.overflowX === 'auto' && hasOverflowX));
      var disableScrollbarX = (this.overflowX === 'scroll' && !hasOverflowX);

      if (this.showScrollbarX !== showScrollbarX) {
        this.scrollbarX.toggle(showScrollbarX);
        this.wrapper.toggleClass('scola-x', showScrollbarX);

        this.showScrollbarX = showScrollbarX;
      }

      if (this.disableScrollbarX !== disableScrollbarX) {
        this.scrollbarX.toggleClass('scola-disabled', disableScrollbarX);

        this.disableScrollbarX = disableScrollbarX;
      }
    },

    setScrollbarYVisibility: function () {
      var hasOverflowY = (this.scrollSize.height > this.innerSize.height);
      var showScrollbarY = (this.overflowY === 'scroll' || (this.overflowY === 'auto' && hasOverflowY));
      var disableScrollbarY = (this.overflowY === 'scroll' && !hasOverflowY);

      if (this.showScrollbarY !== showScrollbarY) {
        this.scrollbarY.toggle(showScrollbarY);
        this.wrapper.toggleClass('scola-y', showScrollbarY);

        this.showScrollbarY = showScrollbarY;
      }

      if (this.disableScrollbarY !== disableScrollbarY) {
        this.scrollbarY.toggleClass('scola-disabled', disableScrollbarY);

        this.disableScrollbarY = disableScrollbarY;
      }
    },

    restoreScrollbarVisibility: function () {
      if (this.scrollbarX) {
        this.wrapper.removeClass('scola-x');
        this.scrollbarX.removeClass('scola-disabled');
      }

      if (this.scrollbarY) {
        this.wrapper.removeClass('scola-y');
        this.scrollbarY.removeClass('scola-disabled');
      }
    },

    setScrollbarPosition: function () {
      if (this.scrollbarX && this.showScrollbarX) {
        this.scrollbarX.css({
          top: this.position.top + this.innerOuterDelta.top + this.innerSize.height,
          left: this.position.left + this.innerOuterDelta.left
        });
      }

      if (this.scrollbarY) {
        this.scrollbarY.css({
          top: this.position.top + this.innerOuterDelta.top,
          left: this.position.left + this.innerOuterDelta.left + this.innerSize.width
        });
      }
    },

    setScrollbarSize: function () {
      if (this.scrollbarX && this.showScrollbarX) {
        this.scrollbarX.css({
          width: this.innerSize.width,
          height: $.scrollbar.height
        });
      }

      if (this.scrollbarY && this.showScrollbarY) {
        this.scrollbarY.css({
          width: $.scrollbar.width,
          height: this.innerSize.height
        });
      }
    },

    setHandlePosition: function () {
      if (this.handleX) {
        var contentScrollAreaX = this.scrollSize.width - this.innerSize.width;
        var scrollbarScrollAreaX = this.handleContainerXSize.width - this.handleXOuterSize.width;

        this.handleX.css('left', this.content.scrollLeft() / contentScrollAreaX * scrollbarScrollAreaX);
      }

      if (this.handleY) {
        var contentScrollAreaY = this.scrollSize.height - this.innerSize.height;
        var scrollbarScrollAreaY = this.handleContainerYSize.height - this.handleYOuterSize.height;

        this.handleY.css('top', this.content.scrollTop() / contentScrollAreaY * scrollbarScrollAreaY);
      }
    },

    setHandleSize: function () {
      if (this.handleX) {
        var newWidth = Math.round(this.innerSize.width / this.scrollSize.width * this.handleContainerXSize.width);

        this.handleX.css('width', Math.max(this.options.minHandleSize, newWidth));
      }

      if (this.handleY) {
        var newHeight = Math.round(this.innerSize.height / this.scrollSize.height * this.handleContainerYSize.height);

        this.handleY.css('height', Math.max(this.options.minHandleSize, newHeight));
      }
    },

    setCornerVisibility: function () {
      var showCorner = this.showScrollbarX && this.showScrollbarY;

      if (this.corner && this.showCorner !== showCorner) {
        this.corner.toggle(showCorner);

        this.showCorner = showCorner;
      }
    },

    setCornerPosition: function () {
      if (this.corner && this.showCorner) {
        this.corner.css({
          left: this.position.left + this.innerOuterDelta.left + this.innerSize.width,
          top: this.position.top + this.innerOuterDelta.top + this.innerSize.height
        });
      }
    }
  });

  $(document).ready(function () {
    $.scrollbar = function () {
      var tmp = $('<div>').css({
        position: 'absolute',
        left: -100,
        top: -100,
        overflow: 'auto',
        width: 100,
        height: 100
      }).append($('<div>').css({
        width: 200,
        height: 200
      })).appendTo('body');

      var size = {
        width: tmp.width() - tmp[0].clientWidth,
        height: tmp.height() - tmp[0].clientHeight
      };

      tmp.remove();

      return size;
    }();
  });

  $.fn.overflow = function (orientation) {
    var overflow = {
      x: this.css('overflow-x'),
      y: this.css('overflow-y')
    };

    if (overflow.x === 'visible' && overflow.y !== 'visible') {
      overflow.x = 'auto';
    }

    if (overflow.y === 'visible' && overflow.x !== 'visible') {
      overflow.y = 'auto';
    }

    return overflow[orientation];
  };

  $.fn.size = function () {
    return {
      width: this.width(),
      height: this.height()
    };
  },

  $.fn.innerSize = function (excludeScrollbar) {
    var size = {
      width: this.innerWidth(),
      height: this.innerHeight()
    };

    if (excludeScrollbar === true) {
      var overflowX = this.overflow('x');
      var overflowY = this.overflow('y');

      if (overflowY === 'scroll') {
        size.width -= $.scrollbar.width;
      } else if (overflowY === 'auto' && this[0].scrollHeight > size.height) {
        size.width -= $.scrollbar.width;
      }

      if (overflowX === 'scroll') {
        size.height -= $.scrollbar.height;
      } else if (overflowX === 'auto' && this[0].scrollWidth > size.width) {
        size.height -= $.scrollbar.height;
      }
    }

    return size;
  };

  $.fn.outerSize = function (includeMargin) {
    return {
      width: this.outerWidth(includeMargin),
      height: this.outerHeight(includeMargin)
    };
  },

  $.fn.scrollSize = function () {
    return {
      width: (this[0].scrollWidth > 0) ? this[0].scrollWidth : this.innerWidth(),
      height: (this[0].scrollHeight > 0) ? this[0].scrollHeight : this.innerHeight()
    };
  };

  $.fn.scrollPosition = function () {
    return {
      left: this.scrollLeft(),
      top: this.scrollTop()
    };
  };
}(jQuery));
