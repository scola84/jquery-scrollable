(function jQueryScolaScrollable($) {
  'use strict';

  $.widget('scola.scrollable', {
    options: {
      buttonInterval: 100,
      isWrapper: false,
      minHandleSize: 20,
      scrollDelta: 60,
      selectorX: null,
      selectorY: null,
      showButtons: true,
      touchNative: true
    },

    _create: function create() {
      this.setupObjects();

      this.addContentHandlers();

      if (!(this.isTouchDevice() && this.options.touchNative)) {
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

    _destroy: function destroy() {
      this.restore();

      if (!(this.isTouchDevice() && this.options.touchNative)) {
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

    setupObjects: function setupObjects() {
      if (this.options.isWrapper) {
        this.wrapper = this.element.addClass('scola-scrollable');
        this.content = this.wrapper.children().eq(1);
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

    teardownObjects: function teardownObjects() {
      if (this.options.isWrapper) {
        this.element.removeClass('scola-scrollable');
      } else {
        this.element.unwrap();
      }
    },

    isTouchDevice: function isTouchDevice() {
      return ('ontouchstart' in window || navigator.msMaxTouchPoints);
    },

    setButtonInterval: function setButtonInterval(method) {
      var context = this;

      this.buttonInterval = setInterval(function setButtonIntervalClosure() {
        method.call(context);
      }, this.options.buttonInterval);
    },

    addWindowHandlers: function addWindowHandlers() {
      $(window).on('mouseup.scola-scrollable', $.proxy(this.handleWindowMouseUp, this));
    },

    removeWindowHandlers: function removeContentHandlers() {
      $(window).off('.scola-scrollable');
    },

    handleWindowMouseUp: function handleWindowMouseUp() {
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

    addWrapperHandlers: function addWrapperHandlers() {
      this.wrapper.on('resize.scola-scrollable', $.proxy(this.update, this));
    },

    removeWrapperHandlers: function removeContentHandlers() {
      this.wrapper.off('.scola-scrollable');
    },

    addContentHandlers: function addContentHandlers() {
      this.content.on({
        'input.scola-scrollable': $.proxy(this.update, this),
        'mouseenter.scola-scrollable': $.proxy(this.handleContentMouseEnter, this),
        'mouseleave.scola-scrollable': $.proxy(this.handleContentMouseLeave, this),
        'mousewheel.scola-scrollable': $.proxy(this.handleContentMouseWheel, this),
        'resize.scola-scrollable': $.proxy(this.update, this),
        'scroll.scola-scrollable': $.proxy(this.handleContentScroll, this)
      });
    },

    removeContentHandlers: function removeContentHandlers() {
      this.content.off('.scola-scrollable');
    },

    handleContentMouseWheel: function handleContentMouseWheel(event, delta) {
      if (!this.showScrollbarY && this.showScrollbarX) {
        event.preventDefault();

        this.content.scrollLeft(this.content.scrollLeft() - (delta * this.options.scrollDelta));
      }
    },

    handleContentMouseEnter: function handleContentMouseEnter() {
      this.wrapper.addClass('scola-hover');
    },

    handleContentMouseLeave: function handleContentMouseLeave() {
      this.wrapper.removeClass('scola-hover');
    },

    handleContentScroll: function handleContentScroll() {
      this.setHandlePosition();
      this.triggerScrollEdge();
    },

    triggerScrollEdge: function triggerScrollEdge() {
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

    createScrollbarXFromSelector: function createScrollbarXFromSelector() {
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

    destroyScrollbarXFromSelector: function destroyScrollbarXFromSelector() {
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

    createScrollbarX: function createScrollbarX() {
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

    destroyScrollbarX: function destroyScrollbarX() {
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

    createScrollbarXOuter: function createScrollbarXOuter() {
      this.scrollbarX = $('<div class="scola-scrollbar scola-x">').css({
        position: 'absolute'
      }).appendTo(this.wrapper);
    },

    destroyScrollbarXOuter: function destroyScrollbarXOuter() {
      this.scrollbarX.remove();
    },

    addScrollbarXOuterHandlers: function addScrollbarXOuterHandlers() {
      this.scrollbarX.on({
        'mouseenter.scola-scrollable': $.proxy(this.handleScrollbarXMouseEnter, this),
        'mouseleave.scola-scrollable': $.proxy(this.handleScrollbarXMouseLeave, this)
      });
    },

    removeScrollbarXOuterHandlers: function removeScrollbarXOuterHandlers() {
      this.scrollbarX.off('.scola-scrollable');
    },

    handleScrollbarXMouseEnter: function handleScrollbarXMouseEnter() {
      this.wrapper.addClass('scola-hover');
      this.scrollbarX.addClass('scola-hover');
    },

    handleScrollbarXMouseLeave: function handleScrollbarXMouseLeave() {
      this.wrapper.removeClass('scola-hover');
      this.scrollbarX.removeClass('scola-hover');
    },

    createButtonLeft: function createButtonLeft() {
      this.buttonLeft = $('<div class="scola-button scola-left">').css({
        position: 'absolute',
        width: $.scrollbar.height,
        height: $.scrollbar.height
      }).appendTo(this.scrollbarX);
    },

    destroyButtonLeft: function destroyButtonLeft() {
      this.buttonLeft.remove();
    },

    addButtonLeftHandlers: function addButtonLeftHandlers() {
      this.buttonLeft.on('mousedown.scola-scrollable', $.proxy(this.handleButtonLeftMouseDown, this));
    },

    removeButtonLeftHandlers: function removeButtonLeftHandlers() {
      this.buttonLeft.off('.scola-scrollable');
    },

    handleButtonLeftMouseDown: function handleButtonLeftMouseDown() {
      this.buttonLeft.addClass('scola-active');
      this.scrollbarX.addClass('scola-active');

      this.scrollLeft();

      this.activeButton = this.buttonLeft;
      this.activeScrollbar = this.scrollbarX;

      this.setButtonInterval(this.scrollLeft);
    },

    scrollLeft: function scrollLeft() {
      this.content.scrollLeft(this.content.scrollLeft() - this.options.scrollDelta);
    },

    createButtonRight: function createButtonRight() {
      this.buttonRight = $('<div class="scola-button scola-right">').css({
        position: 'absolute',
        width: $.scrollbar.height,
        height: $.scrollbar.height,
        right: 0
      }).appendTo(this.scrollbarX);
    },

    destroyButtonRight: function removeButtonRight() {
      this.buttonRight.remove();
    },

    addButtonRightHandlers: function addButtonRightHandlers() {
      this.buttonRight.on('mousedown.scola-scrollable', $.proxy(this.handleButtonRightMouseDown, this));
    },

    removeButtonRightHandlers: function removeButtonRightHandlers() {
      this.buttonRight.off('.scola-scrollable');
    },

    handleButtonRightMouseDown: function handleButtonRightMouseDown() {
      this.buttonRight.addClass('scola-active');
      this.scrollbarX.addClass('scola-active');

      this.scrollRight();

      this.activeButton = this.buttonRight;
      this.activeScrollbar = this.scrollbarX;

      this.setButtonInterval(this.scrollRight);
    },

    scrollRight: function scrollRight() {
      this.content.scrollLeft(this.content.scrollLeft() + this.options.scrollDelta);
    },

    createHandleContainerX: function createHandleContainerX() {
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

    destroyHandleContainerX: function destroyHandleContainerX() {
      this.handleContainerX.remove();
    },

    addHandleContainerXHandlers: function addHandleContainerXHandlers() {
      this.handleContainerX.on({
        'mousewheel.scola-scrollable': $.proxy(this.handleContainerXMouseWheel, this),
        'mousedown.scola-scrollable': $.proxy(this.handleContainerXMouseDown, this)
      });
    },

    removeHandleContainerXHandlers: function removeHandleContainerXHandlers() {
      this.handleContainerX.off('.scola-scrollable');
    },

    handleContainerXMouseWheel: function handleContainerXMouseWheel(event, delta) {
      event.preventDefault();

      this.content.scrollLeft(this.content.scrollLeft() - (delta * this.options.scrollDelta));
    },

    handleContainerXMouseDown: function handleContainerXMouseDown(event) {
      if (this.handleX.is(event.target)) {
        return;
      }

      var ratio = (event.clientX - this.handleContainerX.offset().left) / (this.handleContainerXSize.width - this.handleXOuterSize.width);
      var correction = (this.handleXOuterSize.width / 2 / this.handleContainerXSize.width) * (this.scrollSize.width - this.innerSize.width);

      this.content.scrollLeft(((this.scrollSize.width - this.innerSize.width) * ratio) - correction);
    },

    createHandleX: function createHandleX() {
      this.handleX = $('<div class="scola-handle scola-x">').css({
        position: 'absolute',
        left: 0,
        top: 0,
        height: $.scrollbar.height
      }).appendTo(this.handleContainerX);
    },

    destroyHandleX: function destroyHandleX() {
      this.handleX.remove();
    },

    addHandleXHandlers: function addHandleXHandlers() {
      this.handleX.draggable({
        containment: 'parent',
        drag: $.proxy(this.handleXDrag, this),
        stop: $.proxy(this.handleXDragStop, this)
      }).on({
        'mousedown.scola-scrollable': $.proxy(this.handleXMouseDown, this),
        'mouseup.scola-scrollable': $.proxy(this.handleXMouseUp, this)
      });
    },

    removeHandleXHandlers: function removeHandleXHandlers() {
      this.handleX.draggable('destroy').off('.scola-scrollable');
    },

    handleXDrag: function handleXDrag(event, ui) {
      this.content.scrollLeft((ui.position.left / (this.handleContainerXSize.width - this.handleXOuterSize.width)) *
        (this.scrollSize.width - this.innerSize.width));
    },

    handleXDragStop: function handleXDragStop() {
      $(window).trigger('mouseup');
    },

    handleXMouseDown: function handleXMouseDown() {
      this.handleX.addClass('scola-active');
      this.scrollbarX.addClass('scola-active');

      this.activeHandle = this.handleX;
      this.activeScrollbar = this.scrollbarX;
    },

    handleXMouseUp: function handleXMouseUp() {
      $(window).trigger('mouseup');
    },

    createScrollbarYFromSelector: function createScrollbarYFromSelector() {
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

    destroyScrollbarYFromSelector: function destroyScrollbarYFromSelector() {
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

    createScrollbarY: function createScrollbarY() {
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

    destroyScrollbarY: function destroyScrollbarY() {
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

    createScrollbarYOuter: function createScrollbarYOuter() {
      this.scrollbarY = $('<div class="scola-scrollbar scola-y">').css({
        position: 'absolute'
      }).appendTo(this.wrapper);
    },

    destroyScrollbarYOuter: function destroyScrollbarYOuter() {
      this.scrollbarY.remove();
    },

    addScrollbarYOuterHandlers: function addScrollbarYOuterHandlers() {
      this.scrollbarY.on({
        'mouseenter.scola-scrollable': $.proxy(this.handleScrollbarYMouseEnter, this),
        'mouseleave.scola-scrollable': $.proxy(this.handleScrollbarYMouseLeave, this)
      });
    },

    removeScrollbarYOuterHandlers: function removeScrollbarYOuterHandlers() {
      this.scrollbarY.off('.scola-scrollable');
    },

    handleScrollbarYMouseEnter: function handleScrollbarYMouseEnter() {
      this.wrapper.addClass('scola-hover');
      this.scrollbarY.addClass('scola-hover');
    },

    handleScrollbarYMouseLeave: function handleScrollbarYMouseLeave() {
      this.wrapper.removeClass('scola-hover');
      this.scrollbarY.removeClass('scola-hover');
    },

    createButtonUp: function createButtonUp() {
      this.buttonUp = $('<div class="scola-button scola-up">').css({
        position: 'absolute',
        width: $.scrollbar.width,
        height: $.scrollbar.width
      }).appendTo(this.scrollbarY);
    },

    destroyButtonUp: function destroyButtonUp() {
      this.buttonUp.remove();
    },

    addButtonUpHandlers: function addButtonUpHandlers() {
      this.buttonUp.on({
        'mousedown.scola-scrollable': $.proxy(this.handleButtonUpMouseDown, this)
      });
    },

    removeButtonUpHandlers: function removeButtonUpHandlers() {
      this.buttonUp.off('.scola-scrollable');
    },

    handleButtonUpMouseDown: function handleButtonUpMouseDown() {
      this.buttonUp.addClass('scola-active');
      this.scrollbarY.addClass('scola-active');

      this.scrollUp();

      this.activeButton = this.buttonUp;
      this.activeScrollbar = this.scrollbarY;

      this.setButtonInterval(this.scrollUp);
    },

    scrollUp: function scrollUp() {
      this.content.scrollTop(this.content.scrollTop() - this.options.scrollDelta);
    },

    createButtonDown: function createButtonDown() {
      this.buttonDown = $('<div class="scola-button scola-down">').css({
        position: 'absolute',
        width: $.scrollbar.width,
        height: $.scrollbar.width,
        bottom: 0
      }).appendTo(this.scrollbarY);
    },

    destroyButtonDown: function destroyButtonDown() {
      this.buttonDown.remove();
    },

    addButtonDownHandlers: function addButtonDownHandlers() {
      this.buttonDown.on({
        'mousedown.scola-scrollable': $.proxy(this.handleButtonDownMouseDown, this)
      });
    },

    removeButtonDownHandlers: function removeButtonDownHandlers() {
      this.buttonDown.off('.scola-scrollable');
    },

    handleButtonDownMouseDown: function handleButtonDownMouseDown() {
      this.buttonDown.addClass('scola-active');
      this.scrollbarY.addClass('scola-active');

      this.scrollDown();

      this.activeButton = this.buttonDown;
      this.activeScrollbar = this.scrollbarY;

      this.setButtonInterval(this.scrollDown);
    },

    scrollDown: function scrollDown() {
      this.content.scrollTop(this.content.scrollTop() + this.options.scrollDelta);
    },

    createHandleContainerY: function createHandleContainerY() {
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

    destroyHandleContainerY: function destroyHandleContainerY() {
      this.handleContainerY.remove();
    },

    addHandleContainerYHandlers: function addHandleContainerYHandlers() {
      this.handleContainerY.on({
        'mousewheel.scola-scrollable': $.proxy(this.handleContainerYMouseWheel, this),
        'mousedown.scola-scrollable': $.proxy(this.handleContainerYMouseDown, this)
      });
    },

    removeHandleContainerYHandlers: function removeHandleContainerYHandlers() {
      this.handleContainerY.off('.scola-scrollable');
    },

    handleContainerYMouseWheel: function handleContainerYMouseWheel(event, delta) {
      event.preventDefault();

      this.content.scrollTop(this.content.scrollTop() - (delta * this.options.scrollDelta));
    },

    handleContainerYMouseDown: function handleContainerYMouseDown(event) {
      if (this.handleY.is(event.target)) {
        return;
      }

      var ratio = (event.clientY - this.handleContainerY.offset().top) / (this.handleContainerYSize.height - this.handleYOuterSize.height);
      var correction = (this.handleYOuterSize.height / 2 / this.handleContainerYSize.height) * (this.scrollSize.height - this.innerSize.height);

      this.content.scrollTop(((this.scrollSize.height - this.innerSize.height) * ratio) - correction);
    },

    createHandleY: function createHandleY() {
      this.handleY = $('<div class="scola-handle scola-y">').css({
        position: 'absolute',
        left: 0,
        top: 0,
        width: $.scrollbar.width
      }).appendTo(this.handleContainerY);
    },

    destroyHandleY: function destroyHandleY() {
      this.handleY.remove();
    },

    addHandleYHandlers: function addHandleYHandlers() {
      this.handleY.draggable({
        containment: 'parent',
        stop: $.proxy(this.handleYDragStop, this),
        drag: $.proxy(this.handleYDrag, this)
      }).on({
        'mousedown.scola-scrollable': $.proxy(this.handleYMouseDown, this),
        'mouseup.scola-scrollable': $.proxy(this.handleYMouseUp, this)
      });
    },

    removeHandleYHandlers: function removeHandleYHandlers() {
      this.handleY.draggable('destroy').off('.scola-scrollable');
    },

    handleYDrag: function handleYDrag(event, ui) {
      this.content.scrollTop((ui.position.top / (this.handleContainerYSize.height - this.handleYOuterSize.height)) *
        (this.scrollSize.height - this.innerSize.height));
    },

    handleYDragStop: function handleYDragStop() {
      $(window).trigger('mouseup');
    },

    handleYMouseDown: function handleYMouseDown() {
      this.handleY.addClass('scola-active');
      this.scrollbarY.addClass('scola-active');

      this.activeHandle = this.handleY;
      this.activeScrollbar = this.scrollbarY;
    },

    handleYMouseUp: function handleYMouseUp() {
      $(window).trigger('mouseup');
    },

    createCorner: function createCorner() {
      this.corner = $('<div class="scola-corner">').css({
        position: 'absolute',
        width: $.scrollbar.width,
        height: $.scrollbar.height
      }).appendTo(this.wrapper);
    },

    destroyCorner: function destroyCorner() {
      if (this.corner) {
        this.corner.remove();
      }
    },

    update: function update() {
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

    restore: function restore() {
      if (this.fromSelector) {
        this.restoreContentSize();
      }

      this.restoreScrollbarVisibility();
    },

    calculateInnerOuterDelta: function calculateInnerOuterDelta() {
      this.innerOuterDelta = {
        left: parseFloat(this.content.css('margin-left')) + parseFloat(this.content.css('border-left-width')),
        right: parseFloat(this.content.css('margin-right')) + parseFloat(this.content.css('border-right-width')),
        top: parseFloat(this.content.css('margin-top')) + parseFloat(this.content.css('border-top-width')),
        bottom: parseFloat(this.content.css('margin-bottom')) + parseFloat(this.content.css('border-bottom-width'))
      };
    },

    calculateHandleSize: function calculateHandleSize() {
      // Check visibility, otherwise jQuery will perform a very costly operation
      // to calculate width/height
      this.handleXOuterSize = (this.handleX.is(':visible')) ? this.handleX.outerSize(true) : {};
      this.handleYOuterSize = (this.handleY.is(':visible')) ? this.handleY.outerSize(true) : {};
    },

    calculateHandleContainerSize: function calculateHandleContainerSize() {
      this.handleContainerXSize = (this.handleContainerX.is(':visible')) ? this.handleContainerX.size() : {};
      this.handleContainerYSize = (this.handleContainerY.is(':visible')) ? this.handleContainerY.size() : {};
    },

    setContentSize: function setContentSize() {
      if (this.scrollbarX && this.showScrollbarX) {
        this.content.css('margin-bottom', -$.scrollbar.height);
      }

      if (this.scrollbarY && this.showScrollbarY) {
        this.content.css('margin-right', -$.scrollbar.width);
      }
    },

    restoreContentSize: function restoreContentSize() {
      if (this.scrollbarX) {
        this.content.css('margin-bottom', '');
      }

      if (this.scrollbarY) {
        this.content.css('margin-right', '');
      }
    },

    setScrollbarVisibility: function setScrollbarVisibility() {
      if (this.scrollbarX) {
        this.setScrollbarXVisibility();
      }

      if (this.scrollbarY) {
        this.setScrollbarYVisibility();
      }
    },

    setScrollbarXVisibility: function setScrollbarXVisibility() {
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

    setScrollbarYVisibility: function setScrollbarYVisibility() {
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

    restoreScrollbarVisibility: function restoreScrollbarVisibility() {
      if (this.scrollbarX) {
        this.wrapper.removeClass('scola-x');
        this.scrollbarX.removeClass('scola-disabled');
      }

      if (this.scrollbarY) {
        this.wrapper.removeClass('scola-y');
        this.scrollbarY.removeClass('scola-disabled');
      }
    },

    setScrollbarPosition: function setScrollbarPosition() {
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

    setScrollbarSize: function setScrollbarSize() {
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

    setHandlePosition: function setHandlePosition() {
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

    setHandleSize: function setHandleSize() {
      if (this.handleX) {
        var newWidth = Math.round(this.innerSize.width / this.scrollSize.width * this.handleContainerXSize.width);

        this.handleX.css('width', Math.max(this.options.minHandleSize, newWidth));
      }

      if (this.handleY) {
        var newHeight = Math.round(this.innerSize.height / this.scrollSize.height * this.handleContainerYSize.height);

        this.handleY.css('height', Math.max(this.options.minHandleSize, newHeight));
      }
    },

    setCornerVisibility: function setCornerVisibility() {
      var showCorner = this.showScrollbarX && this.showScrollbarY;

      if (this.corner && this.showCorner !== showCorner) {
        this.corner.toggle(showCorner);

        this.showCorner = showCorner;
      }
    },

    setCornerPosition: function setCornerPosition() {
      if (this.corner && this.showCorner) {
        this.corner.css({
          left: this.position.left + this.innerOuterDelta.left + this.innerSize.width,
          top: this.position.top + this.innerOuterDelta.top + this.innerSize.height
        });
      }
    }
  });

  $(document).ready(function() {
    $.scrollbar = function() {
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

  $.fn.overflow = function overflow(orientation) {
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

  $.fn.size = function size() {
    return {
      width: this.width(),
      height: this.height()
    };
  },

  $.fn.innerSize = function innerSize(excludeScrollbar) {
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

  $.fn.outerSize = function outerSize(includeMargin) {
    return {
      width: this.outerWidth(includeMargin),
      height: this.outerHeight(includeMargin)
    };
  },

  $.fn.scrollSize = function scrollSize() {
    return {
      width: (this[0].scrollWidth > 0) ? this[0].scrollWidth : this.innerWidth(),
      height: (this[0].scrollHeight > 0) ? this[0].scrollHeight : this.innerHeight()
    };
  };

  $.fn.scrollPosition = function scrollPosition() {
    return {
      left: this.scrollLeft(),
      top: this.scrollTop()
    };
  };
}(jQuery));