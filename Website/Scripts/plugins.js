/*
 * jQuery FlexSlider v2.7.2
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

	var focused = true;

	//FlexSlider: Object Instance
	$.flexslider = function (el, options) {
		var slider = $(el);

		// making variables public

		//if rtl value was not passed and html is in rtl..enable it by default.
		if (typeof options.rtl == 'undefined' && $('html').attr('dir') == 'rtl') {
			options.rtl = true;
		}
		slider.vars = $.extend({}, $.flexslider.defaults, options);

		var namespace = slider.vars.namespace,
			msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
			touch = (("ontouchstart" in window) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
			// deprecating this idea, as devices are being released with both of these events
			eventType = "click touchend MSPointerUp keyup",
			watchedEvent = "",
			watchedEventClearTimer,
			vertical = slider.vars.direction === "vertical",
			reverse = slider.vars.reverse,
			carousel = (slider.vars.itemWidth > 0),
			fade = slider.vars.animation === "fade",
			asNav = slider.vars.asNavFor !== "",
			methods = {};

		// Store a reference to the slider object
		$.data(el, "flexslider", slider);

		// Private slider methods
		methods = {
			init: function () {
				slider.animating = false;
				// Get current slide and make sure it is a number
				slider.currentSlide = parseInt((slider.vars.startAt ? slider.vars.startAt : 0), 10);
				if (isNaN(slider.currentSlide)) { slider.currentSlide = 0; }
				slider.animatingTo = slider.currentSlide;
				slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
				slider.containerSelector = slider.vars.selector.substr(0, slider.vars.selector.search(' '));
				slider.slides = $(slider.vars.selector, slider);
				slider.container = $(slider.containerSelector, slider);
				slider.count = slider.slides.length;
				// SYNC:
				slider.syncExists = $(slider.vars.sync).length > 0;
				// SLIDE:
				if (slider.vars.animation === "slide") { slider.vars.animation = "swing"; }
				slider.prop = (vertical) ? "top" : (slider.vars.rtl ? "marginRight" : "marginLeft");
				slider.args = {};
				// SLIDESHOW:
				slider.manualPause = false;
				slider.stopped = false;
				//PAUSE WHEN INVISIBLE
				slider.started = false;
				slider.startTimeout = null;
				// TOUCH/USECSS:
				slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function () {
					var obj = document.createElement('div'),
						props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
					for (var i in props) {
						if (obj.style[props[i]] !== undefined) {
							slider.pfx = props[i].replace('Perspective', '').toLowerCase();
							slider.prop = "-" + slider.pfx + "-transform";
							return true;
						}
					}
					return false;
				}());
				slider.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
				slider.ensureAnimationEnd = '';
				// CONTROLSCONTAINER:
				if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
				// MANUAL:
				if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

				// CUSTOM DIRECTION NAV:
				if (slider.vars.customDirectionNav !== "") slider.customDirectionNav = $(slider.vars.customDirectionNav).length === 2 && $(slider.vars.customDirectionNav);

				// RANDOMIZE:
				if (slider.vars.randomize) {
					slider.slides.sort(function () { return (Math.round(Math.random()) - 0.5); });
					slider.container.empty().append(slider.slides);
				}

				slider.doMath();

				// INIT
				slider.setup("init");

				// CONTROLNAV:
				if (slider.vars.controlNav) { methods.controlNav.setup(); }

				// DIRECTIONNAV:
				if (slider.vars.directionNav) { methods.directionNav.setup(); }

				// KEYBOARD:
				if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
					$(document).bind('keyup', function (event) {
						var keycode = event.keyCode;
						if (!slider.animating && (keycode === 39 || keycode === 37)) {
							var target = (slider.vars.rtl ?
								((keycode === 37) ? slider.getTarget('next') :
									(keycode === 39) ? slider.getTarget('prev') : false)
								:
								((keycode === 39) ? slider.getTarget('next') :
									(keycode === 37) ? slider.getTarget('prev') : false)
							)
								;
							slider.flexAnimate(target, slider.vars.pauseOnAction);
						}
					});
				}
				// MOUSEWHEEL:
				if (slider.vars.mousewheel) {
					slider.bind('mousewheel', function (event, delta, deltaX, deltaY) {
						event.preventDefault();
						var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
						slider.flexAnimate(target, slider.vars.pauseOnAction);
					});
				}

				// PAUSEPLAY
				if (slider.vars.pausePlay) { methods.pausePlay.setup(); }

				//PAUSE WHEN INVISIBLE
				if (slider.vars.slideshow && slider.vars.pauseInvisible) { methods.pauseInvisible.init(); }

				// SLIDSESHOW
				if (slider.vars.slideshow) {
					if (slider.vars.pauseOnHover) {
						slider.hover(function () {
							if (!slider.manualPlay && !slider.manualPause) { slider.pause(); }
						}, function () {
							if (!slider.manualPause && !slider.manualPlay && !slider.stopped) { slider.play(); }
						});
					}
					// initialize animation
					//If we're visible, or we don't use PageVisibility API
					if (!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
						(slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
					}
				}

				// ASNAV:
				if (asNav) { methods.asNav.setup(); }

				// TOUCH
				if (touch && slider.vars.touch) { methods.touch(); }

				// FADE&&SMOOTHHEIGHT || SLIDE:
				if (!fade || (fade && slider.vars.smoothHeight)) { $(window).bind("resize orientationchange focus", methods.resize); }

				slider.find("img").attr("draggable", "false");

				// API: start() Callback
				setTimeout(function () {
					slider.vars.start(slider);
				}, 200);
			},
			asNav: {
				setup: function () {
					slider.asNav = true;
					slider.animatingTo = Math.floor(slider.currentSlide / slider.move);
					slider.currentItem = slider.currentSlide;
					slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
					if (!msGesture) {
						slider.slides.on(eventType, function (e) {
							e.preventDefault();
							var $slide = $(this),
								target = $slide.index();
							var posFromX;
							if (slider.vars.rtl) {
								posFromX = -1 * ($slide.offset().right - $(slider).scrollLeft()); // Find position of slide relative to right of slider container
							}
							else {
								posFromX = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
							}
							if (posFromX <= 0 && $slide.hasClass(namespace + 'active-slide')) {
								slider.flexAnimate(slider.getTarget("prev"), true);
							} else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
								slider.direction = (slider.currentItem < target) ? "next" : "prev";
								slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
							}
						});
					} else {
						el._slider = slider;
						slider.slides.each(function () {
							var that = this;
							that._gesture = new MSGesture();
							that._gesture.target = that;
							that.addEventListener("MSPointerDown", function (e) {
								e.preventDefault();
								if (e.currentTarget._gesture) {
									e.currentTarget._gesture.addPointer(e.pointerId);
								}
							}, false);
							that.addEventListener("MSGestureTap", function (e) {
								e.preventDefault();
								var $slide = $(this),
									target = $slide.index();
								if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
									slider.direction = (slider.currentItem < target) ? "next" : "prev";
									slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
								}
							});
						});
					}
				}
			},
			controlNav: {
				setup: function () {
					if (!slider.manualControls) {
						methods.controlNav.setupPaging();
					} else { // MANUALCONTROLS:
						methods.controlNav.setupManual();
					}
				},
				setupPaging: function () {
					var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
						j = 1,
						item,
						slide;

					slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');

					if (slider.pagingCount > 1) {
						for (var i = 0; i < slider.pagingCount; i++) {
							slide = slider.slides.eq(i);

							if (undefined === slide.attr('data-thumb-alt')) {
								slide.attr('data-thumb-alt', '');
							}

							item = $('<a></a>').attr('href', '#').text(j);
							if (slider.vars.controlNav === "thumbnails") {
								item = $('<img/>').attr('src', slide.attr('data-thumb'));
							}

							if ('' !== slide.attr('data-thumb-alt')) {
								item.attr('alt', slide.attr('data-thumb-alt'));
							}

							if ('thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions) {
								var captn = slide.attr('data-thumbcaption');
								if ('' !== captn && undefined !== captn) {
									var caption = $('<span></span>').addClass(namespace + 'caption').text(captn);
									item.append(caption);
								}
							}

							var liElement = $('<li>');
							item.appendTo(liElement);
							liElement.append('</li>');

							slider.controlNavScaffold.append(liElement);
							j++;

						}
					}

					// CONTROLSCONTAINER:
					(slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
					methods.controlNav.set();

					methods.controlNav.active();

					slider.controlNavScaffold.delegate('a, img', eventType, function (event) {
						event.preventDefault();

						if (watchedEvent === "" || watchedEvent === event.type) {
							var $this = $(this),
								target = slider.controlNav.index($this);

							if (!$this.hasClass(namespace + 'active')) {
								slider.direction = (target > slider.currentSlide) ? "next" : "prev";
								slider.flexAnimate(target, slider.vars.pauseOnAction);
							}
						}

						// setup flags to prevent event duplication
						if (watchedEvent === "") {
							watchedEvent = event.type;
						}
						methods.setToClearWatchedEvent();

					});
				},
				setupManual: function () {
					slider.controlNav = slider.manualControls;
					methods.controlNav.active();

					slider.controlNav.bind(eventType, function (event) {
						event.preventDefault();

						if (watchedEvent === "" || watchedEvent === event.type) {
							var $this = $(this),
								target = slider.controlNav.index($this);

							if (!$this.hasClass(namespace + 'active')) {
								(target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
								slider.flexAnimate(target, slider.vars.pauseOnAction);
							}
						}

						// setup flags to prevent event duplication
						if (watchedEvent === "") {
							watchedEvent = event.type;
						}
						methods.setToClearWatchedEvent();
					});
				},
				set: function () {
					var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
					slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
				},
				active: function () {
					slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
				},
				update: function (action, pos) {
					if (slider.pagingCount > 1 && action === "add") {
						slider.controlNavScaffold.append($('<li><a href="#">' + slider.count + '</a></li>'));
					} else if (slider.pagingCount === 1) {
						slider.controlNavScaffold.find('li').remove();
					} else {
						slider.controlNav.eq(pos).closest('li').remove();
					}
					methods.controlNav.set();
					(slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
				}
			},
			directionNav: {
				setup: function () {
					var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li class="' + namespace + 'nav-prev"><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li class="' + namespace + 'nav-next"><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

					// CUSTOM DIRECTION NAV:
					if (slider.customDirectionNav) {
						slider.directionNav = slider.customDirectionNav;
						// CONTROLSCONTAINER:
					} else if (slider.controlsContainer) {
						$(slider.controlsContainer).append(directionNavScaffold);
						slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
					} else {
						slider.append(directionNavScaffold);
						slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
					}

					methods.directionNav.update();

					slider.directionNav.bind(eventType, function (event) {
						event.preventDefault();
						var target;

						if (watchedEvent === "" || watchedEvent === event.type) {
							target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
							slider.flexAnimate(target, slider.vars.pauseOnAction);
						}

						// setup flags to prevent event duplication
						if (watchedEvent === "") {
							watchedEvent = event.type;
						}
						methods.setToClearWatchedEvent();
					});
				},
				update: function () {
					var disabledClass = namespace + 'disabled';
					if (slider.pagingCount === 1) {
						slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
					} else if (!slider.vars.animationLoop) {
						if (slider.animatingTo === 0) {
							slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
						} else if (slider.animatingTo === slider.last) {
							slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
						} else {
							slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
						}
					} else {
						slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
					}
				}
			},
			pausePlay: {
				setup: function () {
					var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a href="#"></a></div>');

					// CONTROLSCONTAINER:
					if (slider.controlsContainer) {
						slider.controlsContainer.append(pausePlayScaffold);
						slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
					} else {
						slider.append(pausePlayScaffold);
						slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
					}

					methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

					slider.pausePlay.bind(eventType, function (event) {
						event.preventDefault();

						if (watchedEvent === "" || watchedEvent === event.type) {
							if ($(this).hasClass(namespace + 'pause')) {
								slider.manualPause = true;
								slider.manualPlay = false;
								slider.pause();
							} else {
								slider.manualPause = false;
								slider.manualPlay = true;
								slider.play();
							}
						}

						// setup flags to prevent event duplication
						if (watchedEvent === "") {
							watchedEvent = event.type;
						}
						methods.setToClearWatchedEvent();
					});
				},
				update: function (state) {
					(state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
				}
			},
			touch: function () {
				var startX,
					startY,
					offset,
					cwidth,
					dx,
					startT,
					onTouchStart,
					onTouchMove,
					onTouchEnd,
					scrolling = false,
					localX = 0,
					localY = 0,
					accDx = 0;

				if (!msGesture) {
					onTouchStart = function (e) {
						if (slider.animating) {
							e.preventDefault();
						} else if ((window.navigator.msPointerEnabled) || e.touches.length === 1) {
							slider.pause();
							// CAROUSEL:
							cwidth = (vertical) ? slider.h : slider.w;
							startT = Number(new Date());
							// CAROUSEL:

							// Local vars for X and Y points.
							localX = e.touches[0].pageX;
							localY = e.touches[0].pageY;

							offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
								(carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
									(carousel && slider.currentSlide === slider.last) ? slider.limit :
										(carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
											(reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
							startX = (vertical) ? localY : localX;
							startY = (vertical) ? localX : localY;
							el.addEventListener('touchmove', onTouchMove, false);
							el.addEventListener('touchend', onTouchEnd, false);
						}
					};

					onTouchMove = function (e) {
						// Local vars for X and Y points.

						localX = e.touches[0].pageX;
						localY = e.touches[0].pageY;

						dx = (vertical) ? startX - localY : (slider.vars.rtl ? -1 : 1) * (startX - localX);
						scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));
						var fxms = 500;

						if (!scrolling || Number(new Date()) - startT > fxms) {
							e.preventDefault();
							if (!fade && slider.transitions) {
								if (!slider.vars.animationLoop) {
									dx = dx / ((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1);
								}
								slider.setProps(offset + dx, "setTouch");
							}
						}
					};

					onTouchEnd = function (e) {
						// finish the touch by undoing the touch session
						el.removeEventListener('touchmove', onTouchMove, false);

						if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
							var updateDx = (reverse) ? -dx : dx,
								target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

							if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
								slider.flexAnimate(target, slider.vars.pauseOnAction);
							} else {
								if (!fade) { slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true); }
							}
						}
						el.removeEventListener('touchend', onTouchEnd, false);

						startX = null;
						startY = null;
						dx = null;
						offset = null;
					};

					el.addEventListener('touchstart', onTouchStart, false);
				} else {
					el.style.msTouchAction = "none";
					el._gesture = new MSGesture();
					el._gesture.target = el;
					el.addEventListener("MSPointerDown", onMSPointerDown, false);
					el._slider = slider;
					el.addEventListener("MSGestureChange", onMSGestureChange, false);
					el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

					function onMSPointerDown(e) {
						e.stopPropagation();
						if (slider.animating) {
							e.preventDefault();
						} else {
							slider.pause();
							el._gesture.addPointer(e.pointerId);
							accDx = 0;
							cwidth = (vertical) ? slider.h : slider.w;
							startT = Number(new Date());
							// CAROUSEL:

							offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
								(carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
									(carousel && slider.currentSlide === slider.last) ? slider.limit :
										(carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
											(reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
						}
					}

					function onMSGestureChange(e) {
						e.stopPropagation();
						var slider = e.target._slider;
						if (!slider) {
							return;
						}

						var transX = -e.translationX,
							transY = -e.translationY;

						//Accumulate translations.
						accDx = accDx + ((vertical) ? transY : transX);
						dx = (slider.vars.rtl ? -1 : 1) * accDx;
						scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

						if (e.detail === e.MSGESTURE_FLAG_INERTIA) {
							setImmediate(function () {
								el._gesture.stop();
							});

							return;
						}

						if (!scrolling || Number(new Date()) - startT > 500) {
							e.preventDefault();
							if (!fade && slider.transitions) {
								if (!slider.vars.animationLoop) {
									dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
								}
								slider.setProps(offset + dx, "setTouch");
							}
						}
					}

					function onMSGestureEnd(e) {
						e.stopPropagation();
						var slider = e.target._slider;
						if (!slider) {
							return;
						}
						if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
							var updateDx = (reverse) ? -dx : dx,
								target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

							if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
								slider.flexAnimate(target, slider.vars.pauseOnAction);
							} else {
								if (!fade) { slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true); }
							}
						}

						startX = null;
						startY = null;
						dx = null;
						offset = null;
						accDx = 0;
					}
				}
			},
			resize: function () {
				if (!slider.animating && slider.is(':visible')) {
					if (!carousel) { slider.doMath(); }

					if (fade) {
						// SMOOTH HEIGHT:
						methods.smoothHeight();
					} else if (carousel) { //CAROUSEL:
						slider.slides.width(slider.computedW);
						slider.update(slider.pagingCount);
						slider.setProps();
					}
					else if (vertical) { //VERTICAL:
						slider.viewport.height(slider.h);
						slider.setProps(slider.h, "setTotal");
					} else {
						// SMOOTH HEIGHT:
						if (slider.vars.smoothHeight) { methods.smoothHeight(); }
						slider.newSlides.width(slider.computedW);
						slider.setProps(slider.computedW, "setTotal");
					}
				}
			},
			smoothHeight: function (dur) {
				if (!vertical || fade) {
					var $obj = (fade) ? slider : slider.viewport;
					(dur) ? $obj.animate({ "height": slider.slides.eq(slider.animatingTo).innerHeight() }, dur) : $obj.innerHeight(slider.slides.eq(slider.animatingTo).innerHeight());
				}
			},
			sync: function (action) {
				var $obj = $(slider.vars.sync).data("flexslider"),
					target = slider.animatingTo;

				switch (action) {
					case "animate": $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true); break;
					case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
					case "pause": $obj.pause(); break;
				}
			},
			uniqueID: function ($clone) {
				// Append _clone to current level and children elements with id attributes
				$clone.filter('[id]').add($clone.find('[id]')).each(function () {
					var $this = $(this);
					$this.attr('id', $this.attr('id') + '_clone');
				});
				return $clone;
			},
			pauseInvisible: {
				visProp: null,
				init: function () {
					var visProp = methods.pauseInvisible.getHiddenProp();
					if (visProp) {
						var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
						document.addEventListener(evtname, function () {
							if (methods.pauseInvisible.isHidden()) {
								if (slider.startTimeout) {
									clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
								} else {
									slider.pause(); //Or just pause
								}
							}
							else {
								if (slider.started) {
									slider.play(); //Initiated before, just play
								} else {
									if (slider.vars.initDelay > 0) {
										setTimeout(slider.play, slider.vars.initDelay);
									} else {
										slider.play(); //Didn't init before: simply init or wait for it
									}
								}
							}
						});
					}
				},
				isHidden: function () {
					var prop = methods.pauseInvisible.getHiddenProp();
					if (!prop) {
						return false;
					}
					return document[prop];
				},
				getHiddenProp: function () {
					var prefixes = ['webkit', 'moz', 'ms', 'o'];
					// if 'hidden' is natively supported just return it
					if ('hidden' in document) {
						return 'hidden';
					}
					// otherwise loop over all the known prefixes until we find one
					for (var i = 0; i < prefixes.length; i++) {
						if ((prefixes[i] + 'Hidden') in document) {
							return prefixes[i] + 'Hidden';
						}
					}
					// otherwise it's not supported
					return null;
				}
			},
			setToClearWatchedEvent: function () {
				clearTimeout(watchedEventClearTimer);
				watchedEventClearTimer = setTimeout(function () {
					watchedEvent = "";
				}, 3000);
			}
		};

		// public methods
		slider.flexAnimate = function (target, pause, override, withSync, fromNav) {
			if (!slider.vars.animationLoop && target !== slider.currentSlide) {
				slider.direction = (target > slider.currentSlide) ? "next" : "prev";
			}

			if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

			if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
				if (asNav && withSync) {
					var master = $(slider.vars.asNavFor).data('flexslider');
					slider.atEnd = target === 0 || target === slider.count - 1;
					master.flexAnimate(target, true, false, true, fromNav);
					slider.direction = (slider.currentItem < target) ? "next" : "prev";
					master.direction = slider.direction;

					if (Math.ceil((target + 1) / slider.visible) - 1 !== slider.currentSlide && target !== 0) {
						slider.currentItem = target;
						slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
						target = Math.floor(target / slider.visible);
					} else {
						slider.currentItem = target;
						slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
						return false;
					}
				}

				slider.animating = true;
				slider.animatingTo = target;

				// SLIDESHOW:
				if (pause) { slider.pause(); }

				// API: before() animation Callback
				slider.vars.before(slider);

				// SYNC:
				if (slider.syncExists && !fromNav) { methods.sync("animate"); }

				// CONTROLNAV
				if (slider.vars.controlNav) { methods.controlNav.active(); }

				// !CAROUSEL:
				// CANDIDATE: slide active class (for add/remove slide)
				if (!carousel) { slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide'); }

				// INFINITE LOOP:
				// CANDIDATE: atEnd
				slider.atEnd = target === 0 || target === slider.last;

				// DIRECTIONNAV:
				if (slider.vars.directionNav) { methods.directionNav.update(); }

				if (target === slider.last) {
					// API: end() of cycle Callback
					slider.vars.end(slider);
					// SLIDESHOW && !INFINITE LOOP:
					if (!slider.vars.animationLoop) { slider.pause(); }
				}

				// SLIDE:
				if (!fade) {
					var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
						margin, slideString, calcNext;

					// INFINITE LOOP / REVERSE:
					if (carousel) {
						margin = slider.vars.itemMargin;
						calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
						slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
					} else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
						slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
					} else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
						slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
					} else {
						slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
					}
					slider.setProps(slideString, "", slider.vars.animationSpeed);
					if (slider.transitions) {
						if (!slider.vars.animationLoop || !slider.atEnd) {
							slider.animating = false;
							slider.currentSlide = slider.animatingTo;
						}

						// Unbind previous transitionEnd events and re-bind new transitionEnd event
						slider.container.unbind("webkitTransitionEnd transitionend");
						slider.container.bind("webkitTransitionEnd transitionend", function () {
							clearTimeout(slider.ensureAnimationEnd);
							slider.wrapup(dimension);
						});

						// Insurance for the ever-so-fickle transitionEnd event
						clearTimeout(slider.ensureAnimationEnd);
						slider.ensureAnimationEnd = setTimeout(function () {
							slider.wrapup(dimension);
						}, slider.vars.animationSpeed + 100);

					} else {
						slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function () {
							slider.wrapup(dimension);
						});
					}
				} else { // FADE:
					if (!touch) {
						slider.slides.eq(slider.currentSlide).css({ "zIndex": 1 }).animate({ "opacity": 0 }, slider.vars.animationSpeed, slider.vars.easing);
						slider.slides.eq(target).css({ "zIndex": 2 }).animate({ "opacity": 1 }, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);
					} else {
						slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
						slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });
						slider.wrapup(dimension);
					}
				}
				// SMOOTH HEIGHT:
				if (slider.vars.smoothHeight) { methods.smoothHeight(slider.vars.animationSpeed); }
			}
		};
		slider.wrapup = function (dimension) {
			// SLIDE:
			if (!fade && !carousel) {
				if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
					slider.setProps(dimension, "jumpEnd");
				} else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
					slider.setProps(dimension, "jumpStart");
				}
			}
			slider.animating = false;
			slider.currentSlide = slider.animatingTo;
			// API: after() animation Callback
			slider.vars.after(slider);
		};

		// SLIDESHOW:
		slider.animateSlides = function () {
			if (!slider.animating && focused) { slider.flexAnimate(slider.getTarget("next")); }
		};
		// SLIDESHOW:
		slider.pause = function () {
			clearInterval(slider.animatedSlides);
			slider.animatedSlides = null;
			slider.playing = false;
			// PAUSEPLAY:
			if (slider.vars.pausePlay) { methods.pausePlay.update("play"); }
			// SYNC:
			if (slider.syncExists) { methods.sync("pause"); }
		};
		// SLIDESHOW:
		slider.play = function () {
			if (slider.playing) { clearInterval(slider.animatedSlides); }
			slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
			slider.started = slider.playing = true;
			// PAUSEPLAY:
			if (slider.vars.pausePlay) { methods.pausePlay.update("pause"); }
			// SYNC:
			if (slider.syncExists) { methods.sync("play"); }
		};
		// STOP:
		slider.stop = function () {
			slider.pause();
			slider.stopped = true;
		};
		slider.canAdvance = function (target, fromNav) {
			// ASNAV:
			var last = (asNav) ? slider.pagingCount - 1 : slider.last;
			return (fromNav) ? true :
				(asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
					(asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
						(target === slider.currentSlide && !asNav) ? false :
							(slider.vars.animationLoop) ? true :
								(slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
									(slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
										true;
		};
		slider.getTarget = function (dir) {
			slider.direction = dir;
			if (dir === "next") {
				return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
			} else {
				return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
			}
		};

		// SLIDE:
		slider.setProps = function (pos, special, dur) {
			var target = (function () {
				var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
					posCalc = (function () {
						if (carousel) {
							return (special === "setTouch") ? pos :
								(reverse && slider.animatingTo === slider.last) ? 0 :
									(reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
										(slider.animatingTo === slider.last) ? slider.limit : posCheck;
						} else {
							switch (special) {
								case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
								case "setTouch": return (reverse) ? pos : pos;
								case "jumpEnd": return (reverse) ? pos : slider.count * pos;
								case "jumpStart": return (reverse) ? slider.count * pos : pos;
								default: return pos;
							}
						}
					}());

				return (posCalc * ((slider.vars.rtl) ? 1 : -1)) + "px";
			}());

			if (slider.transitions) {
				if (slider.isFirefox) {
					target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + (parseInt(target) + 'px') + ",0,0)";
				} else {
					target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + ((slider.vars.rtl ? -1 : 1) * parseInt(target) + 'px') + ",0,0)";
				}
				dur = (dur !== undefined) ? (dur / 1000) + "s" : "0s";
				slider.container.css("-" + slider.pfx + "-transition-duration", dur);
				slider.container.css("transition-duration", dur);
			}

			slider.args[slider.prop] = target;
			if (slider.transitions || dur === undefined) { slider.container.css(slider.args); }

			slider.container.css('transform', target);
		};

		slider.setup = function (type) {
			// SLIDE:
			if (!fade) {
				var sliderOffset, arr;

				if (type === "init") {
					slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({ "overflow": "hidden", "position": "relative" }).appendTo(slider).append(slider.container);
					// INFINITE LOOP:
					slider.cloneCount = 0;
					slider.cloneOffset = 0;
					// REVERSE:
					if (reverse) {
						arr = $.makeArray(slider.slides).reverse();
						slider.slides = $(arr);
						slider.container.empty().append(slider.slides);
					}
				}
				// INFINITE LOOP && !CAROUSEL:
				if (slider.vars.animationLoop && !carousel) {
					slider.cloneCount = 2;
					slider.cloneOffset = 1;
					// clear out old clones
					if (type !== "init") { slider.container.find('.clone').remove(); }
					slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true'))
						.prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
				}
				slider.newSlides = $(slider.vars.selector, slider);

				sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
				// VERTICAL:
				if (vertical && !carousel) {
					slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
					setTimeout(function () {
						slider.newSlides.css({ "display": "block" });
						slider.doMath();
						slider.viewport.height(slider.h);
						slider.setProps(sliderOffset * slider.h, "init");
					}, (type === "init") ? 100 : 0);
				} else {
					slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
					slider.setProps(sliderOffset * slider.computedW, "init");
					setTimeout(function () {
						slider.doMath();
						if (slider.vars.rtl) {
							if (slider.isFirefox) {
								slider.newSlides.css({ "width": slider.computedW, "marginRight": slider.computedM, "float": "right", "display": "block" });
							} else {
								slider.newSlides.css({ "width": slider.computedW, "marginRight": slider.computedM, "float": "left", "display": "block" });
							}

						}
						else {
							slider.newSlides.css({ "width": slider.computedW, "marginRight": slider.computedM, "float": "left", "display": "block" });
						}
						// SMOOTH HEIGHT:
						if (slider.vars.smoothHeight) { methods.smoothHeight(); }
					}, (type === "init") ? 100 : 0);
				}
			} else { // FADE:
				if (slider.vars.rtl) {
					slider.slides.css({ "width": "100%", "float": 'right', "marginLeft": "-100%", "position": "relative" });
				}
				else {
					slider.slides.css({ "width": "100%", "float": 'left', "marginRight": "-100%", "position": "relative" });
				}
				if (type === "init") {
					if (!touch) {
						//slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
						if (slider.vars.fadeFirstSlide == false) {
							slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({ "zIndex": 2 }).css({ "opacity": 1 });
						} else {
							slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({ "zIndex": 2 }).animate({ "opacity": 1 }, slider.vars.animationSpeed, slider.vars.easing);
						}
					} else {
						slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2 });
					}
				}
				// SMOOTH HEIGHT:
				if (slider.vars.smoothHeight) { methods.smoothHeight(); }
			}
			// !CAROUSEL:
			// CANDIDATE: active slide
			if (!carousel) { slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide"); }

			//FlexSlider: init() Callback
			slider.vars.init(slider);
		};

		slider.doMath = function () {
			var slide = slider.slides.first(),
				slideMargin = slider.vars.itemMargin,
				minItems = slider.vars.minItems,
				maxItems = slider.vars.maxItems;

			slider.w = (slider.viewport === undefined) ? slider.width() : slider.viewport.width();
			if (slider.isFirefox) { slider.w = slider.width(); }
			slider.h = slide.height();
			slider.boxPadding = slide.outerWidth() - slide.width();

			// CAROUSEL:
			if (carousel) {
				slider.itemT = slider.vars.itemWidth + slideMargin;
				slider.itemM = slideMargin;
				slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
				slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
				slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1))) / minItems :
					(slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1))) / maxItems :
						(slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

				slider.visible = Math.floor(slider.w / (slider.itemW));
				slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible) ? slider.vars.move : slider.visible;
				slider.pagingCount = Math.ceil(((slider.count - slider.visible) / slider.move) + 1);
				slider.last = slider.pagingCount - 1;
				slider.limit = (slider.pagingCount === 1) ? 0 :
					(slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
			} else {
				slider.itemW = slider.w;
				slider.itemM = slideMargin;
				slider.pagingCount = slider.count;
				slider.last = slider.count - 1;
			}
			slider.computedW = slider.itemW - slider.boxPadding;
			slider.computedM = slider.itemM;
		};

		slider.update = function (pos, action) {
			slider.doMath();

			// update currentSlide and slider.animatingTo if necessary
			if (!carousel) {
				if (pos < slider.currentSlide) {
					slider.currentSlide += 1;
				} else if (pos <= slider.currentSlide && pos !== 0) {
					slider.currentSlide -= 1;
				}
				slider.animatingTo = slider.currentSlide;
			}

			// update controlNav
			if (slider.vars.controlNav && !slider.manualControls) {
				if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
					methods.controlNav.update("add");
				} else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
					if (carousel && slider.currentSlide > slider.last) {
						slider.currentSlide -= 1;
						slider.animatingTo -= 1;
					}
					methods.controlNav.update("remove", slider.last);
				}
			}
			// update directionNav
			if (slider.vars.directionNav) { methods.directionNav.update(); }

		};

		slider.addSlide = function (obj, pos) {
			var $obj = $(obj);

			slider.count += 1;
			slider.last = slider.count - 1;

			// append new slide
			if (vertical && reverse) {
				(pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
			} else {
				(pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
			}

			// update currentSlide, animatingTo, controlNav, and directionNav
			slider.update(pos, "add");

			// update slider.slides
			slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
			// re-setup the slider to accomdate new slide
			slider.setup();

			//FlexSlider: added() Callback
			slider.vars.added(slider);
		};
		slider.removeSlide = function (obj) {
			var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

			// update count
			slider.count -= 1;
			slider.last = slider.count - 1;

			// remove slide
			if (isNaN(obj)) {
				$(obj, slider.slides).remove();
			} else {
				(vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
			}

			// update currentSlide, animatingTo, controlNav, and directionNav
			slider.doMath();
			slider.update(pos, "remove");

			// update slider.slides
			slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
			// re-setup the slider to accomdate new slide
			slider.setup();

			// FlexSlider: removed() Callback
			slider.vars.removed(slider);
		};

		//FlexSlider: Initialize
		methods.init();
	};

	// Ensure the slider isn't focussed if the window loses focus.
	$(window).blur(function (e) {
		focused = false;
	}).focus(function (e) {
		focused = true;
	});

	//FlexSlider: Default Settings
	$.flexslider.defaults = {
		namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
		selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
		animation: "fade",              //String: Select your animation type, "fade" or "slide"
		easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
		direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
		reverse: false,                 //{NEW} Boolean: Reverse the animation direction
		animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
		smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
		startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
		slideshow: true,                //Boolean: Animate slider automatically
		slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
		animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
		initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
		randomize: false,               //Boolean: Randomize slide order
		fadeFirstSlide: true,           //Boolean: Fade in the first slide when animation type is "fade"
		thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

		// Usability features
		pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
		pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
		pauseInvisible: true,       //{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
		useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
		touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
		video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

		// Primary Controls
		controlNav: true,               //Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
		directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
		prevText: "Previous",           //String: Set the text for the "previous" directionNav item
		nextText: "Next",               //String: Set the text for the "next" directionNav item

		// Secondary Navigation
		keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
		multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
		mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
		pausePlay: false,               //Boolean: Create pause/play dynamic element
		pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
		playText: "Play",               //String: Set the text for the "play" pausePlay item

		// Special properties
		controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
		manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
		customDirectionNav: "",         //{NEW} jQuery Object/Selector: Custom prev / next button. Must be two jQuery elements. In order to make the events work they have to have the classes "prev" and "next" (plus namespace)
		sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
		asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

		// Carousel Options
		itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
		itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
		minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
		maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
		move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
		allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

		// Browser Specific
		isFirefox: false,             // {NEW} Boolean: Set to true when Firefox is the browser used.

		// Callback API
		start: function () { },            //Callback: function(slider) - Fires when the slider loads the first slide
		before: function () { },           //Callback: function(slider) - Fires asynchronously with each slider animation
		after: function () { },            //Callback: function(slider) - Fires after each slider animation completes
		end: function () { },              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
		added: function () { },            //{NEW} Callback: function(slider) - Fires after a slide is added
		removed: function () { },           //{NEW} Callback: function(slider) - Fires after a slide is removed
		init: function () { },             //{NEW} Callback: function(slider) - Fires after the slider is initially setup
		rtl: false             //{NEW} Boolean: Whether or not to enable RTL mode
	};

	//FlexSlider: Plugin Function
	$.fn.flexslider = function (options) {
		if (options === undefined) { options = {}; }

		if (typeof options === "object") {
			return this.each(function () {
				var $this = $(this),
					selector = (options.selector) ? options.selector : ".slides > li",
					$slides = $this.find(selector);

				if (($slides.length === 1 && options.allowOneSlide === false) || $slides.length === 0) {
					$slides.fadeIn(400);
					if (options.start) { options.start($this); }
				} else if ($this.data('flexslider') === undefined) {
					new $.flexslider(this, options);
				}
			});
		} else {
			// Helper strings to quickly perform functions on the slider
			var $slider = $(this).data('flexslider');
			switch (options) {
				case "play": $slider.play(); break;
				case "pause": $slider.pause(); break;
				case "stop": $slider.stop(); break;
				case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
				case "prev":
				case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
				default: if (typeof options === "number") { $slider.flexAnimate(options, true); }
			}
		}
	};
})(jQuery);














/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports !== 'undefined') {
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}

}(function ($) {
	'use strict';
	var Slick = window.Slick || {};

	Slick = (function () {

		var instanceUid = 0;

		function Slick(element, settings) {

			var _ = this, dataSettings;

			_.defaults = {
				accessibility: true,
				adaptiveHeight: false,
				appendArrows: $(element),
				appendDots: $(element),
				arrows: true,
				asNavFor: null,
				prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
				nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
				autoplay: false,
				autoplaySpeed: 3000,
				centerMode: false,
				centerPadding: '50px',
				cssEase: 'ease',
				customPaging: function (slider, i) {
					return $('<button type="button" data-role="none" role="button" tabindex="0" />').text(i + 1);
				},
				dots: false,
				dotsClass: 'slick-dots',
				draggable: true,
				easing: 'linear',
				edgeFriction: 0.35,
				fade: false,
				focusOnSelect: false,
				infinite: true,
				initialSlide: 0,
				lazyLoad: 'ondemand',
				mobileFirst: false,
				pauseOnHover: true,
				pauseOnFocus: true,
				pauseOnDotsHover: false,
				respondTo: 'window',
				responsive: null,
				rows: 1,
				rtl: false,
				slide: '',
				slidesPerRow: 1,
				slidesToShow: 1,
				slidesToScroll: 1,
				speed: 500,
				swipe: true,
				swipeToSlide: false,
				touchMove: true,
				touchThreshold: 5,
				useCSS: true,
				useTransform: true,
				variableWidth: false,
				vertical: false,
				verticalSwiping: false,
				waitForAnimate: true,
				zIndex: 1000
			};

			_.initials = {
				animating: false,
				dragging: false,
				autoPlayTimer: null,
				currentDirection: 0,
				currentLeft: null,
				currentSlide: 0,
				direction: 1,
				$dots: null,
				listWidth: null,
				listHeight: null,
				loadIndex: 0,
				$nextArrow: null,
				$prevArrow: null,
				slideCount: null,
				slideWidth: null,
				$slideTrack: null,
				$slides: null,
				sliding: false,
				slideOffset: 0,
				swipeLeft: null,
				$list: null,
				touchObject: {},
				transformsEnabled: false,
				unslicked: false
			};

			$.extend(_, _.initials);

			_.activeBreakpoint = null;
			_.animType = null;
			_.animProp = null;
			_.breakpoints = [];
			_.breakpointSettings = [];
			_.cssTransitions = false;
			_.focussed = false;
			_.interrupted = false;
			_.hidden = 'hidden';
			_.paused = true;
			_.positionProp = null;
			_.respondTo = null;
			_.rowCount = 1;
			_.shouldClick = true;
			_.$slider = $(element);
			_.$slidesCache = null;
			_.transformType = null;
			_.transitionType = null;
			_.visibilityChange = 'visibilitychange';
			_.windowWidth = 0;
			_.windowTimer = null;

			dataSettings = $(element).data('slick') || {};

			_.options = $.extend({}, _.defaults, settings, dataSettings);

			_.currentSlide = _.options.initialSlide;

			_.originalSettings = _.options;

			if (typeof document.mozHidden !== 'undefined') {
				_.hidden = 'mozHidden';
				_.visibilityChange = 'mozvisibilitychange';
			} else if (typeof document.webkitHidden !== 'undefined') {
				_.hidden = 'webkitHidden';
				_.visibilityChange = 'webkitvisibilitychange';
			}

			_.autoPlay = $.proxy(_.autoPlay, _);
			_.autoPlayClear = $.proxy(_.autoPlayClear, _);
			_.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
			_.changeSlide = $.proxy(_.changeSlide, _);
			_.clickHandler = $.proxy(_.clickHandler, _);
			_.selectHandler = $.proxy(_.selectHandler, _);
			_.setPosition = $.proxy(_.setPosition, _);
			_.swipeHandler = $.proxy(_.swipeHandler, _);
			_.dragHandler = $.proxy(_.dragHandler, _);
			_.keyHandler = $.proxy(_.keyHandler, _);

			_.instanceUid = instanceUid++;

			// A simple way to check for HTML strings
			// Strict HTML recognition (must start with <)
			// Extracted from jQuery v1.11 source
			_.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


			_.registerBreakpoints();
			_.init(true);

		}

		return Slick;

	}());

	Slick.prototype.activateADA = function () {
		var _ = this;

		_.$slideTrack.find('.slick-active').attr({
			'aria-hidden': 'false'
		}).find('a, input, button, select').attr({
			'tabindex': '0'
		});

	};

	Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

		var _ = this;

		if (typeof (index) === 'boolean') {
			addBefore = index;
			index = null;
		} else if (index < 0 || (index >= _.slideCount)) {
			return false;
		}

		_.unload();

		if (typeof (index) === 'number') {
			if (index === 0 && _.$slides.length === 0) {
				$(markup).appendTo(_.$slideTrack);
			} else if (addBefore) {
				$(markup).insertBefore(_.$slides.eq(index));
			} else {
				$(markup).insertAfter(_.$slides.eq(index));
			}
		} else {
			if (addBefore === true) {
				$(markup).prependTo(_.$slideTrack);
			} else {
				$(markup).appendTo(_.$slideTrack);
			}
		}

		_.$slides = _.$slideTrack.children(this.options.slide);

		_.$slideTrack.children(this.options.slide).detach();

		_.$slideTrack.append(_.$slides);

		_.$slides.each(function (index, element) {
			$(element).attr('data-slick-index', index);
		});

		_.$slidesCache = _.$slides;

		_.reinit();

	};

	Slick.prototype.animateHeight = function () {
		var _ = this;
		if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
			var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
			_.$list.animate({
				height: targetHeight
			}, _.options.speed);
		}
	};

	Slick.prototype.animateSlide = function (targetLeft, callback) {

		var animProps = {},
			_ = this;

		_.animateHeight();

		if (_.options.rtl === true && _.options.vertical === false) {
			targetLeft = -targetLeft;
		}
		if (_.transformsEnabled === false) {
			if (_.options.vertical === false) {
				_.$slideTrack.animate({
					left: targetLeft
				}, _.options.speed, _.options.easing, callback);
			} else {
				_.$slideTrack.animate({
					top: targetLeft
				}, _.options.speed, _.options.easing, callback);
			}

		} else {

			if (_.cssTransitions === false) {
				if (_.options.rtl === true) {
					_.currentLeft = -(_.currentLeft);
				}
				$({
					animStart: _.currentLeft
				}).animate({
					animStart: targetLeft
				}, {
						duration: _.options.speed,
						easing: _.options.easing,
						step: function (now) {
							now = Math.ceil(now);
							if (_.options.vertical === false) {
								animProps[_.animType] = 'translate(' +
									now + 'px, 0px)';
								_.$slideTrack.css(animProps);
							} else {
								animProps[_.animType] = 'translate(0px,' +
									now + 'px)';
								_.$slideTrack.css(animProps);
							}
						},
						complete: function () {
							if (callback) {
								callback.call();
							}
						}
					});

			} else {

				_.applyTransition();
				targetLeft = Math.ceil(targetLeft);

				if (_.options.vertical === false) {
					animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
				} else {
					animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
				}
				_.$slideTrack.css(animProps);

				if (callback) {
					setTimeout(function () {

						_.disableTransition();

						callback.call();
					}, _.options.speed);
				}

			}

		}

	};

	Slick.prototype.getNavTarget = function () {

		var _ = this,
			asNavFor = _.options.asNavFor;

		if (asNavFor && asNavFor !== null) {
			asNavFor = $(asNavFor).not(_.$slider);
		}

		return asNavFor;

	};

	Slick.prototype.asNavFor = function (index) {

		var _ = this,
			asNavFor = _.getNavTarget();

		if (asNavFor !== null && typeof asNavFor === 'object') {
			asNavFor.each(function () {
				var target = $(this).slick('getSlick');
				if (!target.unslicked) {
					target.slideHandler(index, true);
				}
			});
		}

	};

	Slick.prototype.applyTransition = function (slide) {

		var _ = this,
			transition = {};

		if (_.options.fade === false) {
			transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
		} else {
			transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
		}

		if (_.options.fade === false) {
			_.$slideTrack.css(transition);
		} else {
			_.$slides.eq(slide).css(transition);
		}

	};

	Slick.prototype.autoPlay = function () {


		var _ = this;

		_.autoPlayClear();

		if (_.slideCount > _.options.slidesToShow) {
			_.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
		}

	};

	Slick.prototype.autoPlayClear = function () {

		var _ = this;

		if (_.autoPlayTimer) {
			clearInterval(_.autoPlayTimer);
		}

	};

	Slick.prototype.autoPlayIterator = function () {

		var _ = this,
			slideTo = _.currentSlide + _.options.slidesToScroll;

		if (!_.paused && !_.interrupted && !_.focussed) {

			if (_.options.infinite === false) {

				if (_.direction === 1 && (_.currentSlide + 1) === (_.slideCount - 1)) {
					_.direction = 0;
				}

				else if (_.direction === 0) {

					slideTo = _.currentSlide - _.options.slidesToScroll;

					if (_.currentSlide - 1 === 0) {
						_.direction = 1;
					}

				}

			}

			_.slideHandler(slideTo);

		}

	};

	Slick.prototype.buildArrows = function () {

		var _ = this;

		if (_.options.arrows === true) {

			_.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
			_.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

			if (_.slideCount > _.options.slidesToShow) {

				_.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
				_.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

				if (_.htmlExpr.test(_.options.prevArrow)) {
					_.$prevArrow.prependTo(_.options.appendArrows);
				}

				if (_.htmlExpr.test(_.options.nextArrow)) {
					_.$nextArrow.appendTo(_.options.appendArrows);
				}

				if (_.options.infinite !== true) {
					_.$prevArrow
						.addClass('slick-disabled')
						.attr('aria-disabled', 'true');
				}

			} else {

				_.$prevArrow.add(_.$nextArrow)

					.addClass('slick-hidden')
					.attr({
						'aria-disabled': 'true',
						'tabindex': '-1'
					});

			}

		}

	};

	Slick.prototype.buildDots = function () {

		var _ = this,
			i, dot;

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			_.$slider.addClass('slick-dotted');

			dot = $('<ul />').addClass(_.options.dotsClass);

			for (i = 0; i <= _.getDotCount(); i += 1) {
				dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
			}

			_.$dots = dot.appendTo(_.options.appendDots);

			_.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

		}

	};

	Slick.prototype.buildOut = function () {

		var _ = this;

		_.$slides =
			_.$slider
				.children(_.options.slide + ':not(.slick-cloned)')
				.addClass('slick-slide');

		_.slideCount = _.$slides.length;

		_.$slides.each(function (index, element) {
			$(element)
				.attr('data-slick-index', index)
				.data('originalStyling', $(element).attr('style') || '');
		});

		_.$slider.addClass('slick-slider');

		_.$slideTrack = (_.slideCount === 0) ?
			$('<div class="slick-track"/>').appendTo(_.$slider) :
			_.$slides.wrapAll('<div class="slick-track"/>').parent();

		_.$list = _.$slideTrack.wrap(
			'<div aria-live="polite" class="slick-list"/>').parent();
		_.$slideTrack.css('opacity', 0);

		if (_.options.centerMode === true || _.options.swipeToSlide === true) {
			_.options.slidesToScroll = 1;
		}

		$('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

		_.setupInfinite();

		_.buildArrows();

		_.buildDots();

		_.updateDots();


		_.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

		if (_.options.draggable === true) {
			_.$list.addClass('draggable');
		}

	};

	Slick.prototype.buildRows = function () {

		var _ = this, a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;

		newSlides = document.createDocumentFragment();
		originalSlides = _.$slider.children();

		if (_.options.rows > 1) {

			slidesPerSection = _.options.slidesPerRow * _.options.rows;
			numOfSlides = Math.ceil(
				originalSlides.length / slidesPerSection
			);

			for (a = 0; a < numOfSlides; a++) {
				var slide = document.createElement('div');
				for (b = 0; b < _.options.rows; b++) {
					var row = document.createElement('div');
					for (c = 0; c < _.options.slidesPerRow; c++) {
						var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
						if (originalSlides.get(target)) {
							row.appendChild(originalSlides.get(target));
						}
					}
					slide.appendChild(row);
				}
				newSlides.appendChild(slide);
			}

			_.$slider.empty().append(newSlides);
			_.$slider.children().children().children()
				.css({
					'width': (100 / _.options.slidesPerRow) + '%',
					'display': 'inline-block'
				});

		}

	};

	Slick.prototype.checkResponsive = function (initial, forceUpdate) {

		var _ = this,
			breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
		var sliderWidth = _.$slider.width();
		var windowWidth = window.innerWidth || $(window).width();

		if (_.respondTo === 'window') {
			respondToWidth = windowWidth;
		} else if (_.respondTo === 'slider') {
			respondToWidth = sliderWidth;
		} else if (_.respondTo === 'min') {
			respondToWidth = Math.min(windowWidth, sliderWidth);
		}

		if (_.options.responsive &&
			_.options.responsive.length &&
			_.options.responsive !== null) {

			targetBreakpoint = null;

			for (breakpoint in _.breakpoints) {
				if (_.breakpoints.hasOwnProperty(breakpoint)) {
					if (_.originalSettings.mobileFirst === false) {
						if (respondToWidth < _.breakpoints[breakpoint]) {
							targetBreakpoint = _.breakpoints[breakpoint];
						}
					} else {
						if (respondToWidth > _.breakpoints[breakpoint]) {
							targetBreakpoint = _.breakpoints[breakpoint];
						}
					}
				}
			}

			if (targetBreakpoint !== null) {
				if (_.activeBreakpoint !== null) {
					if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
						_.activeBreakpoint =
							targetBreakpoint;
						if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
							_.unslick(targetBreakpoint);
						} else {
							_.options = $.extend({}, _.originalSettings,
								_.breakpointSettings[
								targetBreakpoint]);
							if (initial === true) {
								_.currentSlide = _.options.initialSlide;
							}
							_.refresh(initial);
						}
						triggerBreakpoint = targetBreakpoint;
					}
				} else {
					_.activeBreakpoint = targetBreakpoint;
					if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
						_.unslick(targetBreakpoint);
					} else {
						_.options = $.extend({}, _.originalSettings,
							_.breakpointSettings[
							targetBreakpoint]);
						if (initial === true) {
							_.currentSlide = _.options.initialSlide;
						}
						_.refresh(initial);
					}
					triggerBreakpoint = targetBreakpoint;
				}
			} else {
				if (_.activeBreakpoint !== null) {
					_.activeBreakpoint = null;
					_.options = _.originalSettings;
					if (initial === true) {
						_.currentSlide = _.options.initialSlide;
					}
					_.refresh(initial);
					triggerBreakpoint = targetBreakpoint;
				}
			}

			// only trigger breakpoints during an actual break. not on initialize.
			if (!initial && triggerBreakpoint !== false) {
				_.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
			}
		}

	};

	Slick.prototype.changeSlide = function (event, dontAnimate) {

		var _ = this,
			$target = $(event.currentTarget),
			indexOffset, slideOffset, unevenOffset;

		// If target is a link, prevent default action.
		if ($target.is('a')) {
			event.preventDefault();
		}

		// If target is not the <li> element (ie: a child), find the <li>.
		if (!$target.is('li')) {
			$target = $target.closest('li');
		}

		unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
		indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

		switch (event.data.message) {

			case 'previous':
				slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
				if (_.slideCount > _.options.slidesToShow) {
					_.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
				}
				break;

			case 'next':
				slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
				if (_.slideCount > _.options.slidesToShow) {
					_.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
				}
				break;

			case 'index':
				var index = event.data.index === 0 ? 0 :
					event.data.index || $target.index() * _.options.slidesToScroll;

				_.slideHandler(_.checkNavigable(index), false, dontAnimate);
				$target.children().trigger('focus');
				break;

			default:
				return;
		}

	};

	Slick.prototype.checkNavigable = function (index) {

		var _ = this,
			navigables, prevNavigable;

		navigables = _.getNavigableIndexes();
		prevNavigable = 0;
		if (index > navigables[navigables.length - 1]) {
			index = navigables[navigables.length - 1];
		} else {
			for (var n in navigables) {
				if (index < navigables[n]) {
					index = prevNavigable;
					break;
				}
				prevNavigable = navigables[n];
			}
		}

		return index;
	};

	Slick.prototype.cleanUpEvents = function () {

		var _ = this;

		if (_.options.dots && _.$dots !== null) {

			$('li', _.$dots)
				.off('click.slick', _.changeSlide)
				.off('mouseenter.slick', $.proxy(_.interrupt, _, true))
				.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

		}

		_.$slider.off('focus.slick blur.slick');

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
			_.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
			_.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
		}

		_.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
		_.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
		_.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
		_.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

		_.$list.off('click.slick', _.clickHandler);

		$(document).off(_.visibilityChange, _.visibility);

		_.cleanUpSlideEvents();

		if (_.options.accessibility === true) {
			_.$list.off('keydown.slick', _.keyHandler);
		}

		if (_.options.focusOnSelect === true) {
			$(_.$slideTrack).children().off('click.slick', _.selectHandler);
		}

		$(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

		$(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

		$('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

		$(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
		$(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);

	};

	Slick.prototype.cleanUpSlideEvents = function () {

		var _ = this;

		_.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
		_.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

	};

	Slick.prototype.cleanUpRows = function () {

		var _ = this, originalSlides;

		if (_.options.rows > 1) {
			originalSlides = _.$slides.children().children();
			originalSlides.removeAttr('style');
			_.$slider.empty().append(originalSlides);
		}

	};

	Slick.prototype.clickHandler = function (event) {

		var _ = this;

		if (_.shouldClick === false) {
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();
		}

	};

	Slick.prototype.destroy = function (refresh) {

		var _ = this;

		_.autoPlayClear();

		_.touchObject = {};

		_.cleanUpEvents();

		$('.slick-cloned', _.$slider).detach();

		if (_.$dots) {
			_.$dots.remove();
		}


		if (_.$prevArrow && _.$prevArrow.length) {

			_.$prevArrow
				.removeClass('slick-disabled slick-arrow slick-hidden')
				.removeAttr('aria-hidden aria-disabled tabindex')
				.css('display', '');

			if (_.htmlExpr.test(_.options.prevArrow)) {
				_.$prevArrow.remove();
			}
		}

		if (_.$nextArrow && _.$nextArrow.length) {

			_.$nextArrow
				.removeClass('slick-disabled slick-arrow slick-hidden')
				.removeAttr('aria-hidden aria-disabled tabindex')
				.css('display', '');

			if (_.htmlExpr.test(_.options.nextArrow)) {
				_.$nextArrow.remove();
			}

		}


		if (_.$slides) {

			_.$slides
				.removeClass('slick-slide slick-active slick-center slick-visible slick-current')
				.removeAttr('aria-hidden')
				.removeAttr('data-slick-index')
				.each(function () {
					$(this).attr('style', $(this).data('originalStyling'));
				});

			_.$slideTrack.children(this.options.slide).detach();

			_.$slideTrack.detach();

			_.$list.detach();

			_.$slider.append(_.$slides);
		}

		_.cleanUpRows();

		_.$slider.removeClass('slick-slider');
		_.$slider.removeClass('slick-initialized');
		_.$slider.removeClass('slick-dotted');

		_.unslicked = true;

		if (!refresh) {
			_.$slider.trigger('destroy', [_]);
		}

	};

	Slick.prototype.disableTransition = function (slide) {

		var _ = this,
			transition = {};

		transition[_.transitionType] = '';

		if (_.options.fade === false) {
			_.$slideTrack.css(transition);
		} else {
			_.$slides.eq(slide).css(transition);
		}

	};

	Slick.prototype.fadeSlide = function (slideIndex, callback) {

		var _ = this;

		if (_.cssTransitions === false) {

			_.$slides.eq(slideIndex).css({
				zIndex: _.options.zIndex
			});

			_.$slides.eq(slideIndex).animate({
				opacity: 1
			}, _.options.speed, _.options.easing, callback);

		} else {

			_.applyTransition(slideIndex);

			_.$slides.eq(slideIndex).css({
				opacity: 1,
				zIndex: _.options.zIndex
			});

			if (callback) {
				setTimeout(function () {

					_.disableTransition(slideIndex);

					callback.call();
				}, _.options.speed);
			}

		}

	};

	Slick.prototype.fadeSlideOut = function (slideIndex) {

		var _ = this;

		if (_.cssTransitions === false) {

			_.$slides.eq(slideIndex).animate({
				opacity: 0,
				zIndex: _.options.zIndex - 2
			}, _.options.speed, _.options.easing);

		} else {

			_.applyTransition(slideIndex);

			_.$slides.eq(slideIndex).css({
				opacity: 0,
				zIndex: _.options.zIndex - 2
			});

		}

	};

	Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

		var _ = this;

		if (filter !== null) {

			_.$slidesCache = _.$slides;

			_.unload();

			_.$slideTrack.children(this.options.slide).detach();

			_.$slidesCache.filter(filter).appendTo(_.$slideTrack);

			_.reinit();

		}

	};

	Slick.prototype.focusHandler = function () {

		var _ = this;

		_.$slider
			.off('focus.slick blur.slick')
			.on('focus.slick blur.slick',
			'*:not(.slick-arrow)', function (event) {

				event.stopImmediatePropagation();
				var $sf = $(this);

				setTimeout(function () {

					if (_.options.pauseOnFocus) {
						_.focussed = $sf.is(':focus');
						_.autoPlay();
					}

				}, 0);

			});
	};

	Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

		var _ = this;
		return _.currentSlide;

	};

	Slick.prototype.getDotCount = function () {

		var _ = this;

		var breakPoint = 0;
		var counter = 0;
		var pagerQty = 0;

		if (_.options.infinite === true) {
			while (breakPoint < _.slideCount) {
				++pagerQty;
				breakPoint = counter + _.options.slidesToScroll;
				counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
			}
		} else if (_.options.centerMode === true) {
			pagerQty = _.slideCount;
		} else if (!_.options.asNavFor) {
			pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
		} else {
			while (breakPoint < _.slideCount) {
				++pagerQty;
				breakPoint = counter + _.options.slidesToScroll;
				counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
			}
		}

		return pagerQty - 1;

	};

	Slick.prototype.getLeft = function (slideIndex) {

		var _ = this,
			targetLeft,
			verticalHeight,
			verticalOffset = 0,
			targetSlide;

		_.slideOffset = 0;
		verticalHeight = _.$slides.first().outerHeight(true);

		if (_.options.infinite === true) {
			if (_.slideCount > _.options.slidesToShow) {
				_.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
				verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
			}
			if (_.slideCount % _.options.slidesToScroll !== 0) {
				if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
					if (slideIndex > _.slideCount) {
						_.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
						verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
					} else {
						_.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
						verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
					}
				}
			}
		} else {
			if (slideIndex + _.options.slidesToShow > _.slideCount) {
				_.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
				verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
			}
		}

		if (_.slideCount <= _.options.slidesToShow) {
			_.slideOffset = 0;
			verticalOffset = 0;
		}

		if (_.options.centerMode === true && _.options.infinite === true) {
			_.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
		} else if (_.options.centerMode === true) {
			_.slideOffset = 0;
			_.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
		}

		if (_.options.vertical === false) {
			targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
		} else {
			targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
		}

		if (_.options.variableWidth === true) {

			if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
				targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
			} else {
				targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
			}

			if (_.options.rtl === true) {
				if (targetSlide[0]) {
					targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
				} else {
					targetLeft = 0;
				}
			} else {
				targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
			}

			if (_.options.centerMode === true) {
				if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
					targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
				} else {
					targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
				}

				if (_.options.rtl === true) {
					if (targetSlide[0]) {
						targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
					} else {
						targetLeft = 0;
					}
				} else {
					targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
				}

				targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
			}
		}

		return targetLeft;

	};

	Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

		var _ = this;

		return _.options[option];

	};

	Slick.prototype.getNavigableIndexes = function () {

		var _ = this,
			breakPoint = 0,
			counter = 0,
			indexes = [],
			max;

		if (_.options.infinite === false) {
			max = _.slideCount;
		} else {
			breakPoint = _.options.slidesToScroll * -1;
			counter = _.options.slidesToScroll * -1;
			max = _.slideCount * 2;
		}

		while (breakPoint < max) {
			indexes.push(breakPoint);
			breakPoint = counter + _.options.slidesToScroll;
			counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
		}

		return indexes;

	};

	Slick.prototype.getSlick = function () {

		return this;

	};

	Slick.prototype.getSlideCount = function () {

		var _ = this,
			slidesTraversed, swipedSlide, centerOffset;

		centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

		if (_.options.swipeToSlide === true) {
			_.$slideTrack.find('.slick-slide').each(function (index, slide) {
				if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
					swipedSlide = slide;
					return false;
				}
			});

			slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

			return slidesTraversed;

		} else {
			return _.options.slidesToScroll;
		}

	};

	Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

		var _ = this;

		_.changeSlide({
			data: {
				message: 'index',
				index: parseInt(slide)
			}
		}, dontAnimate);

	};

	Slick.prototype.init = function (creation) {

		var _ = this;

		if (!$(_.$slider).hasClass('slick-initialized')) {

			$(_.$slider).addClass('slick-initialized');

			_.buildRows();
			_.buildOut();
			_.setProps();
			_.startLoad();
			_.loadSlider();
			_.initializeEvents();
			_.updateArrows();
			_.updateDots();
			_.checkResponsive(true);
			_.focusHandler();

		}

		if (creation) {
			_.$slider.trigger('init', [_]);
		}

		if (_.options.accessibility === true) {
			_.initADA();
		}

		if (_.options.autoplay) {

			_.paused = false;
			_.autoPlay();

		}

	};

	Slick.prototype.initADA = function () {
		var _ = this;
		_.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
			'aria-hidden': 'true',
			'tabindex': '-1'
		}).find('a, input, button, select').attr({
			'tabindex': '-1'
		});

		_.$slideTrack.attr('role', 'listbox');

		_.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
			$(this).attr({
				'role': 'option',
				'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
			});
		});

		if (_.$dots !== null) {
			_.$dots.attr('role', 'tablist').find('li').each(function (i) {
				$(this).attr({
					'role': 'presentation',
					'aria-selected': 'false',
					'aria-controls': 'navigation' + _.instanceUid + i + '',
					'id': 'slick-slide' + _.instanceUid + i + ''
				});
			})
				.first().attr('aria-selected', 'true').end()
				.find('button').attr('role', 'button').end()
				.closest('div').attr('role', 'toolbar');
		}
		_.activateADA();

	};

	Slick.prototype.initArrowEvents = function () {

		var _ = this;

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
			_.$prevArrow
				.off('click.slick')
				.on('click.slick', {
					message: 'previous'
				}, _.changeSlide);
			_.$nextArrow
				.off('click.slick')
				.on('click.slick', {
					message: 'next'
				}, _.changeSlide);
		}

	};

	Slick.prototype.initDotEvents = function () {

		var _ = this;

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
			$('li', _.$dots).on('click.slick', {
				message: 'index'
			}, _.changeSlide);
		}

		if (_.options.dots === true && _.options.pauseOnDotsHover === true) {

			$('li', _.$dots)
				.on('mouseenter.slick', $.proxy(_.interrupt, _, true))
				.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

		}

	};

	Slick.prototype.initSlideEvents = function () {

		var _ = this;

		if (_.options.pauseOnHover) {

			_.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
			_.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

		}

	};

	Slick.prototype.initializeEvents = function () {

		var _ = this;

		_.initArrowEvents();

		_.initDotEvents();
		_.initSlideEvents();

		_.$list.on('touchstart.slick mousedown.slick', {
			action: 'start'
		}, _.swipeHandler);
		_.$list.on('touchmove.slick mousemove.slick', {
			action: 'move'
		}, _.swipeHandler);
		_.$list.on('touchend.slick mouseup.slick', {
			action: 'end'
		}, _.swipeHandler);
		_.$list.on('touchcancel.slick mouseleave.slick', {
			action: 'end'
		}, _.swipeHandler);

		_.$list.on('click.slick', _.clickHandler);

		$(document).on(_.visibilityChange, $.proxy(_.visibility, _));

		if (_.options.accessibility === true) {
			_.$list.on('keydown.slick', _.keyHandler);
		}

		if (_.options.focusOnSelect === true) {
			$(_.$slideTrack).children().on('click.slick', _.selectHandler);
		}

		$(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

		$(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

		$('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

		$(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
		$(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

	};

	Slick.prototype.initUI = function () {

		var _ = this;

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

			_.$prevArrow.show();
			_.$nextArrow.show();

		}

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			_.$dots.show();

		}

	};

	Slick.prototype.keyHandler = function (event) {

		var _ = this;
		//Dont slide if the cursor is inside the form fields and arrow keys are pressed
		if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
			if (event.keyCode === 37 && _.options.accessibility === true) {
				_.changeSlide({
					data: {
						message: _.options.rtl === true ? 'next' : 'previous'
					}
				});
			} else if (event.keyCode === 39 && _.options.accessibility === true) {
				_.changeSlide({
					data: {
						message: _.options.rtl === true ? 'previous' : 'next'
					}
				});
			}
		}

	};

	Slick.prototype.lazyLoad = function () {

		var _ = this,
			loadRange, cloneRange, rangeStart, rangeEnd;

		function loadImages(imagesScope) {

			$('img[data-lazy]', imagesScope).each(function () {

				var image = $(this),
					imageSource = $(this).attr('data-lazy'),
					imageToLoad = document.createElement('img');

				imageToLoad.onload = function () {

					image
						.animate({ opacity: 0 }, 100, function () {
							image
								.attr('src', imageSource)
								.animate({ opacity: 1 }, 200, function () {
									image
										.removeAttr('data-lazy')
										.removeClass('slick-loading');
								});
							_.$slider.trigger('lazyLoaded', [_, image, imageSource]);
						});

				};

				imageToLoad.onerror = function () {

					image
						.removeAttr('data-lazy')
						.removeClass('slick-loading')
						.addClass('slick-lazyload-error');

					_.$slider.trigger('lazyLoadError', [_, image, imageSource]);

				};

				imageToLoad.src = imageSource;

			});

		}

		if (_.options.centerMode === true) {
			if (_.options.infinite === true) {
				rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
				rangeEnd = rangeStart + _.options.slidesToShow + 2;
			} else {
				rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
				rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
			}
		} else {
			rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
			rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
			if (_.options.fade === true) {
				if (rangeStart > 0) rangeStart--;
				if (rangeEnd <= _.slideCount) rangeEnd++;
			}
		}

		loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
		loadImages(loadRange);

		if (_.slideCount <= _.options.slidesToShow) {
			cloneRange = _.$slider.find('.slick-slide');
			loadImages(cloneRange);
		} else
			if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
				cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
				loadImages(cloneRange);
			} else if (_.currentSlide === 0) {
				cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
				loadImages(cloneRange);
			}

	};

	Slick.prototype.loadSlider = function () {

		var _ = this;

		_.setPosition();

		_.$slideTrack.css({
			opacity: 1
		});

		_.$slider.removeClass('slick-loading');

		_.initUI();

		if (_.options.lazyLoad === 'progressive') {
			_.progressiveLazyLoad();
		}

	};

	Slick.prototype.next = Slick.prototype.slickNext = function () {

		var _ = this;

		_.changeSlide({
			data: {
				message: 'next'
			}
		});

	};

	Slick.prototype.orientationChange = function () {

		var _ = this;

		_.checkResponsive();
		_.setPosition();

	};

	Slick.prototype.pause = Slick.prototype.slickPause = function () {

		var _ = this;

		_.autoPlayClear();
		_.paused = true;

	};

	Slick.prototype.play = Slick.prototype.slickPlay = function () {

		var _ = this;

		_.autoPlay();
		_.options.autoplay = true;
		_.paused = false;
		_.focussed = false;
		_.interrupted = false;

	};

	Slick.prototype.postSlide = function (index) {

		var _ = this;

		if (!_.unslicked) {

			_.$slider.trigger('afterChange', [_, index]);

			_.animating = false;

			_.setPosition();

			_.swipeLeft = null;

			if (_.options.autoplay) {
				_.autoPlay();
			}

			if (_.options.accessibility === true) {
				_.initADA();
			}

		}

	};

	Slick.prototype.prev = Slick.prototype.slickPrev = function () {

		var _ = this;

		_.changeSlide({
			data: {
				message: 'previous'
			}
		});

	};

	Slick.prototype.preventDefault = function (event) {

		event.preventDefault();

	};

	Slick.prototype.progressiveLazyLoad = function (tryCount) {

		tryCount = tryCount || 1;

		var _ = this,
			$imgsToLoad = $('img[data-lazy]', _.$slider),
			image,
			imageSource,
			imageToLoad;

		if ($imgsToLoad.length) {

			image = $imgsToLoad.first();
			imageSource = image.attr('data-lazy');
			imageToLoad = document.createElement('img');

			imageToLoad.onload = function () {

				image
					.attr('src', imageSource)
					.removeAttr('data-lazy')
					.removeClass('slick-loading');

				if (_.options.adaptiveHeight === true) {
					_.setPosition();
				}

				_.$slider.trigger('lazyLoaded', [_, image, imageSource]);
				_.progressiveLazyLoad();

			};

			imageToLoad.onerror = function () {

				if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
					setTimeout(function () {
						_.progressiveLazyLoad(tryCount + 1);
					}, 500);

				} else {

					image
						.removeAttr('data-lazy')
						.removeClass('slick-loading')
						.addClass('slick-lazyload-error');

					_.$slider.trigger('lazyLoadError', [_, image, imageSource]);

					_.progressiveLazyLoad();

				}

			};

			imageToLoad.src = imageSource;

		} else {

			_.$slider.trigger('allImagesLoaded', [_]);

		}

	};

	Slick.prototype.refresh = function (initializing) {

		var _ = this, currentSlide, lastVisibleIndex;

		lastVisibleIndex = _.slideCount - _.options.slidesToShow;

		// in non-infinite sliders, we don't want to go past the
		// last visible index.
		if (!_.options.infinite && (_.currentSlide > lastVisibleIndex)) {
			_.currentSlide = lastVisibleIndex;
		}

		// if less slides than to show, go to start.
		if (_.slideCount <= _.options.slidesToShow) {
			_.currentSlide = 0;

		}

		currentSlide = _.currentSlide;

		_.destroy(true);

		$.extend(_, _.initials, { currentSlide: currentSlide });

		_.init();

		if (!initializing) {

			_.changeSlide({
				data: {
					message: 'index',
					index: currentSlide
				}
			}, false);

		}

	};

	Slick.prototype.registerBreakpoints = function () {

		var _ = this, breakpoint, currentBreakpoint, l,
			responsiveSettings = _.options.responsive || null;

		if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

			_.respondTo = _.options.respondTo || 'window';

			for (breakpoint in responsiveSettings) {

				l = _.breakpoints.length - 1;
				currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

				if (responsiveSettings.hasOwnProperty(breakpoint)) {

					// loop through the breakpoints and cut out any existing
					// ones with the same breakpoint number, we don't want dupes.
					while (l >= 0) {
						if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
							_.breakpoints.splice(l, 1);
						}
						l--;
					}

					_.breakpoints.push(currentBreakpoint);
					_.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

				}

			}

			_.breakpoints.sort(function (a, b) {
				return (_.options.mobileFirst) ? a - b : b - a;
			});

		}

	};

	Slick.prototype.reinit = function () {

		var _ = this;

		_.$slides =
			_.$slideTrack
				.children(_.options.slide)
				.addClass('slick-slide');

		_.slideCount = _.$slides.length;

		if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
			_.currentSlide = _.currentSlide - _.options.slidesToScroll;
		}

		if (_.slideCount <= _.options.slidesToShow) {
			_.currentSlide = 0;
		}

		_.registerBreakpoints();

		_.setProps();
		_.setupInfinite();
		_.buildArrows();
		_.updateArrows();
		_.initArrowEvents();
		_.buildDots();
		_.updateDots();
		_.initDotEvents();
		_.cleanUpSlideEvents();
		_.initSlideEvents();

		_.checkResponsive(false, true);

		if (_.options.focusOnSelect === true) {
			$(_.$slideTrack).children().on('click.slick', _.selectHandler);
		}

		_.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

		_.setPosition();
		_.focusHandler();

		_.paused = !_.options.autoplay;
		_.autoPlay();

		_.$slider.trigger('reInit', [_]);

	};

	Slick.prototype.resize = function () {

		var _ = this;

		if ($(window).width() !== _.windowWidth) {
			clearTimeout(_.windowDelay);
			_.windowDelay = window.setTimeout(function () {
				_.windowWidth = $(window).width();
				_.checkResponsive();
				if (!_.unslicked) { _.setPosition(); }
			}, 50);
		}
	};

	Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

		var _ = this;

		if (typeof (index) === 'boolean') {
			removeBefore = index;
			index = removeBefore === true ? 0 : _.slideCount - 1;
		} else {
			index = removeBefore === true ? --index : index;
		}

		if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
			return false;
		}

		_.unload();

		if (removeAll === true) {
			_.$slideTrack.children().remove();
		} else {
			_.$slideTrack.children(this.options.slide).eq(index).remove();
		}

		_.$slides = _.$slideTrack.children(this.options.slide);

		_.$slideTrack.children(this.options.slide).detach();

		_.$slideTrack.append(_.$slides);

		_.$slidesCache = _.$slides;

		_.reinit();

	};

	Slick.prototype.setCSS = function (position) {

		var _ = this,
			positionProps = {},
			x, y;

		if (_.options.rtl === true) {
			position = -position;
		}
		x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
		y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

		positionProps[_.positionProp] = position;

		if (_.transformsEnabled === false) {
			_.$slideTrack.css(positionProps);
		} else {
			positionProps = {};
			if (_.cssTransitions === false) {
				positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
				_.$slideTrack.css(positionProps);
			} else {
				positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
				_.$slideTrack.css(positionProps);
			}
		}

	};

	Slick.prototype.setDimensions = function () {

		var _ = this;

		if (_.options.vertical === false) {
			if (_.options.centerMode === true) {
				_.$list.css({
					padding: ('0px ' + _.options.centerPadding)
				});
			}
		} else {
			_.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
			if (_.options.centerMode === true) {
				_.$list.css({
					padding: (_.options.centerPadding + ' 0px')
				});
			}
		}

		_.listWidth = _.$list.width();
		_.listHeight = _.$list.height();


		if (_.options.vertical === false && _.options.variableWidth === false) {
			_.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
			_.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

		} else if (_.options.variableWidth === true) {
			_.$slideTrack.width(5000 * _.slideCount);
		} else {
			_.slideWidth = Math.ceil(_.listWidth);
			_.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
		}

		var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
		if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

	};

	Slick.prototype.setFade = function () {

		var _ = this,
			targetLeft;

		_.$slides.each(function (index, element) {
			targetLeft = (_.slideWidth * index) * -1;
			if (_.options.rtl === true) {
				$(element).css({
					position: 'relative',
					right: targetLeft,
					top: 0,
					zIndex: _.options.zIndex - 2,
					opacity: 0
				});
			} else {
				$(element).css({
					position: 'relative',
					left: targetLeft,
					top: 0,
					zIndex: _.options.zIndex - 2,
					opacity: 0
				});
			}
		});

		_.$slides.eq(_.currentSlide).css({
			zIndex: _.options.zIndex - 1,
			opacity: 1
		});

	};

	Slick.prototype.setHeight = function () {

		var _ = this;

		if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
			var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
			_.$list.css('height', targetHeight);
		}

	};

	Slick.prototype.setOption =
		Slick.prototype.slickSetOption = function () {

			/**
			 * accepts arguments in format of:
			 *
			 *  - for changing a single option's value:
			 *     .slick("setOption", option, value, refresh )
			 *
			 *  - for changing a set of responsive options:
			 *     .slick("setOption", 'responsive', [{}, ...], refresh )
			 *
			 *  - for updating multiple values at once (not responsive)
			 *     .slick("setOption", { 'option': value, ... }, refresh )
			 */

			var _ = this, l, item, option, value, refresh = false, type;

			if ($.type(arguments[0]) === 'object') {

				option = arguments[0];
				refresh = arguments[1];
				type = 'multiple';

			} else if ($.type(arguments[0]) === 'string') {

				option = arguments[0];
				value = arguments[1];
				refresh = arguments[2];

				if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

					type = 'responsive';

				} else if (typeof arguments[1] !== 'undefined') {

					type = 'single';

				}

			}

			if (type === 'single') {

				_.options[option] = value;


			} else if (type === 'multiple') {

				$.each(option, function (opt, val) {

					_.options[opt] = val;

				});


			} else if (type === 'responsive') {

				for (item in value) {

					if ($.type(_.options.responsive) !== 'array') {

						_.options.responsive = [value[item]];

					} else {

						l = _.options.responsive.length - 1;

						// loop through the responsive object and splice out duplicates.
						while (l >= 0) {

							if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

								_.options.responsive.splice(l, 1);

							}

							l--;

						}

						_.options.responsive.push(value[item]);

					}

				}

			}

			if (refresh) {

				_.unload();
				_.reinit();

			}

		};

	Slick.prototype.setPosition = function () {

		var _ = this;

		_.setDimensions();

		_.setHeight();

		if (_.options.fade === false) {
			_.setCSS(_.getLeft(_.currentSlide));
		} else {
			_.setFade();
		}

		_.$slider.trigger('setPosition', [_]);

	};

	Slick.prototype.setProps = function () {

		var _ = this,
			bodyStyle = document.body.style;

		_.positionProp = _.options.vertical === true ? 'top' : 'left';

		if (_.positionProp === 'top') {
			_.$slider.addClass('slick-vertical');
		} else {
			_.$slider.removeClass('slick-vertical');
		}

		if (bodyStyle.WebkitTransition !== undefined ||
			bodyStyle.MozTransition !== undefined ||
			bodyStyle.msTransition !== undefined) {
			if (_.options.useCSS === true) {
				_.cssTransitions = true;
			}
		}

		if (_.options.fade) {
			if (typeof _.options.zIndex === 'number') {
				if (_.options.zIndex < 3) {
					_.options.zIndex = 3;
				}
			} else {
				_.options.zIndex = _.defaults.zIndex;
			}
		}

		if (bodyStyle.OTransform !== undefined) {
			_.animType = 'OTransform';
			_.transformType = '-o-transform';
			_.transitionType = 'OTransition';
			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
		}
		if (bodyStyle.MozTransform !== undefined) {
			_.animType = 'MozTransform';
			_.transformType = '-moz-transform';
			_.transitionType = 'MozTransition';
			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
		}
		if (bodyStyle.webkitTransform !== undefined) {
			_.animType = 'webkitTransform';
			_.transformType = '-webkit-transform';
			_.transitionType = 'webkitTransition';
			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
		}
		if (bodyStyle.msTransform !== undefined) {
			_.animType = 'msTransform';
			_.transformType = '-ms-transform';
			_.transitionType = 'msTransition';
			if (bodyStyle.msTransform === undefined) _.animType = false;
		}
		if (bodyStyle.transform !== undefined && _.animType !== false) {
			_.animType = 'transform';
			_.transformType = 'transform';
			_.transitionType = 'transition';
		}
		_.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
	};


	Slick.prototype.setSlideClasses = function (index) {

		var _ = this,
			centerOffset, allSlides, indexOffset, remainder;

		allSlides = _.$slider
			.find('.slick-slide')
			.removeClass('slick-active slick-center slick-current')
			.attr('aria-hidden', 'true');

		_.$slides
			.eq(index)
			.addClass('slick-current');

		if (_.options.centerMode === true) {

			centerOffset = Math.floor(_.options.slidesToShow / 2);

			if (_.options.infinite === true) {

				if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

					_.$slides
						.slice(index - centerOffset, index + centerOffset + 1)
						.addClass('slick-active')
						.attr('aria-hidden', 'false');

				} else {

					indexOffset = _.options.slidesToShow + index;
					allSlides
						.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)
						.addClass('slick-active')
						.attr('aria-hidden', 'false');

				}

				if (index === 0) {

					allSlides
						.eq(allSlides.length - 1 - _.options.slidesToShow)
						.addClass('slick-center');

				} else if (index === _.slideCount - 1) {

					allSlides
						.eq(_.options.slidesToShow)
						.addClass('slick-center');

				}

			}

			_.$slides
				.eq(index)
				.addClass('slick-center');

		} else {

			if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

				_.$slides
					.slice(index, index + _.options.slidesToShow)
					.addClass('slick-active')
					.attr('aria-hidden', 'false');

			} else if (allSlides.length <= _.options.slidesToShow) {

				allSlides
					.addClass('slick-active')
					.attr('aria-hidden', 'false');

			} else {

				remainder = _.slideCount % _.options.slidesToShow;
				indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

				if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

					allSlides
						.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
						.addClass('slick-active')
						.attr('aria-hidden', 'false');

				} else {

					allSlides
						.slice(indexOffset, indexOffset + _.options.slidesToShow)
						.addClass('slick-active')
						.attr('aria-hidden', 'false');

				}

			}

		}

		if (_.options.lazyLoad === 'ondemand') {
			_.lazyLoad();
		}

	};

	Slick.prototype.setupInfinite = function () {

		var _ = this,
			i, slideIndex, infiniteCount;

		if (_.options.fade === true) {
			_.options.centerMode = false;
		}

		if (_.options.infinite === true && _.options.fade === false) {

			slideIndex = null;

			if (_.slideCount > _.options.slidesToShow) {

				if (_.options.centerMode === true) {
					infiniteCount = _.options.slidesToShow + 1;
				} else {
					infiniteCount = _.options.slidesToShow;
				}

				for (i = _.slideCount; i > (_.slideCount -
					infiniteCount); i -= 1) {
					slideIndex = i - 1;
					$(_.$slides[slideIndex]).clone(true).attr('id', '')
						.attr('data-slick-index', slideIndex - _.slideCount)
						.prependTo(_.$slideTrack).addClass('slick-cloned');
				}
				for (i = 0; i < infiniteCount; i += 1) {
					slideIndex = i;
					$(_.$slides[slideIndex]).clone(true).attr('id', '')
						.attr('data-slick-index', slideIndex + _.slideCount)
						.appendTo(_.$slideTrack).addClass('slick-cloned');
				}
				_.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
					$(this).attr('id', '');
				});

			}

		}

	};

	Slick.prototype.interrupt = function (toggle) {

		var _ = this;

		if (!toggle) {
			_.autoPlay();
		}
		_.interrupted = toggle;

	};

	Slick.prototype.selectHandler = function (event) {

		var _ = this;

		var targetElement =
			$(event.target).is('.slick-slide') ?
				$(event.target) :
				$(event.target).parents('.slick-slide');

		var index = parseInt(targetElement.attr('data-slick-index'));

		if (!index) index = 0;

		if (_.slideCount <= _.options.slidesToShow) {

			_.setSlideClasses(index);
			_.asNavFor(index);
			return;

		}

		_.slideHandler(index);

	};

	Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

		var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
			_ = this, navTarget;

		sync = sync || false;

		if (_.animating === true && _.options.waitForAnimate === true) {
			return;
		}

		if (_.options.fade === true && _.currentSlide === index) {
			return;
		}

		if (_.slideCount <= _.options.slidesToShow) {
			return;
		}

		if (sync === false) {
			_.asNavFor(index);
		}

		targetSlide = index;
		targetLeft = _.getLeft(targetSlide);
		slideLeft = _.getLeft(_.currentSlide);

		_.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

		if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
			if (_.options.fade === false) {
				targetSlide = _.currentSlide;
				if (dontAnimate !== true) {
					_.animateSlide(slideLeft, function () {
						_.postSlide(targetSlide);
					});
				} else {
					_.postSlide(targetSlide);
				}
			}
			return;
		} else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
			if (_.options.fade === false) {
				targetSlide = _.currentSlide;
				if (dontAnimate !== true) {
					_.animateSlide(slideLeft, function () {
						_.postSlide(targetSlide);
					});
				} else {
					_.postSlide(targetSlide);
				}
			}
			return;
		}

		if (_.options.autoplay) {
			clearInterval(_.autoPlayTimer);
		}

		if (targetSlide < 0) {
			if (_.slideCount % _.options.slidesToScroll !== 0) {
				animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
			} else {
				animSlide = _.slideCount + targetSlide;
			}
		} else if (targetSlide >= _.slideCount) {
			if (_.slideCount % _.options.slidesToScroll !== 0) {
				animSlide = 0;
			} else {
				animSlide = targetSlide - _.slideCount;
			}
		} else {
			animSlide = targetSlide;
		}

		_.animating = true;

		_.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

		oldSlide = _.currentSlide;
		_.currentSlide = animSlide;

		_.setSlideClasses(_.currentSlide);

		if (_.options.asNavFor) {

			navTarget = _.getNavTarget();
			navTarget = navTarget.slick('getSlick');

			if (navTarget.slideCount <= navTarget.options.slidesToShow) {
				navTarget.setSlideClasses(_.currentSlide);
			}

		}

		_.updateDots();
		_.updateArrows();

		if (_.options.fade === true) {
			if (dontAnimate !== true) {

				_.fadeSlideOut(oldSlide);

				_.fadeSlide(animSlide, function () {
					_.postSlide(animSlide);
				});

			} else {
				_.postSlide(animSlide);
			}
			_.animateHeight();
			return;
		}

		if (dontAnimate !== true) {
			_.animateSlide(targetLeft, function () {
				_.postSlide(animSlide);
			});
		} else {
			_.postSlide(animSlide);
		}

	};

	Slick.prototype.startLoad = function () {

		var _ = this;

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

			_.$prevArrow.hide();
			_.$nextArrow.hide();

		}

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			_.$dots.hide();

		}

		_.$slider.addClass('slick-loading');

	};

	Slick.prototype.swipeDirection = function () {

		var xDist, yDist, r, swipeAngle, _ = this;

		xDist = _.touchObject.startX - _.touchObject.curX;
		yDist = _.touchObject.startY - _.touchObject.curY;
		r = Math.atan2(yDist, xDist);

		swipeAngle = Math.round(r * 180 / Math.PI);
		if (swipeAngle < 0) {
			swipeAngle = 360 - Math.abs(swipeAngle);
		}

		if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
			return (_.options.rtl === false ? 'left' : 'right');
		}
		if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
			return (_.options.rtl === false ? 'left' : 'right');
		}
		if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
			return (_.options.rtl === false ? 'right' : 'left');
		}
		if (_.options.verticalSwiping === true) {
			if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
				return 'down';
			} else {
				return 'up';
			}
		}

		return 'vertical';

	};

	Slick.prototype.swipeEnd = function (event) {

		var _ = this,
			slideCount,
			direction;

		_.dragging = false;
		_.interrupted = false;
		_.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;

		if (_.touchObject.curX === undefined) {
			return false;
		}

		if (_.touchObject.edgeHit === true) {
			_.$slider.trigger('edge', [_, _.swipeDirection()]);
		}

		if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

			direction = _.swipeDirection();

			switch (direction) {

				case 'left':
				case 'down':

					slideCount =
						_.options.swipeToSlide ?
							_.checkNavigable(_.currentSlide + _.getSlideCount()) :
							_.currentSlide + _.getSlideCount();

					_.currentDirection = 0;

					break;

				case 'right':
				case 'up':

					slideCount =
						_.options.swipeToSlide ?
							_.checkNavigable(_.currentSlide - _.getSlideCount()) :
							_.currentSlide - _.getSlideCount();

					_.currentDirection = 1;

					break;

				default:


			}

			if (direction != 'vertical') {

				_.slideHandler(slideCount);
				_.touchObject = {};
				_.$slider.trigger('swipe', [_, direction]);

			}

		} else {

			if (_.touchObject.startX !== _.touchObject.curX) {

				_.slideHandler(_.currentSlide);
				_.touchObject = {};

			}

		}

	};

	Slick.prototype.swipeHandler = function (event) {

		var _ = this;

		if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
			return;
		} else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
			return;
		}

		_.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
			event.originalEvent.touches.length : 1;

		_.touchObject.minSwipe = _.listWidth / _.options
			.touchThreshold;

		if (_.options.verticalSwiping === true) {
			_.touchObject.minSwipe = _.listHeight / _.options
				.touchThreshold;
		}

		switch (event.data.action) {

			case 'start':
				_.swipeStart(event);
				break;

			case 'move':
				_.swipeMove(event);
				break;

			case 'end':
				_.swipeEnd(event);
				break;

		}

	};

	Slick.prototype.swipeMove = function (event) {

		var _ = this,
			edgeWasHit = false,
			curLeft, swipeDirection, swipeLength, positionOffset, touches;

		touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

		if (!_.dragging || touches && touches.length !== 1) {
			return false;
		}

		curLeft = _.getLeft(_.currentSlide);

		_.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
		_.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

		_.touchObject.swipeLength = Math.round(Math.sqrt(
			Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

		if (_.options.verticalSwiping === true) {
			_.touchObject.swipeLength = Math.round(Math.sqrt(
				Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
		}

		swipeDirection = _.swipeDirection();

		if (swipeDirection === 'vertical') {
			return;
		}

		if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
			event.preventDefault();
		}

		positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
		if (_.options.verticalSwiping === true) {
			positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
		}


		swipeLength = _.touchObject.swipeLength;

		_.touchObject.edgeHit = false;

		if (_.options.infinite === false) {
			if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
				swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
				_.touchObject.edgeHit = true;
			}
		}

		if (_.options.vertical === false) {
			_.swipeLeft = curLeft + swipeLength * positionOffset;
		} else {
			_.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
		}
		if (_.options.verticalSwiping === true) {
			_.swipeLeft = curLeft + swipeLength * positionOffset;
		}

		if (_.options.fade === true || _.options.touchMove === false) {
			return false;
		}

		if (_.animating === true) {
			_.swipeLeft = null;
			return false;
		}

		_.setCSS(_.swipeLeft);

	};

	Slick.prototype.swipeStart = function (event) {

		var _ = this,
			touches;

		_.interrupted = true;

		if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
			_.touchObject = {};
			return false;
		}

		if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
			touches = event.originalEvent.touches[0];
		}

		_.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
		_.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

		_.dragging = true;

	};

	Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

		var _ = this;

		if (_.$slidesCache !== null) {

			_.unload();

			_.$slideTrack.children(this.options.slide).detach();

			_.$slidesCache.appendTo(_.$slideTrack);

			_.reinit();

		}

	};

	Slick.prototype.unload = function () {

		var _ = this;

		$('.slick-cloned', _.$slider).remove();

		if (_.$dots) {
			_.$dots.remove();
		}

		if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
			_.$prevArrow.remove();
		}

		if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
			_.$nextArrow.remove();
		}

		_.$slides
			.removeClass('slick-slide slick-active slick-visible slick-current')
			.attr('aria-hidden', 'true')
			.css('width', '');

	};

	Slick.prototype.unslick = function (fromBreakpoint) {

		var _ = this;
		_.$slider.trigger('unslick', [_, fromBreakpoint]);
		_.destroy();

	};

	Slick.prototype.updateArrows = function () {

		var _ = this,
			centerOffset;

		centerOffset = Math.floor(_.options.slidesToShow / 2);

		if (_.options.arrows === true &&
			_.slideCount > _.options.slidesToShow &&
			!_.options.infinite) {

			_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
			_.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

			if (_.currentSlide === 0) {

				_.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				_.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

			} else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

				_.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

			} else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

				_.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

			}

		}

	};

	Slick.prototype.updateDots = function () {

		var _ = this;

		if (_.$dots !== null) {

			_.$dots
				.find('li')
				.removeClass('slick-active')
				.attr('aria-hidden', 'true');

			_.$dots
				.find('li')
				.eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
				.addClass('slick-active')
				.attr('aria-hidden', 'false');

		}

	};

	Slick.prototype.visibility = function () {

		var _ = this;

		if (_.options.autoplay) {

			if (document[_.hidden]) {

				_.interrupted = true;

			} else {

				_.interrupted = false;

			}

		}

	};

	$.fn.slick = function () {
		var _ = this,
			opt = arguments[0],
			args = Array.prototype.slice.call(arguments, 1),
			l = _.length,
			i,
			ret;
		for (i = 0; i < l; i++) {
			if (typeof opt == 'object' || typeof opt == 'undefined')
				_[i].slick = new Slick(_[i], opt);
			else
				ret = _[i].slick[opt].apply(_[i].slick, args);
			if (typeof ret != 'undefined') return ret;
		}
		return _;
	};

}));


/*************************************************************************************************************************************/

/**
 * Swiper 5.2.0
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 /**
 * Swiper 5.0.3
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * http://swiperjs.com
 *
 * Copyright 2014-2019 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: September 19, 2019
 */

!function (e, t) { "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self).Swiper = t() }(this, (function () { "use strict"; var e = "undefined" == typeof document ? { body: {}, addEventListener: function () { }, removeEventListener: function () { }, activeElement: { blur: function () { }, nodeName: "" }, querySelector: function () { return null }, querySelectorAll: function () { return [] }, getElementById: function () { return null }, createEvent: function () { return { initEvent: function () { } } }, createElement: function () { return { children: [], childNodes: [], style: {}, setAttribute: function () { }, getElementsByTagName: function () { return [] } } }, location: { hash: "" } } : document, t = "undefined" == typeof window ? { document: e, navigator: { userAgent: "" }, location: {}, history: {}, CustomEvent: function () { return this }, addEventListener: function () { }, removeEventListener: function () { }, getComputedStyle: function () { return { getPropertyValue: function () { return "" } } }, Image: function () { }, Date: function () { }, screen: {}, setTimeout: function () { }, clearTimeout: function () { } } : window, i = function (e) { for (var t = 0; t < e.length; t += 1)this[t] = e[t]; return this.length = e.length, this }; function s(s, a) { var r = [], n = 0; if (s && !a && s instanceof i) return s; if (s) if ("string" == typeof s) { var o, l, d = s.trim(); if (d.indexOf("<") >= 0 && d.indexOf(">") >= 0) { var h = "div"; for (0 === d.indexOf("<li") && (h = "ul"), 0 === d.indexOf("<tr") && (h = "tbody"), 0 !== d.indexOf("<td") && 0 !== d.indexOf("<th") || (h = "tr"), 0 === d.indexOf("<tbody") && (h = "table"), 0 === d.indexOf("<option") && (h = "select"), (l = e.createElement(h)).innerHTML = d, n = 0; n < l.childNodes.length; n += 1)r.push(l.childNodes[n]) } else for (o = a || "#" !== s[0] || s.match(/[ .<>:~]/) ? (a || e).querySelectorAll(s.trim()) : [e.getElementById(s.trim().split("#")[1])], n = 0; n < o.length; n += 1)o[n] && r.push(o[n]) } else if (s.nodeType || s === t || s === e) r.push(s); else if (s.length > 0 && s[0].nodeType) for (n = 0; n < s.length; n += 1)r.push(s[n]); return new i(r) } function a(e) { for (var t = [], i = 0; i < e.length; i += 1)-1 === t.indexOf(e[i]) && t.push(e[i]); return t } s.fn = i.prototype, s.Class = i, s.Dom7 = i; var r = { addClass: function (e) { if (void 0 === e) return this; for (var t = e.split(" "), i = 0; i < t.length; i += 1)for (var s = 0; s < this.length; s += 1)void 0 !== this[s] && void 0 !== this[s].classList && this[s].classList.add(t[i]); return this }, removeClass: function (e) { for (var t = e.split(" "), i = 0; i < t.length; i += 1)for (var s = 0; s < this.length; s += 1)void 0 !== this[s] && void 0 !== this[s].classList && this[s].classList.remove(t[i]); return this }, hasClass: function (e) { return !!this[0] && this[0].classList.contains(e) }, toggleClass: function (e) { for (var t = e.split(" "), i = 0; i < t.length; i += 1)for (var s = 0; s < this.length; s += 1)void 0 !== this[s] && void 0 !== this[s].classList && this[s].classList.toggle(t[i]); return this }, attr: function (e, t) { var i = arguments; if (1 === arguments.length && "string" == typeof e) return this[0] ? this[0].getAttribute(e) : void 0; for (var s = 0; s < this.length; s += 1)if (2 === i.length) this[s].setAttribute(e, t); else for (var a in e) this[s][a] = e[a], this[s].setAttribute(a, e[a]); return this }, removeAttr: function (e) { for (var t = 0; t < this.length; t += 1)this[t].removeAttribute(e); return this }, data: function (e, t) { var i; if (void 0 !== t) { for (var s = 0; s < this.length; s += 1)(i = this[s]).dom7ElementDataStorage || (i.dom7ElementDataStorage = {}), i.dom7ElementDataStorage[e] = t; return this } if (i = this[0]) { if (i.dom7ElementDataStorage && e in i.dom7ElementDataStorage) return i.dom7ElementDataStorage[e]; var a = i.getAttribute("data-" + e); return a || void 0 } }, transform: function (e) { for (var t = 0; t < this.length; t += 1) { var i = this[t].style; i.webkitTransform = e, i.transform = e } return this }, transition: function (e) { "string" != typeof e && (e += "ms"); for (var t = 0; t < this.length; t += 1) { var i = this[t].style; i.webkitTransitionDuration = e, i.transitionDuration = e } return this }, on: function () { for (var e, t = [], i = arguments.length; i--;)t[i] = arguments[i]; var a = t[0], r = t[1], n = t[2], o = t[3]; function l(e) { var t = e.target; if (t) { var i = e.target.dom7EventData || []; if (i.indexOf(e) < 0 && i.unshift(e), s(t).is(r)) n.apply(t, i); else for (var a = s(t).parents(), o = 0; o < a.length; o += 1)s(a[o]).is(r) && n.apply(a[o], i) } } function d(e) { var t = e && e.target && e.target.dom7EventData || []; t.indexOf(e) < 0 && t.unshift(e), n.apply(this, t) } "function" == typeof t[1] && (a = (e = t)[0], n = e[1], o = e[2], r = void 0), o || (o = !1); for (var h, p = a.split(" "), c = 0; c < this.length; c += 1) { var u = this[c]; if (r) for (h = 0; h < p.length; h += 1) { var v = p[h]; u.dom7LiveListeners || (u.dom7LiveListeners = {}), u.dom7LiveListeners[v] || (u.dom7LiveListeners[v] = []), u.dom7LiveListeners[v].push({ listener: n, proxyListener: l }), u.addEventListener(v, l, o) } else for (h = 0; h < p.length; h += 1) { var f = p[h]; u.dom7Listeners || (u.dom7Listeners = {}), u.dom7Listeners[f] || (u.dom7Listeners[f] = []), u.dom7Listeners[f].push({ listener: n, proxyListener: d }), u.addEventListener(f, d, o) } } return this }, off: function () { for (var e, t = [], i = arguments.length; i--;)t[i] = arguments[i]; var s = t[0], a = t[1], r = t[2], n = t[3]; "function" == typeof t[1] && (s = (e = t)[0], r = e[1], n = e[2], a = void 0), n || (n = !1); for (var o = s.split(" "), l = 0; l < o.length; l += 1)for (var d = o[l], h = 0; h < this.length; h += 1) { var p = this[h], c = void 0; if (!a && p.dom7Listeners ? c = p.dom7Listeners[d] : a && p.dom7LiveListeners && (c = p.dom7LiveListeners[d]), c && c.length) for (var u = c.length - 1; u >= 0; u -= 1) { var v = c[u]; r && v.listener === r ? (p.removeEventListener(d, v.proxyListener, n), c.splice(u, 1)) : r && v.listener && v.listener.dom7proxy && v.listener.dom7proxy === r ? (p.removeEventListener(d, v.proxyListener, n), c.splice(u, 1)) : r || (p.removeEventListener(d, v.proxyListener, n), c.splice(u, 1)) } } return this }, trigger: function () { for (var i = [], s = arguments.length; s--;)i[s] = arguments[s]; for (var a = i[0].split(" "), r = i[1], n = 0; n < a.length; n += 1)for (var o = a[n], l = 0; l < this.length; l += 1) { var d = this[l], h = void 0; try { h = new t.CustomEvent(o, { detail: r, bubbles: !0, cancelable: !0 }) } catch (t) { (h = e.createEvent("Event")).initEvent(o, !0, !0), h.detail = r } d.dom7EventData = i.filter((function (e, t) { return t > 0 })), d.dispatchEvent(h), d.dom7EventData = [], delete d.dom7EventData } return this }, transitionEnd: function (e) { var t, i = ["webkitTransitionEnd", "transitionend"], s = this; function a(r) { if (r.target === this) for (e.call(this, r), t = 0; t < i.length; t += 1)s.off(i[t], a) } if (e) for (t = 0; t < i.length; t += 1)s.on(i[t], a); return this }, outerWidth: function (e) { if (this.length > 0) { if (e) { var t = this.styles(); return this[0].offsetWidth + parseFloat(t.getPropertyValue("margin-right")) + parseFloat(t.getPropertyValue("margin-left")) } return this[0].offsetWidth } return null }, outerHeight: function (e) { if (this.length > 0) { if (e) { var t = this.styles(); return this[0].offsetHeight + parseFloat(t.getPropertyValue("margin-top")) + parseFloat(t.getPropertyValue("margin-bottom")) } return this[0].offsetHeight } return null }, offset: function () { if (this.length > 0) { var i = this[0], s = i.getBoundingClientRect(), a = e.body, r = i.clientTop || a.clientTop || 0, n = i.clientLeft || a.clientLeft || 0, o = i === t ? t.scrollY : i.scrollTop, l = i === t ? t.scrollX : i.scrollLeft; return { top: s.top + o - r, left: s.left + l - n } } return null }, css: function (e, i) { var s; if (1 === arguments.length) { if ("string" != typeof e) { for (s = 0; s < this.length; s += 1)for (var a in e) this[s].style[a] = e[a]; return this } if (this[0]) return t.getComputedStyle(this[0], null).getPropertyValue(e) } if (2 === arguments.length && "string" == typeof e) { for (s = 0; s < this.length; s += 1)this[s].style[e] = i; return this } return this }, each: function (e) { if (!e) return this; for (var t = 0; t < this.length; t += 1)if (!1 === e.call(this[t], t, this[t])) return this; return this }, html: function (e) { if (void 0 === e) return this[0] ? this[0].innerHTML : void 0; for (var t = 0; t < this.length; t += 1)this[t].innerHTML = e; return this }, text: function (e) { if (void 0 === e) return this[0] ? this[0].textContent.trim() : null; for (var t = 0; t < this.length; t += 1)this[t].textContent = e; return this }, is: function (a) { var r, n, o = this[0]; if (!o || void 0 === a) return !1; if ("string" == typeof a) { if (o.matches) return o.matches(a); if (o.webkitMatchesSelector) return o.webkitMatchesSelector(a); if (o.msMatchesSelector) return o.msMatchesSelector(a); for (r = s(a), n = 0; n < r.length; n += 1)if (r[n] === o) return !0; return !1 } if (a === e) return o === e; if (a === t) return o === t; if (a.nodeType || a instanceof i) { for (r = a.nodeType ? [a] : a, n = 0; n < r.length; n += 1)if (r[n] === o) return !0; return !1 } return !1 }, index: function () { var e, t = this[0]; if (t) { for (e = 0; null !== (t = t.previousSibling);)1 === t.nodeType && (e += 1); return e } }, eq: function (e) { if (void 0 === e) return this; var t, s = this.length; return new i(e > s - 1 ? [] : e < 0 ? (t = s + e) < 0 ? [] : [this[t]] : [this[e]]) }, append: function () { for (var t, s = [], a = arguments.length; a--;)s[a] = arguments[a]; for (var r = 0; r < s.length; r += 1) { t = s[r]; for (var n = 0; n < this.length; n += 1)if ("string" == typeof t) { var o = e.createElement("div"); for (o.innerHTML = t; o.firstChild;)this[n].appendChild(o.firstChild) } else if (t instanceof i) for (var l = 0; l < t.length; l += 1)this[n].appendChild(t[l]); else this[n].appendChild(t) } return this }, prepend: function (t) { var s, a; for (s = 0; s < this.length; s += 1)if ("string" == typeof t) { var r = e.createElement("div"); for (r.innerHTML = t, a = r.childNodes.length - 1; a >= 0; a -= 1)this[s].insertBefore(r.childNodes[a], this[s].childNodes[0]) } else if (t instanceof i) for (a = 0; a < t.length; a += 1)this[s].insertBefore(t[a], this[s].childNodes[0]); else this[s].insertBefore(t, this[s].childNodes[0]); return this }, next: function (e) { return this.length > 0 ? e ? this[0].nextElementSibling && s(this[0].nextElementSibling).is(e) ? new i([this[0].nextElementSibling]) : new i([]) : this[0].nextElementSibling ? new i([this[0].nextElementSibling]) : new i([]) : new i([]) }, nextAll: function (e) { var t = [], a = this[0]; if (!a) return new i([]); for (; a.nextElementSibling;) { var r = a.nextElementSibling; e ? s(r).is(e) && t.push(r) : t.push(r), a = r } return new i(t) }, prev: function (e) { if (this.length > 0) { var t = this[0]; return e ? t.previousElementSibling && s(t.previousElementSibling).is(e) ? new i([t.previousElementSibling]) : new i([]) : t.previousElementSibling ? new i([t.previousElementSibling]) : new i([]) } return new i([]) }, prevAll: function (e) { var t = [], a = this[0]; if (!a) return new i([]); for (; a.previousElementSibling;) { var r = a.previousElementSibling; e ? s(r).is(e) && t.push(r) : t.push(r), a = r } return new i(t) }, parent: function (e) { for (var t = [], i = 0; i < this.length; i += 1)null !== this[i].parentNode && (e ? s(this[i].parentNode).is(e) && t.push(this[i].parentNode) : t.push(this[i].parentNode)); return s(a(t)) }, parents: function (e) { for (var t = [], i = 0; i < this.length; i += 1)for (var r = this[i].parentNode; r;)e ? s(r).is(e) && t.push(r) : t.push(r), r = r.parentNode; return s(a(t)) }, closest: function (e) { var t = this; return void 0 === e ? new i([]) : (t.is(e) || (t = t.parents(e).eq(0)), t) }, find: function (e) { for (var t = [], s = 0; s < this.length; s += 1)for (var a = this[s].querySelectorAll(e), r = 0; r < a.length; r += 1)t.push(a[r]); return new i(t) }, children: function (e) { for (var t = [], r = 0; r < this.length; r += 1)for (var n = this[r].childNodes, o = 0; o < n.length; o += 1)e ? 1 === n[o].nodeType && s(n[o]).is(e) && t.push(n[o]) : 1 === n[o].nodeType && t.push(n[o]); return new i(a(t)) }, filter: function (e) { for (var t = [], s = 0; s < this.length; s += 1)e.call(this[s], s, this[s]) && t.push(this[s]); return new i(t) }, remove: function () { for (var e = 0; e < this.length; e += 1)this[e].parentNode && this[e].parentNode.removeChild(this[e]); return this }, add: function () { for (var e = [], t = arguments.length; t--;)e[t] = arguments[t]; var i, a; for (i = 0; i < e.length; i += 1) { var r = s(e[i]); for (a = 0; a < r.length; a += 1)this[this.length] = r[a], this.length += 1 } return this }, styles: function () { return this[0] ? t.getComputedStyle(this[0], null) : {} } }; Object.keys(r).forEach((function (e) { s.fn[e] = s.fn[e] || r[e] })); var n = { deleteProps: function (e) { var t = e; Object.keys(t).forEach((function (e) { try { t[e] = null } catch (e) { } try { delete t[e] } catch (e) { } })) }, nextTick: function (e, t) { return void 0 === t && (t = 0), setTimeout(e, t) }, now: function () { return Date.now() }, getTranslate: function (e, i) { var s, a, r; void 0 === i && (i = "x"); var n = t.getComputedStyle(e, null); return t.WebKitCSSMatrix ? ((a = n.transform || n.webkitTransform).split(",").length > 6 && (a = a.split(", ").map((function (e) { return e.replace(",", ".") })).join(", ")), r = new t.WebKitCSSMatrix("none" === a ? "" : a)) : s = (r = n.MozTransform || n.OTransform || n.MsTransform || n.msTransform || n.transform || n.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,")).toString().split(","), "x" === i && (a = t.WebKitCSSMatrix ? r.m41 : 16 === s.length ? parseFloat(s[12]) : parseFloat(s[4])), "y" === i && (a = t.WebKitCSSMatrix ? r.m42 : 16 === s.length ? parseFloat(s[13]) : parseFloat(s[5])), a || 0 }, parseUrlQuery: function (e) { var i, s, a, r, n = {}, o = e || t.location.href; if ("string" == typeof o && o.length) for (r = (s = (o = o.indexOf("?") > -1 ? o.replace(/\S*\?/, "") : "").split("&").filter((function (e) { return "" !== e }))).length, i = 0; i < r; i += 1)a = s[i].replace(/#\S+/g, "").split("="), n[decodeURIComponent(a[0])] = void 0 === a[1] ? void 0 : decodeURIComponent(a[1]) || ""; return n }, isObject: function (e) { return "object" == typeof e && null !== e && e.constructor && e.constructor === Object }, extend: function () { for (var e = [], t = arguments.length; t--;)e[t] = arguments[t]; for (var i = Object(e[0]), s = 1; s < e.length; s += 1) { var a = e[s]; if (null != a) for (var r = Object.keys(Object(a)), o = 0, l = r.length; o < l; o += 1) { var d = r[o], h = Object.getOwnPropertyDescriptor(a, d); void 0 !== h && h.enumerable && (n.isObject(i[d]) && n.isObject(a[d]) ? n.extend(i[d], a[d]) : !n.isObject(i[d]) && n.isObject(a[d]) ? (i[d] = {}, n.extend(i[d], a[d])) : i[d] = a[d]) } } return i } }, o = { touch: t.Modernizr && !0 === t.Modernizr.touch || !!(t.navigator.maxTouchPoints > 0 || "ontouchstart" in t || t.DocumentTouch && e instanceof t.DocumentTouch), pointerEvents: !!(t.navigator.pointerEnabled || t.PointerEvent || "maxTouchPoints" in t.navigator && t.navigator.maxTouchPoints > 0), prefixedPointerEvents: !!t.navigator.msPointerEnabled, observer: "MutationObserver" in t || "WebkitMutationObserver" in t, passiveListener: function () { var e = !1; try { var i = Object.defineProperty({}, "passive", { get: function () { e = !0 } }); t.addEventListener("testPassiveListener", null, i) } catch (e) { } return e }(), gestures: "ongesturestart" in t }, l = function (e) { void 0 === e && (e = {}); var t = this; t.params = e, t.eventsListeners = {}, t.params && t.params.on && Object.keys(t.params.on).forEach((function (e) { t.on(e, t.params.on[e]) })) }, d = { components: { configurable: !0 } }; l.prototype.on = function (e, t, i) { var s = this; if ("function" != typeof t) return s; var a = i ? "unshift" : "push"; return e.split(" ").forEach((function (e) { s.eventsListeners[e] || (s.eventsListeners[e] = []), s.eventsListeners[e][a](t) })), s }, l.prototype.once = function (e, t, i) { var s = this; if ("function" != typeof t) return s; function a() { for (var i = [], r = arguments.length; r--;)i[r] = arguments[r]; t.apply(s, i), s.off(e, a), a.f7proxy && delete a.f7proxy } return a.f7proxy = t, s.on(e, a, i) }, l.prototype.off = function (e, t) { var i = this; return i.eventsListeners ? (e.split(" ").forEach((function (e) { void 0 === t ? i.eventsListeners[e] = [] : i.eventsListeners[e] && i.eventsListeners[e].length && i.eventsListeners[e].forEach((function (s, a) { (s === t || s.f7proxy && s.f7proxy === t) && i.eventsListeners[e].splice(a, 1) })) })), i) : i }, l.prototype.emit = function () { for (var e = [], t = arguments.length; t--;)e[t] = arguments[t]; var i, s, a, r = this; if (!r.eventsListeners) return r; "string" == typeof e[0] || Array.isArray(e[0]) ? (i = e[0], s = e.slice(1, e.length), a = r) : (i = e[0].events, s = e[0].data, a = e[0].context || r); var n = Array.isArray(i) ? i : i.split(" "); return n.forEach((function (e) { if (r.eventsListeners && r.eventsListeners[e]) { var t = []; r.eventsListeners[e].forEach((function (e) { t.push(e) })), t.forEach((function (e) { e.apply(a, s) })) } })), r }, l.prototype.useModulesParams = function (e) { var t = this; t.modules && Object.keys(t.modules).forEach((function (i) { var s = t.modules[i]; s.params && n.extend(e, s.params) })) }, l.prototype.useModules = function (e) { void 0 === e && (e = {}); var t = this; t.modules && Object.keys(t.modules).forEach((function (i) { var s = t.modules[i], a = e[i] || {}; s.instance && Object.keys(s.instance).forEach((function (e) { var i = s.instance[e]; t[e] = "function" == typeof i ? i.bind(t) : i })), s.on && t.on && Object.keys(s.on).forEach((function (e) { t.on(e, s.on[e]) })), s.create && s.create.bind(t)(a) })) }, d.components.set = function (e) { this.use && this.use(e) }, l.installModule = function (e) { for (var t = [], i = arguments.length - 1; i-- > 0;)t[i] = arguments[i + 1]; var s = this; s.prototype.modules || (s.prototype.modules = {}); var a = e.name || Object.keys(s.prototype.modules).length + "_" + n.now(); return s.prototype.modules[a] = e, e.proto && Object.keys(e.proto).forEach((function (t) { s.prototype[t] = e.proto[t] })), e.static && Object.keys(e.static).forEach((function (t) { s[t] = e.static[t] })), e.install && e.install.apply(s, t), s }, l.use = function (e) { for (var t = [], i = arguments.length - 1; i-- > 0;)t[i] = arguments[i + 1]; var s = this; return Array.isArray(e) ? (e.forEach((function (e) { return s.installModule(e) })), s) : s.installModule.apply(s, [e].concat(t)) }, Object.defineProperties(l, d); var h = { updateSize: function () { var e, t, i = this.$el; e = void 0 !== this.params.width ? this.params.width : i[0].clientWidth, t = void 0 !== this.params.height ? this.params.height : i[0].clientHeight, 0 === e && this.isHorizontal() || 0 === t && this.isVertical() || (e = e - parseInt(i.css("padding-left"), 10) - parseInt(i.css("padding-right"), 10), t = t - parseInt(i.css("padding-top"), 10) - parseInt(i.css("padding-bottom"), 10), n.extend(this, { width: e, height: t, size: this.isHorizontal() ? e : t })) }, updateSlides: function () { var e = this.params, i = this.$wrapperEl, s = this.size, a = this.rtlTranslate, r = this.wrongRTL, o = this.virtual && e.virtual.enabled, l = o ? this.virtual.slides.length : this.slides.length, d = i.children("." + this.params.slideClass), h = o ? this.virtual.slides.length : d.length, p = [], c = [], u = []; function v(t) { return !e.cssMode || t !== d.length - 1 } var f = e.slidesOffsetBefore; "function" == typeof f && (f = e.slidesOffsetBefore.call(this)); var m = e.slidesOffsetAfter; "function" == typeof m && (m = e.slidesOffsetAfter.call(this)); var g = this.snapGrid.length, b = this.snapGrid.length, w = e.spaceBetween, y = -f, x = 0, E = 0; if (void 0 !== s) { var T, C; "string" == typeof w && w.indexOf("%") >= 0 && (w = parseFloat(w.replace("%", "")) / 100 * s), this.virtualSize = -w, a ? d.css({ marginLeft: "", marginTop: "" }) : d.css({ marginRight: "", marginBottom: "" }), e.slidesPerColumn > 1 && (T = Math.floor(h / e.slidesPerColumn) === h / this.params.slidesPerColumn ? h : Math.ceil(h / e.slidesPerColumn) * e.slidesPerColumn, "auto" !== e.slidesPerView && "row" === e.slidesPerColumnFill && (T = Math.max(T, e.slidesPerView * e.slidesPerColumn))); for (var S, M = e.slidesPerColumn, P = T / M, z = Math.floor(h / e.slidesPerColumn), k = 0; k < h; k += 1) { C = 0; var $ = d.eq(k); if (e.slidesPerColumn > 1) { var L = void 0, I = void 0, D = void 0; if ("row" === e.slidesPerColumnFill && e.slidesPerGroup > 1) { var O = Math.floor(k / (e.slidesPerGroup * e.slidesPerColumn)), A = k - e.slidesPerColumn * e.slidesPerGroup * O; L = (I = A - (D = Math.floor(A / e.slidesPerColumn)) * e.slidesPerGroup + O * e.slidesPerGroup) + D * T / M, $.css({ "-webkit-box-ordinal-group": L, "-moz-box-ordinal-group": L, "-ms-flex-order": L, "-webkit-order": L, order: L }) } else "column" === e.slidesPerColumnFill ? (D = k - (I = Math.floor(k / M)) * M, (I > z || I === z && D === M - 1) && (D += 1) >= M && (D = 0, I += 1)) : I = k - (D = Math.floor(k / P)) * P; $.css("margin-" + (this.isHorizontal() ? "top" : "left"), 0 !== D && e.spaceBetween && e.spaceBetween + "px") } if ("none" !== $.css("display")) { if ("auto" === e.slidesPerView) { var H = t.getComputedStyle($[0], null), G = $[0].style.transform, N = $[0].style.webkitTransform; if (G && ($[0].style.transform = "none"), N && ($[0].style.webkitTransform = "none"), e.roundLengths) C = this.isHorizontal() ? $.outerWidth(!0) : $.outerHeight(!0); else if (this.isHorizontal()) { var B = parseFloat(H.getPropertyValue("width")), V = parseFloat(H.getPropertyValue("padding-left")), X = parseFloat(H.getPropertyValue("padding-right")), Y = parseFloat(H.getPropertyValue("margin-left")), F = parseFloat(H.getPropertyValue("margin-right")), R = H.getPropertyValue("box-sizing"); C = R && "border-box" === R ? B + Y + F : B + V + X + Y + F } else { var q = parseFloat(H.getPropertyValue("height")), W = parseFloat(H.getPropertyValue("padding-top")), j = parseFloat(H.getPropertyValue("padding-bottom")), U = parseFloat(H.getPropertyValue("margin-top")), K = parseFloat(H.getPropertyValue("margin-bottom")), _ = H.getPropertyValue("box-sizing"); C = _ && "border-box" === _ ? q + U + K : q + W + j + U + K } G && ($[0].style.transform = G), N && ($[0].style.webkitTransform = N), e.roundLengths && (C = Math.floor(C)) } else C = (s - (e.slidesPerView - 1) * w) / e.slidesPerView, e.roundLengths && (C = Math.floor(C)), d[k] && (this.isHorizontal() ? d[k].style.width = C + "px" : d[k].style.height = C + "px"); d[k] && (d[k].swiperSlideSize = C), u.push(C), e.centeredSlides ? (y = y + C / 2 + x / 2 + w, 0 === x && 0 !== k && (y = y - s / 2 - w), 0 === k && (y = y - s / 2 - w), Math.abs(y) < .001 && (y = 0), e.roundLengths && (y = Math.floor(y)), E % e.slidesPerGroup == 0 && p.push(y), c.push(y)) : (e.roundLengths && (y = Math.floor(y)), E % e.slidesPerGroup == 0 && p.push(y), c.push(y), y = y + C + w), this.virtualSize += C + w, x = C, E += 1 } } if (this.virtualSize = Math.max(this.virtualSize, s) + m, a && r && ("slide" === e.effect || "coverflow" === e.effect) && i.css({ width: this.virtualSize + e.spaceBetween + "px" }), e.setWrapperSize && (this.isHorizontal() ? i.css({ width: this.virtualSize + e.spaceBetween + "px" }) : i.css({ height: this.virtualSize + e.spaceBetween + "px" })), e.slidesPerColumn > 1 && (this.virtualSize = (C + e.spaceBetween) * T, this.virtualSize = Math.ceil(this.virtualSize / e.slidesPerColumn) - e.spaceBetween, this.isHorizontal() ? i.css({ width: this.virtualSize + e.spaceBetween + "px" }) : i.css({ height: this.virtualSize + e.spaceBetween + "px" }), e.centeredSlides)) { S = []; for (var Z = 0; Z < p.length; Z += 1) { var Q = p[Z]; e.roundLengths && (Q = Math.floor(Q)), p[Z] < this.virtualSize + p[0] && S.push(Q) } p = S } if (!e.centeredSlides) { S = []; for (var J = 0; J < p.length; J += 1) { var ee = p[J]; e.roundLengths && (ee = Math.floor(ee)), p[J] <= this.virtualSize - s && S.push(ee) } p = S, Math.floor(this.virtualSize - s) - Math.floor(p[p.length - 1]) > 1 && p.push(this.virtualSize - s) } if (0 === p.length && (p = [0]), 0 !== e.spaceBetween && (this.isHorizontal() ? a ? d.filter(v).css({ marginLeft: w + "px" }) : d.filter(v).css({ marginRight: w + "px" }) : d.filter(v).css({ marginBottom: w + "px" })), e.centerInsufficientSlides) { var te = 0; if (u.forEach((function (t) { te += t + (e.spaceBetween ? e.spaceBetween : 0) })), (te -= e.spaceBetween) < s) { var ie = (s - te) / 2; p.forEach((function (e, t) { p[t] = e - ie })), c.forEach((function (e, t) { c[t] = e + ie })) } } n.extend(this, { slides: d, snapGrid: p, slidesGrid: c, slidesSizesGrid: u }), h !== l && this.emit("slidesLengthChange"), p.length !== g && (this.params.watchOverflow && this.checkOverflow(), this.emit("snapGridLengthChange")), c.length !== b && this.emit("slidesGridLengthChange"), (e.watchSlidesProgress || e.watchSlidesVisibility) && this.updateSlidesOffset() } }, updateAutoHeight: function (e) { var t, i = [], s = 0; if ("number" == typeof e ? this.setTransition(e) : !0 === e && this.setTransition(this.params.speed), "auto" !== this.params.slidesPerView && this.params.slidesPerView > 1) for (t = 0; t < Math.ceil(this.params.slidesPerView); t += 1) { var a = this.activeIndex + t; if (a > this.slides.length) break; i.push(this.slides.eq(a)[0]) } else i.push(this.slides.eq(this.activeIndex)[0]); for (t = 0; t < i.length; t += 1)if (void 0 !== i[t]) { var r = i[t].offsetHeight; s = r > s ? r : s } s && this.$wrapperEl.css("height", s + "px") }, updateSlidesOffset: function () { for (var e = this.slides, t = 0; t < e.length; t += 1)e[t].swiperSlideOffset = this.isHorizontal() ? e[t].offsetLeft : e[t].offsetTop }, updateSlidesProgress: function (e) { void 0 === e && (e = this && this.translate || 0); var t = this.params, i = this.slides, a = this.rtlTranslate; if (0 !== i.length) { void 0 === i[0].swiperSlideOffset && this.updateSlidesOffset(); var r = -e; a && (r = e), i.removeClass(t.slideVisibleClass), this.visibleSlidesIndexes = [], this.visibleSlides = []; for (var n = 0; n < i.length; n += 1) { var o = i[n], l = (r + (t.centeredSlides ? this.minTranslate() : 0) - o.swiperSlideOffset) / (o.swiperSlideSize + t.spaceBetween); if (t.watchSlidesVisibility) { var d = -(r - o.swiperSlideOffset), h = d + this.slidesSizesGrid[n]; (d >= 0 && d < this.size - 1 || h > 1 && h <= this.size || d <= 0 && h >= this.size) && (this.visibleSlides.push(o), this.visibleSlidesIndexes.push(n), i.eq(n).addClass(t.slideVisibleClass)) } o.progress = a ? -l : l } this.visibleSlides = s(this.visibleSlides) } }, updateProgress: function (e) { if (void 0 === e) { var t = this.rtlTranslate ? -1 : 1; e = this && this.translate && this.translate * t || 0 } var i = this.params, s = this.maxTranslate() - this.minTranslate(), a = this.progress, r = this.isBeginning, o = this.isEnd, l = r, d = o; 0 === s ? (a = 0, r = !0, o = !0) : (r = (a = (e - this.minTranslate()) / s) <= 0, o = a >= 1), n.extend(this, { progress: a, isBeginning: r, isEnd: o }), (i.watchSlidesProgress || i.watchSlidesVisibility) && this.updateSlidesProgress(e), r && !l && this.emit("reachBeginning toEdge"), o && !d && this.emit("reachEnd toEdge"), (l && !r || d && !o) && this.emit("fromEdge"), this.emit("progress", a) }, updateSlidesClasses: function () { var e, t = this.slides, i = this.params, s = this.$wrapperEl, a = this.activeIndex, r = this.realIndex, n = this.virtual && i.virtual.enabled; t.removeClass(i.slideActiveClass + " " + i.slideNextClass + " " + i.slidePrevClass + " " + i.slideDuplicateActiveClass + " " + i.slideDuplicateNextClass + " " + i.slideDuplicatePrevClass), (e = n ? this.$wrapperEl.find("." + i.slideClass + '[data-swiper-slide-index="' + a + '"]') : t.eq(a)).addClass(i.slideActiveClass), i.loop && (e.hasClass(i.slideDuplicateClass) ? s.children("." + i.slideClass + ":not(." + i.slideDuplicateClass + ')[data-swiper-slide-index="' + r + '"]').addClass(i.slideDuplicateActiveClass) : s.children("." + i.slideClass + "." + i.slideDuplicateClass + '[data-swiper-slide-index="' + r + '"]').addClass(i.slideDuplicateActiveClass)); var o = e.nextAll("." + i.slideClass).eq(0).addClass(i.slideNextClass); i.loop && 0 === o.length && (o = t.eq(0)).addClass(i.slideNextClass); var l = e.prevAll("." + i.slideClass).eq(0).addClass(i.slidePrevClass); i.loop && 0 === l.length && (l = t.eq(-1)).addClass(i.slidePrevClass), i.loop && (o.hasClass(i.slideDuplicateClass) ? s.children("." + i.slideClass + ":not(." + i.slideDuplicateClass + ')[data-swiper-slide-index="' + o.attr("data-swiper-slide-index") + '"]').addClass(i.slideDuplicateNextClass) : s.children("." + i.slideClass + "." + i.slideDuplicateClass + '[data-swiper-slide-index="' + o.attr("data-swiper-slide-index") + '"]').addClass(i.slideDuplicateNextClass), l.hasClass(i.slideDuplicateClass) ? s.children("." + i.slideClass + ":not(." + i.slideDuplicateClass + ')[data-swiper-slide-index="' + l.attr("data-swiper-slide-index") + '"]').addClass(i.slideDuplicatePrevClass) : s.children("." + i.slideClass + "." + i.slideDuplicateClass + '[data-swiper-slide-index="' + l.attr("data-swiper-slide-index") + '"]').addClass(i.slideDuplicatePrevClass)) }, updateActiveIndex: function (e) { var t, i = this.rtlTranslate ? this.translate : -this.translate, s = this.slidesGrid, a = this.snapGrid, r = this.params, o = this.activeIndex, l = this.realIndex, d = this.snapIndex, h = e; if (void 0 === h) { for (var p = 0; p < s.length; p += 1)void 0 !== s[p + 1] ? i >= s[p] && i < s[p + 1] - (s[p + 1] - s[p]) / 2 ? h = p : i >= s[p] && i < s[p + 1] && (h = p + 1) : i >= s[p] && (h = p); r.normalizeSlideIndex && (h < 0 || void 0 === h) && (h = 0) } if ((t = a.indexOf(i) >= 0 ? a.indexOf(i) : Math.floor(h / r.slidesPerGroup)) >= a.length && (t = a.length - 1), h !== o) { var c = parseInt(this.slides.eq(h).attr("data-swiper-slide-index") || h, 10); n.extend(this, { snapIndex: t, realIndex: c, previousIndex: o, activeIndex: h }), this.emit("activeIndexChange"), this.emit("snapIndexChange"), l !== c && this.emit("realIndexChange"), (this.initialized || this.runCallbacksOnInit) && this.emit("slideChange") } else t !== d && (this.snapIndex = t, this.emit("snapIndexChange")) }, updateClickedSlide: function (e) { var t = this.params, i = s(e.target).closest("." + t.slideClass)[0], a = !1; if (i) for (var r = 0; r < this.slides.length; r += 1)this.slides[r] === i && (a = !0); if (!i || !a) return this.clickedSlide = void 0, void (this.clickedIndex = void 0); this.clickedSlide = i, this.virtual && this.params.virtual.enabled ? this.clickedIndex = parseInt(s(i).attr("data-swiper-slide-index"), 10) : this.clickedIndex = s(i).index(), t.slideToClickedSlide && void 0 !== this.clickedIndex && this.clickedIndex !== this.activeIndex && this.slideToClickedSlide() } }; var p = { getTranslate: function (e) { void 0 === e && (e = this.isHorizontal() ? "x" : "y"); var t = this.params, i = this.rtlTranslate, s = this.translate, a = this.$wrapperEl; if (t.virtualTranslate) return i ? -s : s; if (t.cssMode) return s; var r = n.getTranslate(a[0], e); return i && (r = -r), r || 0 }, setTranslate: function (e, t) { var i = this.rtlTranslate, s = this.params, a = this.$wrapperEl, r = this.wrapperEl, n = this.progress, o = 0, l = 0; this.isHorizontal() ? o = i ? -e : e : l = e, s.roundLengths && (o = Math.floor(o), l = Math.floor(l)), s.cssMode ? r[this.isHorizontal() ? "scrollLeft" : "scrollTop"] = this.isHorizontal() ? -o : -l : s.virtualTranslate || a.transform("translate3d(" + o + "px, " + l + "px, 0px)"), this.previousTranslate = this.translate, this.translate = this.isHorizontal() ? o : l; var d = this.maxTranslate() - this.minTranslate(); (0 === d ? 0 : (e - this.minTranslate()) / d) !== n && this.updateProgress(e), this.emit("setTranslate", this.translate, t) }, minTranslate: function () { return -this.snapGrid[0] }, maxTranslate: function () { return -this.snapGrid[this.snapGrid.length - 1] } }; var c = { setTransition: function (e, t) { this.params.cssMode || this.$wrapperEl.transition(e), this.emit("setTransition", e, t) }, transitionStart: function (e, t) { void 0 === e && (e = !0); var i = this.activeIndex, s = this.params, a = this.previousIndex; if (!s.cssMode) { s.autoHeight && this.updateAutoHeight(); var r = t; if (r || (r = i > a ? "next" : i < a ? "prev" : "reset"), this.emit("transitionStart"), e && i !== a) { if ("reset" === r) return void this.emit("slideResetTransitionStart"); this.emit("slideChangeTransitionStart"), "next" === r ? this.emit("slideNextTransitionStart") : this.emit("slidePrevTransitionStart") } } }, transitionEnd: function (e, t) { void 0 === e && (e = !0); var i = this.activeIndex, s = this.previousIndex, a = this.params; if (this.animating = !1, !a.cssMode) { this.setTransition(0); var r = t; if (r || (r = i > s ? "next" : i < s ? "prev" : "reset"), this.emit("transitionEnd"), e && i !== s) { if ("reset" === r) return void this.emit("slideResetTransitionEnd"); this.emit("slideChangeTransitionEnd"), "next" === r ? this.emit("slideNextTransitionEnd") : this.emit("slidePrevTransitionEnd") } } } }; var u = { slideTo: function (e, t, i, s) { var a; void 0 === e && (e = 0), void 0 === t && (t = this.params.speed), void 0 === i && (i = !0); var r = this, n = e; n < 0 && (n = 0); var o = r.params, l = r.snapGrid, d = r.slidesGrid, h = r.previousIndex, p = r.activeIndex, c = r.rtlTranslate, u = r.wrapperEl; if (r.animating && o.preventInteractionOnTransition) return !1; var v = Math.floor(n / o.slidesPerGroup); v >= l.length && (v = l.length - 1), (p || o.initialSlide || 0) === (h || 0) && i && r.emit("beforeSlideChangeStart"); var f, m = -l[v]; if (r.updateProgress(m), o.normalizeSlideIndex) for (var g = 0; g < d.length; g += 1)-Math.floor(100 * m) >= Math.floor(100 * d[g]) && (n = g); if (r.initialized && n !== p) { if (!r.allowSlideNext && m < r.translate && m < r.minTranslate()) return !1; if (!r.allowSlidePrev && m > r.translate && m > r.maxTranslate() && (p || 0) !== n) return !1 } if (f = n > p ? "next" : n < p ? "prev" : "reset", c && -m === r.translate || !c && m === r.translate) return r.updateActiveIndex(n), o.autoHeight && r.updateAutoHeight(), r.updateSlidesClasses(), "slide" !== o.effect && r.setTranslate(m), "reset" !== f && (r.transitionStart(i, f), r.transitionEnd(i, f)), !1; if (o.cssMode) { var b = r.isHorizontal(); return 0 === t ? u[b ? "scrollLeft" : "scrollTop"] = -m : u.scrollTo ? u.scrollTo(((a = {})[b ? "left" : "top"] = -m, a.behavior = "smooth", a)) : u[b ? "scrollLeft" : "scrollTop"] = -m, !0 } return 0 === t ? (r.setTransition(0), r.setTranslate(m), r.updateActiveIndex(n), r.updateSlidesClasses(), r.emit("beforeTransitionStart", t, s), r.transitionStart(i, f), r.transitionEnd(i, f)) : (r.setTransition(t), r.setTranslate(m), r.updateActiveIndex(n), r.updateSlidesClasses(), r.emit("beforeTransitionStart", t, s), r.transitionStart(i, f), r.animating || (r.animating = !0, r.onSlideToWrapperTransitionEnd || (r.onSlideToWrapperTransitionEnd = function (e) { r && !r.destroyed && e.target === this && (r.$wrapperEl[0].removeEventListener("transitionend", r.onSlideToWrapperTransitionEnd), r.$wrapperEl[0].removeEventListener("webkitTransitionEnd", r.onSlideToWrapperTransitionEnd), r.onSlideToWrapperTransitionEnd = null, delete r.onSlideToWrapperTransitionEnd, r.transitionEnd(i, f)) }), r.$wrapperEl[0].addEventListener("transitionend", r.onSlideToWrapperTransitionEnd), r.$wrapperEl[0].addEventListener("webkitTransitionEnd", r.onSlideToWrapperTransitionEnd))), !0 }, slideToLoop: function (e, t, i, s) { void 0 === e && (e = 0), void 0 === t && (t = this.params.speed), void 0 === i && (i = !0); var a = e; return this.params.loop && (a += this.loopedSlides), this.slideTo(a, t, i, s) }, slideNext: function (e, t, i) { void 0 === e && (e = this.params.speed), void 0 === t && (t = !0); var s = this.params, a = this.animating; return s.loop ? !a && (this.loopFix(), this._clientLeft = this.$wrapperEl[0].clientLeft, this.slideTo(this.activeIndex + s.slidesPerGroup, e, t, i)) : this.slideTo(this.activeIndex + s.slidesPerGroup, e, t, i) }, slidePrev: function (e, t, i) { void 0 === e && (e = this.params.speed), void 0 === t && (t = !0); var s = this.params, a = this.animating, r = this.snapGrid, n = this.slidesGrid, o = this.rtlTranslate; if (s.loop) { if (a) return !1; this.loopFix(), this._clientLeft = this.$wrapperEl[0].clientLeft } function l(e) { return e < 0 ? -Math.floor(Math.abs(e)) : Math.floor(e) } var d, h = l(o ? this.translate : -this.translate), p = r.map((function (e) { return l(e) })), c = (n.map((function (e) { return l(e) })), r[p.indexOf(h)], r[p.indexOf(h) - 1]); return void 0 === c && s.cssMode && r.forEach((function (e) { !c && h >= e && (c = e) })), void 0 !== c && (d = n.indexOf(c)) < 0 && (d = this.activeIndex - 1), this.slideTo(d, e, t, i) }, slideReset: function (e, t, i) { return void 0 === e && (e = this.params.speed), void 0 === t && (t = !0), this.slideTo(this.activeIndex, e, t, i) }, slideToClosest: function (e, t, i) { void 0 === e && (e = this.params.speed), void 0 === t && (t = !0); var s = this.activeIndex, a = Math.floor(s / this.params.slidesPerGroup); if (a < this.snapGrid.length - 1) { var r = this.rtlTranslate ? this.translate : -this.translate, n = this.snapGrid[a]; r - n > (this.snapGrid[a + 1] - n) / 2 && (s = this.params.slidesPerGroup) } return this.slideTo(s, e, t, i) }, slideToClickedSlide: function () { var e, t = this, i = t.params, a = t.$wrapperEl, r = "auto" === i.slidesPerView ? t.slidesPerViewDynamic() : i.slidesPerView, o = t.clickedIndex; if (i.loop) { if (t.animating) return; e = parseInt(s(t.clickedSlide).attr("data-swiper-slide-index"), 10), i.centeredSlides ? o < t.loopedSlides - r / 2 || o > t.slides.length - t.loopedSlides + r / 2 ? (t.loopFix(), o = a.children("." + i.slideClass + '[data-swiper-slide-index="' + e + '"]:not(.' + i.slideDuplicateClass + ")").eq(0).index(), n.nextTick((function () { t.slideTo(o) }))) : t.slideTo(o) : o > t.slides.length - r ? (t.loopFix(), o = a.children("." + i.slideClass + '[data-swiper-slide-index="' + e + '"]:not(.' + i.slideDuplicateClass + ")").eq(0).index(), n.nextTick((function () { t.slideTo(o) }))) : t.slideTo(o) } else t.slideTo(o) } }; var v = { loopCreate: function () { var t = this, i = t.params, a = t.$wrapperEl; a.children("." + i.slideClass + "." + i.slideDuplicateClass).remove(); var r = a.children("." + i.slideClass); if (i.loopFillGroupWithBlank) { var n = i.slidesPerGroup - r.length % i.slidesPerGroup; if (n !== i.slidesPerGroup) { for (var o = 0; o < n; o += 1) { var l = s(e.createElement("div")).addClass(i.slideClass + " " + i.slideBlankClass); a.append(l) } r = a.children("." + i.slideClass) } } "auto" !== i.slidesPerView || i.loopedSlides || (i.loopedSlides = r.length), t.loopedSlides = parseInt(i.loopedSlides || i.slidesPerView, 10), t.loopedSlides += i.loopAdditionalSlides, t.loopedSlides > r.length && (t.loopedSlides = r.length); var d = [], h = []; r.each((function (e, i) { var a = s(i); e < t.loopedSlides && h.push(i), e < r.length && e >= r.length - t.loopedSlides && d.push(i), a.attr("data-swiper-slide-index", e) })); for (var p = 0; p < h.length; p += 1)a.append(s(h[p].cloneNode(!0)).addClass(i.slideDuplicateClass)); for (var c = d.length - 1; c >= 0; c -= 1)a.prepend(s(d[c].cloneNode(!0)).addClass(i.slideDuplicateClass)) }, loopFix: function () { var e, t = this.params, i = this.activeIndex, s = this.slides, a = this.loopedSlides, r = this.allowSlidePrev, n = this.allowSlideNext, o = this.snapGrid, l = this.rtlTranslate; this.allowSlidePrev = !0, this.allowSlideNext = !0; var d = -o[i] - this.getTranslate(); if (i < a) e = s.length - 3 * a + i, e += a, this.slideTo(e, 0, !1, !0) && 0 !== d && this.setTranslate((l ? -this.translate : this.translate) - d); else if ("auto" === t.slidesPerView && i >= 2 * a || i >= s.length - a) { e = -s.length + i + a, e += a, this.slideTo(e, 0, !1, !0) && 0 !== d && this.setTranslate((l ? -this.translate : this.translate) - d) } this.allowSlidePrev = r, this.allowSlideNext = n }, loopDestroy: function () { var e = this.$wrapperEl, t = this.params, i = this.slides; e.children("." + t.slideClass + "." + t.slideDuplicateClass + ",." + t.slideClass + "." + t.slideBlankClass).remove(), i.removeAttr("data-swiper-slide-index") } }; var f = { setGrabCursor: function (e) { if (!(o.touch || !this.params.simulateTouch || this.params.watchOverflow && this.isLocked || this.params.cssMode)) { var t = this.el; t.style.cursor = "move", t.style.cursor = e ? "-webkit-grabbing" : "-webkit-grab", t.style.cursor = e ? "-moz-grabbin" : "-moz-grab", t.style.cursor = e ? "grabbing" : "grab" } }, unsetGrabCursor: function () { o.touch || this.params.watchOverflow && this.isLocked || this.params.cssMode || (this.el.style.cursor = "") } }; var m = { appendSlide: function (e) { var t = this.$wrapperEl, i = this.params; if (i.loop && this.loopDestroy(), "object" == typeof e && "length" in e) for (var s = 0; s < e.length; s += 1)e[s] && t.append(e[s]); else t.append(e); i.loop && this.loopCreate(), i.observer && o.observer || this.update() }, prependSlide: function (e) { var t = this.params, i = this.$wrapperEl, s = this.activeIndex; t.loop && this.loopDestroy(); var a = s + 1; if ("object" == typeof e && "length" in e) { for (var r = 0; r < e.length; r += 1)e[r] && i.prepend(e[r]); a = s + e.length } else i.prepend(e); t.loop && this.loopCreate(), t.observer && o.observer || this.update(), this.slideTo(a, 0, !1) }, addSlide: function (e, t) { var i = this.$wrapperEl, s = this.params, a = this.activeIndex; s.loop && (a -= this.loopedSlides, this.loopDestroy(), this.slides = i.children("." + s.slideClass)); var r = this.slides.length; if (e <= 0) this.prependSlide(t); else if (e >= r) this.appendSlide(t); else { for (var n = a > e ? a + 1 : a, l = [], d = r - 1; d >= e; d -= 1) { var h = this.slides.eq(d); h.remove(), l.unshift(h) } if ("object" == typeof t && "length" in t) { for (var p = 0; p < t.length; p += 1)t[p] && i.append(t[p]); n = a > e ? a + t.length : a } else i.append(t); for (var c = 0; c < l.length; c += 1)i.append(l[c]); s.loop && this.loopCreate(), s.observer && o.observer || this.update(), s.loop ? this.slideTo(n + this.loopedSlides, 0, !1) : this.slideTo(n, 0, !1) } }, removeSlide: function (e) { var t = this.params, i = this.$wrapperEl, s = this.activeIndex; t.loop && (s -= this.loopedSlides, this.loopDestroy(), this.slides = i.children("." + t.slideClass)); var a, r = s; if ("object" == typeof e && "length" in e) { for (var n = 0; n < e.length; n += 1)a = e[n], this.slides[a] && this.slides.eq(a).remove(), a < r && (r -= 1); r = Math.max(r, 0) } else a = e, this.slides[a] && this.slides.eq(a).remove(), a < r && (r -= 1), r = Math.max(r, 0); t.loop && this.loopCreate(), t.observer && o.observer || this.update(), t.loop ? this.slideTo(r + this.loopedSlides, 0, !1) : this.slideTo(r, 0, !1) }, removeAllSlides: function () { for (var e = [], t = 0; t < this.slides.length; t += 1)e.push(t); this.removeSlide(e) } }, g = function () { var i = t.navigator.userAgent, s = { ios: !1, android: !1, androidChrome: !1, desktop: !1, windows: !1, iphone: !1, ipod: !1, ipad: !1, cordova: t.cordova || t.phonegap, phonegap: t.cordova || t.phonegap }, a = i.match(/(Windows Phone);?[\s\/]+([\d.]+)?/), r = i.match(/(Android);?[\s\/]+([\d.]+)?/), n = i.match(/(iPad).*OS\s([\d_]+)/), o = i.match(/(iPod)(.*OS\s([\d_]+))?/), l = !n && i.match(/(iPhone\sOS|iOS)\s([\d_]+)/); if (a && (s.os = "windows", s.osVersion = a[2], s.windows = !0), r && !a && (s.os = "android", s.osVersion = r[2], s.android = !0, s.androidChrome = i.toLowerCase().indexOf("chrome") >= 0), (n || l || o) && (s.os = "ios", s.ios = !0), l && !o && (s.osVersion = l[2].replace(/_/g, "."), s.iphone = !0), n && (s.osVersion = n[2].replace(/_/g, "."), s.ipad = !0), o && (s.osVersion = o[3] ? o[3].replace(/_/g, ".") : null, s.iphone = !0), s.ios && s.osVersion && i.indexOf("Version/") >= 0 && "10" === s.osVersion.split(".")[0] && (s.osVersion = i.toLowerCase().split("version/")[1].split(" ")[0]), s.desktop = !(s.os || s.android || s.webView), s.webView = (l || n || o) && i.match(/.*AppleWebKit(?!.*Safari)/i), s.os && "ios" === s.os) { var d = s.osVersion.split("."), h = e.querySelector('meta[name="viewport"]'); s.minimalUi = !s.webView && (o || l) && (1 * d[0] == 7 ? 1 * d[1] >= 1 : 1 * d[0] > 7) && h && h.getAttribute("content").indexOf("minimal-ui") >= 0 } return s.pixelRatio = t.devicePixelRatio || 1, s }(); function b(i) { var a = this.touchEventsData, r = this.params, o = this.touches; if (!this.animating || !r.preventInteractionOnTransition) { var l = i; l.originalEvent && (l = l.originalEvent); var d = s(l.target); if (("wrapper" !== r.touchEventsTarget || d.closest(this.wrapperEl).length) && (a.isTouchEvent = "touchstart" === l.type, (a.isTouchEvent || !("which" in l) || 3 !== l.which) && !(!a.isTouchEvent && "button" in l && l.button > 0 || a.isTouched && a.isMoved))) if (r.noSwiping && d.closest(r.noSwipingSelector ? r.noSwipingSelector : "." + r.noSwipingClass)[0]) this.allowClick = !0; else if (!r.swipeHandler || d.closest(r.swipeHandler)[0]) { o.currentX = "touchstart" === l.type ? l.targetTouches[0].pageX : l.pageX, o.currentY = "touchstart" === l.type ? l.targetTouches[0].pageY : l.pageY; var h = o.currentX, p = o.currentY, c = r.edgeSwipeDetection || r.iOSEdgeSwipeDetection, u = r.edgeSwipeThreshold || r.iOSEdgeSwipeThreshold; if (!c || !(h <= u || h >= t.screen.width - u)) { if (n.extend(a, { isTouched: !0, isMoved: !1, allowTouchCallbacks: !0, isScrolling: void 0, startMoving: void 0 }), o.startX = h, o.startY = p, a.touchStartTime = n.now(), this.allowClick = !0, this.updateSize(), this.swipeDirection = void 0, r.threshold > 0 && (a.allowThresholdMove = !1), "touchstart" !== l.type) { var v = !0; d.is(a.formElements) && (v = !1), e.activeElement && s(e.activeElement).is(a.formElements) && e.activeElement !== d[0] && e.activeElement.blur(); var f = v && this.allowTouchMove && r.touchStartPreventDefault; (r.touchStartForcePreventDefault || f) && l.preventDefault() } this.emit("touchStart", l) } } } } function w(t) { var i = this.touchEventsData, a = this.params, r = this.touches, o = this.rtlTranslate, l = t; if (l.originalEvent && (l = l.originalEvent), i.isTouched) { if (!i.isTouchEvent || "mousemove" !== l.type) { var d = "touchmove" === l.type ? l.targetTouches[0].pageX : l.pageX, h = "touchmove" === l.type ? l.targetTouches[0].pageY : l.pageY; if (l.preventedByNestedSwiper) return r.startX = d, void (r.startY = h); if (!this.allowTouchMove) return this.allowClick = !1, void (i.isTouched && (n.extend(r, { startX: d, startY: h, currentX: d, currentY: h }), i.touchStartTime = n.now())); if (i.isTouchEvent && a.touchReleaseOnEdges && !a.loop) if (this.isVertical()) { if (h < r.startY && this.translate <= this.maxTranslate() || h > r.startY && this.translate >= this.minTranslate()) return i.isTouched = !1, void (i.isMoved = !1) } else if (d < r.startX && this.translate <= this.maxTranslate() || d > r.startX && this.translate >= this.minTranslate()) return; if (i.isTouchEvent && e.activeElement && l.target === e.activeElement && s(l.target).is(i.formElements)) return i.isMoved = !0, void (this.allowClick = !1); if (i.allowTouchCallbacks && this.emit("touchMove", l), !(l.targetTouches && l.targetTouches.length > 1)) { r.currentX = d, r.currentY = h; var p = r.currentX - r.startX, c = r.currentY - r.startY; if (!(this.params.threshold && Math.sqrt(Math.pow(p, 2) + Math.pow(c, 2)) < this.params.threshold)) { var u; if (void 0 === i.isScrolling) this.isHorizontal() && r.currentY === r.startY || this.isVertical() && r.currentX === r.startX ? i.isScrolling = !1 : p * p + c * c >= 25 && (u = 180 * Math.atan2(Math.abs(c), Math.abs(p)) / Math.PI, i.isScrolling = this.isHorizontal() ? u > a.touchAngle : 90 - u > a.touchAngle); if (i.isScrolling && this.emit("touchMoveOpposite", l), void 0 === i.startMoving && (r.currentX === r.startX && r.currentY === r.startY || (i.startMoving = !0)), i.isScrolling) i.isTouched = !1; else if (i.startMoving) { this.allowClick = !1, a.cssMode || l.preventDefault(), a.touchMoveStopPropagation && !a.nested && l.stopPropagation(), i.isMoved || (a.loop && this.loopFix(), i.startTranslate = this.getTranslate(), this.setTransition(0), this.animating && this.$wrapperEl.trigger("webkitTransitionEnd transitionend"), i.allowMomentumBounce = !1, !a.grabCursor || !0 !== this.allowSlideNext && !0 !== this.allowSlidePrev || this.setGrabCursor(!0), this.emit("sliderFirstMove", l)), this.emit("sliderMove", l), i.isMoved = !0; var v = this.isHorizontal() ? p : c; r.diff = v, v *= a.touchRatio, o && (v = -v), this.swipeDirection = v > 0 ? "prev" : "next", i.currentTranslate = v + i.startTranslate; var f = !0, m = a.resistanceRatio; if (a.touchReleaseOnEdges && (m = 0), v > 0 && i.currentTranslate > this.minTranslate() ? (f = !1, a.resistance && (i.currentTranslate = this.minTranslate() - 1 + Math.pow(-this.minTranslate() + i.startTranslate + v, m))) : v < 0 && i.currentTranslate < this.maxTranslate() && (f = !1, a.resistance && (i.currentTranslate = this.maxTranslate() + 1 - Math.pow(this.maxTranslate() - i.startTranslate - v, m))), f && (l.preventedByNestedSwiper = !0), !this.allowSlideNext && "next" === this.swipeDirection && i.currentTranslate < i.startTranslate && (i.currentTranslate = i.startTranslate), !this.allowSlidePrev && "prev" === this.swipeDirection && i.currentTranslate > i.startTranslate && (i.currentTranslate = i.startTranslate), a.threshold > 0) { if (!(Math.abs(v) > a.threshold || i.allowThresholdMove)) return void (i.currentTranslate = i.startTranslate); if (!i.allowThresholdMove) return i.allowThresholdMove = !0, r.startX = r.currentX, r.startY = r.currentY, i.currentTranslate = i.startTranslate, void (r.diff = this.isHorizontal() ? r.currentX - r.startX : r.currentY - r.startY) } a.followFinger && !a.cssMode && ((a.freeMode || a.watchSlidesProgress || a.watchSlidesVisibility) && (this.updateActiveIndex(), this.updateSlidesClasses()), a.freeMode && (0 === i.velocities.length && i.velocities.push({ position: r[this.isHorizontal() ? "startX" : "startY"], time: i.touchStartTime }), i.velocities.push({ position: r[this.isHorizontal() ? "currentX" : "currentY"], time: n.now() })), this.updateProgress(i.currentTranslate), this.setTranslate(i.currentTranslate)) } } } } } else i.startMoving && i.isScrolling && this.emit("touchMoveOpposite", l) } function y(e) { var t = this, i = t.touchEventsData, s = t.params, a = t.touches, r = t.rtlTranslate, o = t.$wrapperEl, l = t.slidesGrid, d = t.snapGrid, h = e; if (h.originalEvent && (h = h.originalEvent), i.allowTouchCallbacks && t.emit("touchEnd", h), i.allowTouchCallbacks = !1, !i.isTouched) return i.isMoved && s.grabCursor && t.setGrabCursor(!1), i.isMoved = !1, void (i.startMoving = !1); s.grabCursor && i.isMoved && i.isTouched && (!0 === t.allowSlideNext || !0 === t.allowSlidePrev) && t.setGrabCursor(!1); var p, c = n.now(), u = c - i.touchStartTime; if (t.allowClick && (t.updateClickedSlide(h), t.emit("tap click", h), u < 300 && c - i.lastClickTime < 300 && t.emit("doubleTap doubleClick", h)), i.lastClickTime = n.now(), n.nextTick((function () { t.destroyed || (t.allowClick = !0) })), !i.isTouched || !i.isMoved || !t.swipeDirection || 0 === a.diff || i.currentTranslate === i.startTranslate) return i.isTouched = !1, i.isMoved = !1, void (i.startMoving = !1); if (i.isTouched = !1, i.isMoved = !1, i.startMoving = !1, p = s.followFinger ? r ? t.translate : -t.translate : -i.currentTranslate, !s.cssMode) if (s.freeMode) { if (p < -t.minTranslate()) return void t.slideTo(t.activeIndex); if (p > -t.maxTranslate()) return void (t.slides.length < d.length ? t.slideTo(d.length - 1) : t.slideTo(t.slides.length - 1)); if (s.freeModeMomentum) { if (i.velocities.length > 1) { var v = i.velocities.pop(), f = i.velocities.pop(), m = v.position - f.position, g = v.time - f.time; t.velocity = m / g, t.velocity /= 2, Math.abs(t.velocity) < s.freeModeMinimumVelocity && (t.velocity = 0), (g > 150 || n.now() - v.time > 300) && (t.velocity = 0) } else t.velocity = 0; t.velocity *= s.freeModeMomentumVelocityRatio, i.velocities.length = 0; var b = 1e3 * s.freeModeMomentumRatio, w = t.velocity * b, y = t.translate + w; r && (y = -y); var x, E, T = !1, C = 20 * Math.abs(t.velocity) * s.freeModeMomentumBounceRatio; if (y < t.maxTranslate()) s.freeModeMomentumBounce ? (y + t.maxTranslate() < -C && (y = t.maxTranslate() - C), x = t.maxTranslate(), T = !0, i.allowMomentumBounce = !0) : y = t.maxTranslate(), s.loop && s.centeredSlides && (E = !0); else if (y > t.minTranslate()) s.freeModeMomentumBounce ? (y - t.minTranslate() > C && (y = t.minTranslate() + C), x = t.minTranslate(), T = !0, i.allowMomentumBounce = !0) : y = t.minTranslate(), s.loop && s.centeredSlides && (E = !0); else if (s.freeModeSticky) { for (var S, M = 0; M < d.length; M += 1)if (d[M] > -y) { S = M; break } y = -(y = Math.abs(d[S] - y) < Math.abs(d[S - 1] - y) || "next" === t.swipeDirection ? d[S] : d[S - 1]) } if (E && t.once("transitionEnd", (function () { t.loopFix() })), 0 !== t.velocity) b = r ? Math.abs((-y - t.translate) / t.velocity) : Math.abs((y - t.translate) / t.velocity); else if (s.freeModeSticky) return void t.slideToClosest(); s.freeModeMomentumBounce && T ? (t.updateProgress(x), t.setTransition(b), t.setTranslate(y), t.transitionStart(!0, t.swipeDirection), t.animating = !0, o.transitionEnd((function () { t && !t.destroyed && i.allowMomentumBounce && (t.emit("momentumBounce"), t.setTransition(s.speed), t.setTranslate(x), o.transitionEnd((function () { t && !t.destroyed && t.transitionEnd() }))) }))) : t.velocity ? (t.updateProgress(y), t.setTransition(b), t.setTranslate(y), t.transitionStart(!0, t.swipeDirection), t.animating || (t.animating = !0, o.transitionEnd((function () { t && !t.destroyed && t.transitionEnd() })))) : t.updateProgress(y), t.updateActiveIndex(), t.updateSlidesClasses() } else if (s.freeModeSticky) return void t.slideToClosest(); (!s.freeModeMomentum || u >= s.longSwipesMs) && (t.updateProgress(), t.updateActiveIndex(), t.updateSlidesClasses()) } else { for (var P = 0, z = t.slidesSizesGrid[0], k = 0; k < l.length; k += s.slidesPerGroup)void 0 !== l[k + s.slidesPerGroup] ? p >= l[k] && p < l[k + s.slidesPerGroup] && (P = k, z = l[k + s.slidesPerGroup] - l[k]) : p >= l[k] && (P = k, z = l[l.length - 1] - l[l.length - 2]); var $ = (p - l[P]) / z; if (u > s.longSwipesMs) { if (!s.longSwipes) return void t.slideTo(t.activeIndex); "next" === t.swipeDirection && ($ >= s.longSwipesRatio ? t.slideTo(P + s.slidesPerGroup) : t.slideTo(P)), "prev" === t.swipeDirection && ($ > 1 - s.longSwipesRatio ? t.slideTo(P + s.slidesPerGroup) : t.slideTo(P)) } else { if (!s.shortSwipes) return void t.slideTo(t.activeIndex); "next" === t.swipeDirection && t.slideTo(P + s.slidesPerGroup), "prev" === t.swipeDirection && t.slideTo(P) } } } function x() { var e = this.params, t = this.el; if (!t || 0 !== t.offsetWidth) { e.breakpoints && this.setBreakpoint(); var i = this.allowSlideNext, s = this.allowSlidePrev, a = this.snapGrid; if (this.allowSlideNext = !0, this.allowSlidePrev = !0, this.updateSize(), this.updateSlides(), e.freeMode) { var r = Math.min(Math.max(this.translate, this.maxTranslate()), this.minTranslate()); this.setTranslate(r), this.updateActiveIndex(), this.updateSlidesClasses(), e.autoHeight && this.updateAutoHeight() } else this.updateSlidesClasses(), ("auto" === e.slidesPerView || e.slidesPerView > 1) && this.isEnd && !this.params.centeredSlides ? this.slideTo(this.slides.length - 1, 0, !1, !0) : this.slideTo(this.activeIndex, 0, !1, !0); this.autoplay && this.autoplay.running && this.autoplay.paused && this.autoplay.run(), this.allowSlidePrev = s, this.allowSlideNext = i, this.params.watchOverflow && a !== this.snapGrid && this.checkOverflow() } } function E(e) { this.allowClick || (this.params.preventClicks && e.preventDefault(), this.params.preventClicksPropagation && this.animating && (e.stopPropagation(), e.stopImmediatePropagation())) } function T() { var e = this.wrapperEl; this.previousTranslate = this.translate, this.translate = this.isHorizontal() ? -e.scrollLeft : -e.scrollTop, -0 === this.translate && (this.translate = 0), this.updateActiveIndex(), this.updateSlidesClasses(); var t = this.maxTranslate() - this.minTranslate(); (0 === t ? 0 : (this.translate - this.minTranslate()) / t) !== this.progress && this.updateProgress(this.translate), this.emit("setTranslate", this.translate, !1) } var C, S = { init: !0, direction: "horizontal", touchEventsTarget: "container", initialSlide: 0, speed: 300, cssMode: !1, preventInteractionOnTransition: !1, edgeSwipeDetection: !1, edgeSwipeThreshold: 20, freeMode: !1, freeModeMomentum: !0, freeModeMomentumRatio: 1, freeModeMomentumBounce: !0, freeModeMomentumBounceRatio: 1, freeModeMomentumVelocityRatio: 1, freeModeSticky: !1, freeModeMinimumVelocity: .02, autoHeight: !1, setWrapperSize: !1, virtualTranslate: !1, effect: "slide", breakpoints: void 0, spaceBetween: 0, slidesPerView: 1, slidesPerColumn: 1, slidesPerColumnFill: "column", slidesPerGroup: 1, centeredSlides: !1, slidesOffsetBefore: 0, slidesOffsetAfter: 0, normalizeSlideIndex: !0, centerInsufficientSlides: !1, watchOverflow: !1, roundLengths: !1, touchRatio: 1, touchAngle: 45, simulateTouch: !0, shortSwipes: !0, longSwipes: !0, longSwipesRatio: .5, longSwipesMs: 300, followFinger: !0, allowTouchMove: !0, threshold: 0, touchMoveStopPropagation: !1, touchStartPreventDefault: !0, touchStartForcePreventDefault: !1, touchReleaseOnEdges: !1, uniqueNavElements: !0, resistance: !0, resistanceRatio: .85, watchSlidesProgress: !1, watchSlidesVisibility: !1, grabCursor: !1, preventClicks: !0, preventClicksPropagation: !0, slideToClickedSlide: !1, preloadImages: !0, updateOnImagesReady: !0, loop: !1, loopAdditionalSlides: 0, loopedSlides: null, loopFillGroupWithBlank: !1, allowSlidePrev: !0, allowSlideNext: !0, swipeHandler: null, noSwiping: !0, noSwipingClass: "swiper-no-swiping", noSwipingSelector: null, passiveListeners: !0, containerModifierClass: "swiper-container-", slideClass: "swiper-slide", slideBlankClass: "swiper-slide-invisible-blank", slideActiveClass: "swiper-slide-active", slideDuplicateActiveClass: "swiper-slide-duplicate-active", slideVisibleClass: "swiper-slide-visible", slideDuplicateClass: "swiper-slide-duplicate", slideNextClass: "swiper-slide-next", slideDuplicateNextClass: "swiper-slide-duplicate-next", slidePrevClass: "swiper-slide-prev", slideDuplicatePrevClass: "swiper-slide-duplicate-prev", wrapperClass: "swiper-wrapper", runCallbacksOnInit: !0 }, M = { update: h, translate: p, transition: c, slide: u, loop: v, grabCursor: f, manipulation: m, events: { attachEvents: function () { var t = this.params, i = this.touchEvents, s = this.el, a = this.wrapperEl; this.onTouchStart = b.bind(this), this.onTouchMove = w.bind(this), this.onTouchEnd = y.bind(this), t.cssMode && (this.onScroll = T.bind(this)), this.onClick = E.bind(this); var r = !!t.nested; if (o.touch || !o.pointerEvents && !o.prefixedPointerEvents) { if (o.touch) { var n = !("touchstart" !== i.start || !o.passiveListener || !t.passiveListeners) && { passive: !0, capture: !1 }; s.addEventListener(i.start, this.onTouchStart, n), s.addEventListener(i.move, this.onTouchMove, o.passiveListener ? { passive: !1, capture: r } : r), s.addEventListener(i.end, this.onTouchEnd, n), i.cancel && s.addEventListener(i.cancel, this.onTouchEnd, n) } (t.simulateTouch && !g.ios && !g.android || t.simulateTouch && !o.touch && g.ios) && (s.addEventListener("mousedown", this.onTouchStart, !1), e.addEventListener("mousemove", this.onTouchMove, r), e.addEventListener("mouseup", this.onTouchEnd, !1)) } else s.addEventListener(i.start, this.onTouchStart, !1), e.addEventListener(i.move, this.onTouchMove, r), e.addEventListener(i.end, this.onTouchEnd, !1); (t.preventClicks || t.preventClicksPropagation) && s.addEventListener("click", this.onClick, !0), t.cssMode && a.addEventListener("scroll", this.onScroll), this.on(g.ios || g.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", x, !0) }, detachEvents: function () { var t = this.params, i = this.touchEvents, s = this.el, a = this.wrapperEl, r = !!t.nested; if (o.touch || !o.pointerEvents && !o.prefixedPointerEvents) { if (o.touch) { var n = !("onTouchStart" !== i.start || !o.passiveListener || !t.passiveListeners) && { passive: !0, capture: !1 }; s.removeEventListener(i.start, this.onTouchStart, n), s.removeEventListener(i.move, this.onTouchMove, r), s.removeEventListener(i.end, this.onTouchEnd, n), i.cancel && s.removeEventListener(i.cancel, this.onTouchEnd, n) } (t.simulateTouch && !g.ios && !g.android || t.simulateTouch && !o.touch && g.ios) && (s.removeEventListener("mousedown", this.onTouchStart, !1), e.removeEventListener("mousemove", this.onTouchMove, r), e.removeEventListener("mouseup", this.onTouchEnd, !1)) } else s.removeEventListener(i.start, this.onTouchStart, !1), e.removeEventListener(i.move, this.onTouchMove, r), e.removeEventListener(i.end, this.onTouchEnd, !1); (t.preventClicks || t.preventClicksPropagation) && s.removeEventListener("click", this.onClick, !0), t.cssMode && a.removeEventListener("scroll", this.onScroll), this.off(g.ios || g.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", x) } }, breakpoints: { setBreakpoint: function () { var e = this.activeIndex, t = this.initialized, i = this.loopedSlides; void 0 === i && (i = 0); var s = this.params, a = this.$el, r = s.breakpoints; if (r && (!r || 0 !== Object.keys(r).length)) { var o = this.getBreakpoint(r); if (o && this.currentBreakpoint !== o) { var l = o in r ? r[o] : void 0; l && ["slidesPerView", "spaceBetween", "slidesPerGroup", "slidesPerColumn"].forEach((function (e) { var t = l[e]; void 0 !== t && (l[e] = "slidesPerView" !== e || "AUTO" !== t && "auto" !== t ? "slidesPerView" === e ? parseFloat(t) : parseInt(t, 10) : "auto") })); var d = l || this.originalParams, h = s.slidesPerColumn > 1, p = d.slidesPerColumn > 1; h && !p ? a.removeClass(s.containerModifierClass + "multirow " + s.containerModifierClass + "multirow-column") : !h && p && (a.addClass(s.containerModifierClass + "multirow"), "column" === d.slidesPerColumnFill && a.addClass(s.containerModifierClass + "multirow-column")); var c = d.direction && d.direction !== s.direction, u = s.loop && (d.slidesPerView !== s.slidesPerView || c); c && t && this.changeDirection(), n.extend(this.params, d), n.extend(this, { allowTouchMove: this.params.allowTouchMove, allowSlideNext: this.params.allowSlideNext, allowSlidePrev: this.params.allowSlidePrev }), this.currentBreakpoint = o, u && t && (this.loopDestroy(), this.loopCreate(), this.updateSlides(), this.slideTo(e - i + this.loopedSlides, 0, !1)), this.emit("breakpoint", d) } } }, getBreakpoint: function (e) { if (e) { var i = !1, s = []; Object.keys(e).forEach((function (e) { s.push(e) })), s.sort((function (e, t) { return parseInt(e, 10) - parseInt(t, 10) })); for (var a = 0; a < s.length; a += 1) { var r = s[a]; r <= t.innerWidth && (i = r) } return i || "max" } } }, checkOverflow: { checkOverflow: function () { var e = this.isLocked; this.isLocked = 1 === this.snapGrid.length, this.allowSlideNext = !this.isLocked, this.allowSlidePrev = !this.isLocked, e !== this.isLocked && this.emit(this.isLocked ? "lock" : "unlock"), e && e !== this.isLocked && (this.isEnd = !1, this.navigation.update()) } }, classes: { addClasses: function () { var e = this.classNames, t = this.params, i = this.rtl, s = this.$el, a = []; a.push("initialized"), a.push(t.direction), t.freeMode && a.push("free-mode"), t.autoHeight && a.push("autoheight"), i && a.push("rtl"), t.slidesPerColumn > 1 && (a.push("multirow"), "column" === t.slidesPerColumnFill && a.push("multirow-column")), g.android && a.push("android"), g.ios && a.push("ios"), t.cssMode && a.push("css-mode"), a.forEach((function (i) { e.push(t.containerModifierClass + i) })), s.addClass(e.join(" ")) }, removeClasses: function () { var e = this.$el, t = this.classNames; e.removeClass(t.join(" ")) } }, images: { loadImage: function (e, i, s, a, r, n) { var o; function l() { n && n() } e.complete && r ? l() : i ? ((o = new t.Image).onload = l, o.onerror = l, a && (o.sizes = a), s && (o.srcset = s), i && (o.src = i)) : l() }, preloadImages: function () { var e = this; function t() { null != e && e && !e.destroyed && (void 0 !== e.imagesLoaded && (e.imagesLoaded += 1), e.imagesLoaded === e.imagesToLoad.length && (e.params.updateOnImagesReady && e.update(), e.emit("imagesReady"))) } e.imagesToLoad = e.$el.find("img"); for (var i = 0; i < e.imagesToLoad.length; i += 1) { var s = e.imagesToLoad[i]; e.loadImage(s, s.currentSrc || s.getAttribute("src"), s.srcset || s.getAttribute("srcset"), s.sizes || s.getAttribute("sizes"), !0, t) } } } }, P = {}, z = function (e) { function t() { for (var i, a, r, l = [], d = arguments.length; d--;)l[d] = arguments[d]; 1 === l.length && l[0].constructor && l[0].constructor === Object ? r = l[0] : (a = (i = l)[0], r = i[1]), r || (r = {}), r = n.extend({}, r), a && !r.el && (r.el = a), e.call(this, r), Object.keys(M).forEach((function (e) { Object.keys(M[e]).forEach((function (i) { t.prototype[i] || (t.prototype[i] = M[e][i]) })) })); var h = this; void 0 === h.modules && (h.modules = {}), Object.keys(h.modules).forEach((function (e) { var t = h.modules[e]; if (t.params) { var i = Object.keys(t.params)[0], s = t.params[i]; if ("object" != typeof s || null === s) return; if (!(i in r && "enabled" in s)) return; !0 === r[i] && (r[i] = { enabled: !0 }), "object" != typeof r[i] || "enabled" in r[i] || (r[i].enabled = !0), r[i] || (r[i] = { enabled: !1 }) } })); var p = n.extend({}, S); h.useModulesParams(p), h.params = n.extend({}, p, P, r), h.originalParams = n.extend({}, h.params), h.passedParams = n.extend({}, r), h.$ = s; var c = s(h.params.el); if (a = c[0]) { if (c.length > 1) { var u = []; return c.each((function (e, i) { var s = n.extend({}, r, { el: i }); u.push(new t(s)) })), u } var v, f, m; return a.swiper = h, c.data("swiper", h), a && a.shadowRoot && a.shadowRoot.querySelector ? (v = s(a.shadowRoot.querySelector("." + h.params.wrapperClass))).children = function (e) { return c.children(e) } : v = c.children("." + h.params.wrapperClass), n.extend(h, { $el: c, el: a, $wrapperEl: v, wrapperEl: v[0], classNames: [], slides: s(), slidesGrid: [], snapGrid: [], slidesSizesGrid: [], isHorizontal: function () { return "horizontal" === h.params.direction }, isVertical: function () { return "vertical" === h.params.direction }, rtl: "rtl" === a.dir.toLowerCase() || "rtl" === c.css("direction"), rtlTranslate: "horizontal" === h.params.direction && ("rtl" === a.dir.toLowerCase() || "rtl" === c.css("direction")), wrongRTL: "-webkit-box" === v.css("display"), activeIndex: 0, realIndex: 0, isBeginning: !0, isEnd: !1, translate: 0, previousTranslate: 0, progress: 0, velocity: 0, animating: !1, allowSlideNext: h.params.allowSlideNext, allowSlidePrev: h.params.allowSlidePrev, touchEvents: (f = ["touchstart", "touchmove", "touchend", "touchcancel"], m = ["mousedown", "mousemove", "mouseup"], o.pointerEvents ? m = ["pointerdown", "pointermove", "pointerup"] : o.prefixedPointerEvents && (m = ["MSPointerDown", "MSPointerMove", "MSPointerUp"]), h.touchEventsTouch = { start: f[0], move: f[1], end: f[2], cancel: f[3] }, h.touchEventsDesktop = { start: m[0], move: m[1], end: m[2] }, o.touch || !h.params.simulateTouch ? h.touchEventsTouch : h.touchEventsDesktop), touchEventsData: { isTouched: void 0, isMoved: void 0, allowTouchCallbacks: void 0, touchStartTime: void 0, isScrolling: void 0, currentTranslate: void 0, startTranslate: void 0, allowThresholdMove: void 0, formElements: "input, select, option, textarea, button, video", lastClickTime: n.now(), clickTimeout: void 0, velocities: [], allowMomentumBounce: void 0, isTouchEvent: void 0, startMoving: void 0 }, allowClick: !0, allowTouchMove: h.params.allowTouchMove, touches: { startX: 0, startY: 0, currentX: 0, currentY: 0, diff: 0 }, imagesToLoad: [], imagesLoaded: 0 }), h.useModules(), h.params.init && h.init(), h } } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var i = { extendedDefaults: { configurable: !0 }, defaults: { configurable: !0 }, Class: { configurable: !0 }, $: { configurable: !0 } }; return t.prototype.slidesPerViewDynamic = function () { var e = this.params, t = this.slides, i = this.slidesGrid, s = this.size, a = this.activeIndex, r = 1; if (e.centeredSlides) { for (var n, o = t[a].swiperSlideSize, l = a + 1; l < t.length; l += 1)t[l] && !n && (r += 1, (o += t[l].swiperSlideSize) > s && (n = !0)); for (var d = a - 1; d >= 0; d -= 1)t[d] && !n && (r += 1, (o += t[d].swiperSlideSize) > s && (n = !0)) } else for (var h = a + 1; h < t.length; h += 1)i[h] - i[a] < s && (r += 1); return r }, t.prototype.update = function () { var e = this; if (e && !e.destroyed) { var t = e.snapGrid, i = e.params; i.breakpoints && e.setBreakpoint(), e.updateSize(), e.updateSlides(), e.updateProgress(), e.updateSlidesClasses(), e.params.freeMode ? (s(), e.params.autoHeight && e.updateAutoHeight()) : (("auto" === e.params.slidesPerView || e.params.slidesPerView > 1) && e.isEnd && !e.params.centeredSlides ? e.slideTo(e.slides.length - 1, 0, !1, !0) : e.slideTo(e.activeIndex, 0, !1, !0)) || s(), i.watchOverflow && t !== e.snapGrid && e.checkOverflow(), e.emit("update") } function s() { var t = e.rtlTranslate ? -1 * e.translate : e.translate, i = Math.min(Math.max(t, e.maxTranslate()), e.minTranslate()); e.setTranslate(i), e.updateActiveIndex(), e.updateSlidesClasses() } }, t.prototype.changeDirection = function (e, t) { void 0 === t && (t = !0); var i = this.params.direction; return e || (e = "horizontal" === i ? "vertical" : "horizontal"), e === i || "horizontal" !== e && "vertical" !== e ? this : (this.$el.removeClass("" + this.params.containerModifierClass + i).addClass("" + this.params.containerModifierClass + e), this.params.direction = e, this.slides.each((function (t, i) { "vertical" === e ? i.style.width = "" : i.style.height = "" })), this.emit("changeDirection"), t && this.update(), this) }, t.prototype.init = function () { this.initialized || (this.emit("beforeInit"), this.params.breakpoints && this.setBreakpoint(), this.addClasses(), this.params.loop && this.loopCreate(), this.updateSize(), this.updateSlides(), this.params.watchOverflow && this.checkOverflow(), this.params.grabCursor && this.setGrabCursor(), this.params.preloadImages && this.preloadImages(), this.params.loop ? this.slideTo(this.params.initialSlide + this.loopedSlides, 0, this.params.runCallbacksOnInit) : this.slideTo(this.params.initialSlide, 0, this.params.runCallbacksOnInit), this.attachEvents(), this.initialized = !0, this.emit("init")) }, t.prototype.destroy = function (e, t) { void 0 === e && (e = !0), void 0 === t && (t = !0); var i = this, s = i.params, a = i.$el, r = i.$wrapperEl, o = i.slides; return void 0 === i.params || i.destroyed ? null : (i.emit("beforeDestroy"), i.initialized = !1, i.detachEvents(), s.loop && i.loopDestroy(), t && (i.removeClasses(), a.removeAttr("style"), r.removeAttr("style"), o && o.length && o.removeClass([s.slideVisibleClass, s.slideActiveClass, s.slideNextClass, s.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-slide-index")), i.emit("destroy"), Object.keys(i.eventsListeners).forEach((function (e) { i.off(e) })), !1 !== e && (i.$el[0].swiper = null, i.$el.data("swiper", null), n.deleteProps(i)), i.destroyed = !0, null) }, t.extendDefaults = function (e) { n.extend(P, e) }, i.extendedDefaults.get = function () { return P }, i.defaults.get = function () { return S }, i.Class.get = function () { return e }, i.$.get = function () { return s }, Object.defineProperties(t, i), t }(l), k = { name: "device", proto: { device: g }, static: { device: g } }, $ = { name: "support", proto: { support: o }, static: { support: o } }, L = { isEdge: !!t.navigator.userAgent.match(/Edge/g), isSafari: (C = t.navigator.userAgent.toLowerCase(), C.indexOf("safari") >= 0 && C.indexOf("chrome") < 0 && C.indexOf("android") < 0), isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(t.navigator.userAgent) }, I = { name: "browser", proto: { browser: L }, static: { browser: L } }, D = { name: "resize", create: function () { var e = this; n.extend(e, { resize: { resizeHandler: function () { e && !e.destroyed && e.initialized && (e.emit("beforeResize"), e.emit("resize")) }, orientationChangeHandler: function () { e && !e.destroyed && e.initialized && e.emit("orientationchange") } } }) }, on: { init: function () { t.addEventListener("resize", this.resize.resizeHandler), t.addEventListener("orientationchange", this.resize.orientationChangeHandler) }, destroy: function () { t.removeEventListener("resize", this.resize.resizeHandler), t.removeEventListener("orientationchange", this.resize.orientationChangeHandler) } } }, O = { func: t.MutationObserver || t.WebkitMutationObserver, attach: function (e, i) { void 0 === i && (i = {}); var s = this, a = new (0, O.func)((function (e) { if (1 !== e.length) { var i = function () { s.emit("observerUpdate", e[0]) }; t.requestAnimationFrame ? t.requestAnimationFrame(i) : t.setTimeout(i, 0) } else s.emit("observerUpdate", e[0]) })); a.observe(e, { attributes: void 0 === i.attributes || i.attributes, childList: void 0 === i.childList || i.childList, characterData: void 0 === i.characterData || i.characterData }), s.observer.observers.push(a) }, init: function () { if (o.observer && this.params.observer) { if (this.params.observeParents) for (var e = this.$el.parents(), t = 0; t < e.length; t += 1)this.observer.attach(e[t]); this.observer.attach(this.$el[0], { childList: this.params.observeSlideChildren }), this.observer.attach(this.$wrapperEl[0], { attributes: !1 }) } }, destroy: function () { this.observer.observers.forEach((function (e) { e.disconnect() })), this.observer.observers = [] } }, A = { name: "observer", params: { observer: !1, observeParents: !1, observeSlideChildren: !1 }, create: function () { n.extend(this, { observer: { init: O.init.bind(this), attach: O.attach.bind(this), destroy: O.destroy.bind(this), observers: [] } }) }, on: { init: function () { this.observer.init() }, destroy: function () { this.observer.destroy() } } }, H = { update: function (e) { var t = this, i = t.params, s = i.slidesPerView, a = i.slidesPerGroup, r = i.centeredSlides, o = t.params.virtual, l = o.addSlidesBefore, d = o.addSlidesAfter, h = t.virtual, p = h.from, c = h.to, u = h.slides, v = h.slidesGrid, f = h.renderSlide, m = h.offset; t.updateActiveIndex(); var g, b, w, y = t.activeIndex || 0; g = t.rtlTranslate ? "right" : t.isHorizontal() ? "left" : "top", r ? (b = Math.floor(s / 2) + a + l, w = Math.floor(s / 2) + a + d) : (b = s + (a - 1) + l, w = a + d); var x = Math.max((y || 0) - w, 0), E = Math.min((y || 0) + b, u.length - 1), T = (t.slidesGrid[x] || 0) - (t.slidesGrid[0] || 0); function C() { t.updateSlides(), t.updateProgress(), t.updateSlidesClasses(), t.lazy && t.params.lazy.enabled && t.lazy.load() } if (n.extend(t.virtual, { from: x, to: E, offset: T, slidesGrid: t.slidesGrid }), p === x && c === E && !e) return t.slidesGrid !== v && T !== m && t.slides.css(g, T + "px"), void t.updateProgress(); if (t.params.virtual.renderExternal) return t.params.virtual.renderExternal.call(t, { offset: T, from: x, to: E, slides: function () { for (var e = [], t = x; t <= E; t += 1)e.push(u[t]); return e }() }), void C(); var S = [], M = []; if (e) t.$wrapperEl.find("." + t.params.slideClass).remove(); else for (var P = p; P <= c; P += 1)(P < x || P > E) && t.$wrapperEl.find("." + t.params.slideClass + '[data-swiper-slide-index="' + P + '"]').remove(); for (var z = 0; z < u.length; z += 1)z >= x && z <= E && (void 0 === c || e ? M.push(z) : (z > c && M.push(z), z < p && S.push(z))); M.forEach((function (e) { t.$wrapperEl.append(f(u[e], e)) })), S.sort((function (e, t) { return t - e })).forEach((function (e) { t.$wrapperEl.prepend(f(u[e], e)) })), t.$wrapperEl.children(".swiper-slide").css(g, T + "px"), C() }, renderSlide: function (e, t) { var i = this.params.virtual; if (i.cache && this.virtual.cache[t]) return this.virtual.cache[t]; var a = i.renderSlide ? s(i.renderSlide.call(this, e, t)) : s('<div class="' + this.params.slideClass + '" data-swiper-slide-index="' + t + '">' + e + "</div>"); return a.attr("data-swiper-slide-index") || a.attr("data-swiper-slide-index", t), i.cache && (this.virtual.cache[t] = a), a }, appendSlide: function (e) { if ("object" == typeof e && "length" in e) for (var t = 0; t < e.length; t += 1)e[t] && this.virtual.slides.push(e[t]); else this.virtual.slides.push(e); this.virtual.update(!0) }, prependSlide: function (e) { var t = this.activeIndex, i = t + 1, s = 1; if (Array.isArray(e)) { for (var a = 0; a < e.length; a += 1)e[a] && this.virtual.slides.unshift(e[a]); i = t + e.length, s = e.length } else this.virtual.slides.unshift(e); if (this.params.virtual.cache) { var r = this.virtual.cache, n = {}; Object.keys(r).forEach((function (e) { var t = r[e], i = t.attr("data-swiper-slide-index"); i && t.attr("data-swiper-slide-index", parseInt(i, 10) + 1), n[parseInt(e, 10) + s] = t })), this.virtual.cache = n } this.virtual.update(!0), this.slideTo(i, 0) }, removeSlide: function (e) { if (null != e) { var t = this.activeIndex; if (Array.isArray(e)) for (var i = e.length - 1; i >= 0; i -= 1)this.virtual.slides.splice(e[i], 1), this.params.virtual.cache && delete this.virtual.cache[e[i]], e[i] < t && (t -= 1), t = Math.max(t, 0); else this.virtual.slides.splice(e, 1), this.params.virtual.cache && delete this.virtual.cache[e], e < t && (t -= 1), t = Math.max(t, 0); this.virtual.update(!0), this.slideTo(t, 0) } }, removeAllSlides: function () { this.virtual.slides = [], this.params.virtual.cache && (this.virtual.cache = {}), this.virtual.update(!0), this.slideTo(0, 0) } }, G = { name: "virtual", params: { virtual: { enabled: !1, slides: [], cache: !0, renderSlide: null, renderExternal: null, addSlidesBefore: 0, addSlidesAfter: 0 } }, create: function () { n.extend(this, { virtual: { update: H.update.bind(this), appendSlide: H.appendSlide.bind(this), prependSlide: H.prependSlide.bind(this), removeSlide: H.removeSlide.bind(this), removeAllSlides: H.removeAllSlides.bind(this), renderSlide: H.renderSlide.bind(this), slides: this.params.virtual.slides, cache: {} } }) }, on: { beforeInit: function () { if (this.params.virtual.enabled) { this.classNames.push(this.params.containerModifierClass + "virtual"); var e = { watchSlidesProgress: !0 }; n.extend(this.params, e), n.extend(this.originalParams, e), this.params.initialSlide || this.virtual.update() } }, setTranslate: function () { this.params.virtual.enabled && this.virtual.update() } } }, N = { handle: function (i) { var s = this.rtlTranslate, a = i; a.originalEvent && (a = a.originalEvent); var r = a.keyCode || a.charCode; if (!this.allowSlideNext && (this.isHorizontal() && 39 === r || this.isVertical() && 40 === r || 34 === r)) return !1; if (!this.allowSlidePrev && (this.isHorizontal() && 37 === r || this.isVertical() && 38 === r || 33 === r)) return !1; if (!(a.shiftKey || a.altKey || a.ctrlKey || a.metaKey || e.activeElement && e.activeElement.nodeName && ("input" === e.activeElement.nodeName.toLowerCase() || "textarea" === e.activeElement.nodeName.toLowerCase()))) { if (this.params.keyboard.onlyInViewport && (33 === r || 34 === r || 37 === r || 39 === r || 38 === r || 40 === r)) { var n = !1; if (this.$el.parents("." + this.params.slideClass).length > 0 && 0 === this.$el.parents("." + this.params.slideActiveClass).length) return; var o = t.innerWidth, l = t.innerHeight, d = this.$el.offset(); s && (d.left -= this.$el[0].scrollLeft); for (var h = [[d.left, d.top], [d.left + this.width, d.top], [d.left, d.top + this.height], [d.left + this.width, d.top + this.height]], p = 0; p < h.length; p += 1) { var c = h[p]; c[0] >= 0 && c[0] <= o && c[1] >= 0 && c[1] <= l && (n = !0) } if (!n) return } this.isHorizontal() ? (33 !== r && 34 !== r && 37 !== r && 39 !== r || (a.preventDefault ? a.preventDefault() : a.returnValue = !1), (34 !== r && 39 !== r || s) && (33 !== r && 37 !== r || !s) || this.slideNext(), (33 !== r && 37 !== r || s) && (34 !== r && 39 !== r || !s) || this.slidePrev()) : (33 !== r && 34 !== r && 38 !== r && 40 !== r || (a.preventDefault ? a.preventDefault() : a.returnValue = !1), 34 !== r && 40 !== r || this.slideNext(), 33 !== r && 38 !== r || this.slidePrev()), this.emit("keyPress", r) } }, enable: function () { this.keyboard.enabled || (s(e).on("keydown", this.keyboard.handle), this.keyboard.enabled = !0) }, disable: function () { this.keyboard.enabled && (s(e).off("keydown", this.keyboard.handle), this.keyboard.enabled = !1) } }, B = { name: "keyboard", params: { keyboard: { enabled: !1, onlyInViewport: !0 } }, create: function () { n.extend(this, { keyboard: { enabled: !1, enable: N.enable.bind(this), disable: N.disable.bind(this), handle: N.handle.bind(this) } }) }, on: { init: function () { this.params.keyboard.enabled && this.keyboard.enable() }, destroy: function () { this.keyboard.enabled && this.keyboard.disable() } } }; var V = { lastScrollTime: n.now(), event: function () { return t.navigator.userAgent.indexOf("firefox") > -1 ? "DOMMouseScroll" : function () { var t = "onwheel" in e; if (!t) { var i = e.createElement("div"); i.setAttribute("onwheel", "return;"), t = "function" == typeof i.onwheel } return !t && e.implementation && e.implementation.hasFeature && !0 !== e.implementation.hasFeature("", "") && (t = e.implementation.hasFeature("Events.wheel", "3.0")), t }() ? "wheel" : "mousewheel" }, normalize: function (e) { var t = 0, i = 0, s = 0, a = 0; return "detail" in e && (i = e.detail), "wheelDelta" in e && (i = -e.wheelDelta / 120), "wheelDeltaY" in e && (i = -e.wheelDeltaY / 120), "wheelDeltaX" in e && (t = -e.wheelDeltaX / 120), "axis" in e && e.axis === e.HORIZONTAL_AXIS && (t = i, i = 0), s = 10 * t, a = 10 * i, "deltaY" in e && (a = e.deltaY), "deltaX" in e && (s = e.deltaX), (s || a) && e.deltaMode && (1 === e.deltaMode ? (s *= 40, a *= 40) : (s *= 800, a *= 800)), s && !t && (t = s < 1 ? -1 : 1), a && !i && (i = a < 1 ? -1 : 1), { spinX: t, spinY: i, pixelX: s, pixelY: a } }, handleMouseEnter: function () { this.mouseEntered = !0 }, handleMouseLeave: function () { this.mouseEntered = !1 }, handle: function (e) { var i = e, s = this, a = s.params.mousewheel; if (s.params.cssMode && i.preventDefault(), !s.mouseEntered && !a.releaseOnEdges) return !0; i.originalEvent && (i = i.originalEvent); var r = 0, o = s.rtlTranslate ? -1 : 1, l = V.normalize(i); if (a.forceToAxis) if (s.isHorizontal()) { if (!(Math.abs(l.pixelX) > Math.abs(l.pixelY))) return !0; r = l.pixelX * o } else { if (!(Math.abs(l.pixelY) > Math.abs(l.pixelX))) return !0; r = l.pixelY } else r = Math.abs(l.pixelX) > Math.abs(l.pixelY) ? -l.pixelX * o : -l.pixelY; if (0 === r) return !0; if (a.invert && (r = -r), s.params.freeMode) { s.params.loop && s.loopFix(); var d = s.getTranslate() + r * a.sensitivity, h = s.isBeginning, p = s.isEnd; if (d >= s.minTranslate() && (d = s.minTranslate()), d <= s.maxTranslate() && (d = s.maxTranslate()), s.setTransition(0), s.setTranslate(d), s.updateProgress(), s.updateActiveIndex(), s.updateSlidesClasses(), (!h && s.isBeginning || !p && s.isEnd) && s.updateSlidesClasses(), s.params.freeModeSticky && (clearTimeout(s.mousewheel.timeout), s.mousewheel.timeout = n.nextTick((function () { s.slideToClosest() }), 300)), s.emit("scroll", i), s.params.autoplay && s.params.autoplayDisableOnInteraction && s.autoplay.stop(), d === s.minTranslate() || d === s.maxTranslate()) return !0 } else { if (n.now() - s.mousewheel.lastScrollTime > 60) if (r < 0) if (s.isEnd && !s.params.loop || s.animating) { if (a.releaseOnEdges) return !0 } else s.slideNext(), s.emit("scroll", i); else if (s.isBeginning && !s.params.loop || s.animating) { if (a.releaseOnEdges) return !0 } else s.slidePrev(), s.emit("scroll", i); s.mousewheel.lastScrollTime = (new t.Date).getTime() } return i.preventDefault ? i.preventDefault() : i.returnValue = !1, !1 }, enable: function () { var e = V.event(); if (this.params.cssMode) return this.wrapperEl.removeEventListener(e, this.mousewheel.handle), !0; if (!e) return !1; if (this.mousewheel.enabled) return !1; var t = this.$el; return "container" !== this.params.mousewheel.eventsTarged && (t = s(this.params.mousewheel.eventsTarged)), t.on("mouseenter", this.mousewheel.handleMouseEnter), t.on("mouseleave", this.mousewheel.handleMouseLeave), t.on(e, this.mousewheel.handle), this.mousewheel.enabled = !0, !0 }, disable: function () { var e = V.event(); if (this.params.cssMode) return this.wrapperEl.addEventListener(e, this.mousewheel.handle), !0; if (!e) return !1; if (!this.mousewheel.enabled) return !1; var t = this.$el; return "container" !== this.params.mousewheel.eventsTarged && (t = s(this.params.mousewheel.eventsTarged)), t.off(e, this.mousewheel.handle), this.mousewheel.enabled = !1, !0 } }, X = { update: function () { var e = this.params.navigation; if (!this.params.loop) { var t = this.navigation, i = t.$nextEl, s = t.$prevEl; s && s.length > 0 && (this.isBeginning ? s.addClass(e.disabledClass) : s.removeClass(e.disabledClass), s[this.params.watchOverflow && this.isLocked ? "addClass" : "removeClass"](e.lockClass)), i && i.length > 0 && (this.isEnd ? i.addClass(e.disabledClass) : i.removeClass(e.disabledClass), i[this.params.watchOverflow && this.isLocked ? "addClass" : "removeClass"](e.lockClass)) } }, onPrevClick: function (e) { e.preventDefault(), this.isBeginning && !this.params.loop || this.slidePrev() }, onNextClick: function (e) { e.preventDefault(), this.isEnd && !this.params.loop || this.slideNext() }, init: function () { var e, t, i = this.params.navigation; (i.nextEl || i.prevEl) && (i.nextEl && (e = s(i.nextEl), this.params.uniqueNavElements && "string" == typeof i.nextEl && e.length > 1 && 1 === this.$el.find(i.nextEl).length && (e = this.$el.find(i.nextEl))), i.prevEl && (t = s(i.prevEl), this.params.uniqueNavElements && "string" == typeof i.prevEl && t.length > 1 && 1 === this.$el.find(i.prevEl).length && (t = this.$el.find(i.prevEl))), e && e.length > 0 && e.on("click", this.navigation.onNextClick), t && t.length > 0 && t.on("click", this.navigation.onPrevClick), n.extend(this.navigation, { $nextEl: e, nextEl: e && e[0], $prevEl: t, prevEl: t && t[0] })) }, destroy: function () { var e = this.navigation, t = e.$nextEl, i = e.$prevEl; t && t.length && (t.off("click", this.navigation.onNextClick), t.removeClass(this.params.navigation.disabledClass)), i && i.length && (i.off("click", this.navigation.onPrevClick), i.removeClass(this.params.navigation.disabledClass)) } }, Y = { update: function () { var e = this.rtl, t = this.params.pagination; if (t.el && this.pagination.el && this.pagination.$el && 0 !== this.pagination.$el.length) { var i, a = this.virtual && this.params.virtual.enabled ? this.virtual.slides.length : this.slides.length, r = this.pagination.$el, n = this.params.loop ? Math.ceil((a - 2 * this.loopedSlides) / this.params.slidesPerGroup) : this.snapGrid.length; if (this.params.loop ? ((i = Math.ceil((this.activeIndex - this.loopedSlides) / this.params.slidesPerGroup)) > a - 1 - 2 * this.loopedSlides && (i -= a - 2 * this.loopedSlides), i > n - 1 && (i -= n), i < 0 && "bullets" !== this.params.paginationType && (i = n + i)) : i = void 0 !== this.snapIndex ? this.snapIndex : this.activeIndex || 0, "bullets" === t.type && this.pagination.bullets && this.pagination.bullets.length > 0) { var o, l, d, h = this.pagination.bullets; if (t.dynamicBullets && (this.pagination.bulletSize = h.eq(0)[this.isHorizontal() ? "outerWidth" : "outerHeight"](!0), r.css(this.isHorizontal() ? "width" : "height", this.pagination.bulletSize * (t.dynamicMainBullets + 4) + "px"), t.dynamicMainBullets > 1 && void 0 !== this.previousIndex && (this.pagination.dynamicBulletIndex += i - this.previousIndex, this.pagination.dynamicBulletIndex > t.dynamicMainBullets - 1 ? this.pagination.dynamicBulletIndex = t.dynamicMainBullets - 1 : this.pagination.dynamicBulletIndex < 0 && (this.pagination.dynamicBulletIndex = 0)), o = i - this.pagination.dynamicBulletIndex, d = ((l = o + (Math.min(h.length, t.dynamicMainBullets) - 1)) + o) / 2), h.removeClass(t.bulletActiveClass + " " + t.bulletActiveClass + "-next " + t.bulletActiveClass + "-next-next " + t.bulletActiveClass + "-prev " + t.bulletActiveClass + "-prev-prev " + t.bulletActiveClass + "-main"), r.length > 1) h.each((function (e, a) { var r = s(a), n = r.index(); n === i && r.addClass(t.bulletActiveClass), t.dynamicBullets && (n >= o && n <= l && r.addClass(t.bulletActiveClass + "-main"), n === o && r.prev().addClass(t.bulletActiveClass + "-prev").prev().addClass(t.bulletActiveClass + "-prev-prev"), n === l && r.next().addClass(t.bulletActiveClass + "-next").next().addClass(t.bulletActiveClass + "-next-next")) })); else if (h.eq(i).addClass(t.bulletActiveClass), t.dynamicBullets) { for (var p = h.eq(o), c = h.eq(l), u = o; u <= l; u += 1)h.eq(u).addClass(t.bulletActiveClass + "-main"); p.prev().addClass(t.bulletActiveClass + "-prev").prev().addClass(t.bulletActiveClass + "-prev-prev"), c.next().addClass(t.bulletActiveClass + "-next").next().addClass(t.bulletActiveClass + "-next-next") } if (t.dynamicBullets) { var v = Math.min(h.length, t.dynamicMainBullets + 4), f = (this.pagination.bulletSize * v - this.pagination.bulletSize) / 2 - d * this.pagination.bulletSize, m = e ? "right" : "left"; h.css(this.isHorizontal() ? m : "top", f + "px") } } if ("fraction" === t.type && (r.find("." + t.currentClass).text(t.formatFractionCurrent(i + 1)), r.find("." + t.totalClass).text(t.formatFractionTotal(n))), "progressbar" === t.type) { var g; g = t.progressbarOpposite ? this.isHorizontal() ? "vertical" : "horizontal" : this.isHorizontal() ? "horizontal" : "vertical"; var b = (i + 1) / n, w = 1, y = 1; "horizontal" === g ? w = b : y = b, r.find("." + t.progressbarFillClass).transform("translate3d(0,0,0) scaleX(" + w + ") scaleY(" + y + ")").transition(this.params.speed) } "custom" === t.type && t.renderCustom ? (r.html(t.renderCustom(this, i + 1, n)), this.emit("paginationRender", this, r[0])) : this.emit("paginationUpdate", this, r[0]), r[this.params.watchOverflow && this.isLocked ? "addClass" : "removeClass"](t.lockClass) } }, render: function () { var e = this.params.pagination; if (e.el && this.pagination.el && this.pagination.$el && 0 !== this.pagination.$el.length) { var t = this.virtual && this.params.virtual.enabled ? this.virtual.slides.length : this.slides.length, i = this.pagination.$el, s = ""; if ("bullets" === e.type) { for (var a = this.params.loop ? Math.ceil((t - 2 * this.loopedSlides) / this.params.slidesPerGroup) : this.snapGrid.length, r = 0; r < a; r += 1)e.renderBullet ? s += e.renderBullet.call(this, r, e.bulletClass) : s += "<" + e.bulletElement + ' class="' + e.bulletClass + '"></' + e.bulletElement + ">"; i.html(s), this.pagination.bullets = i.find("." + e.bulletClass) } "fraction" === e.type && (s = e.renderFraction ? e.renderFraction.call(this, e.currentClass, e.totalClass) : '<span class="' + e.currentClass + '"></span> / <span class="' + e.totalClass + '"></span>', i.html(s)), "progressbar" === e.type && (s = e.renderProgressbar ? e.renderProgressbar.call(this, e.progressbarFillClass) : '<span class="' + e.progressbarFillClass + '"></span>', i.html(s)), "custom" !== e.type && this.emit("paginationRender", this.pagination.$el[0]) } }, init: function () { var e = this, t = e.params.pagination; if (t.el) { var i = s(t.el); 0 !== i.length && (e.params.uniqueNavElements && "string" == typeof t.el && i.length > 1 && 1 === e.$el.find(t.el).length && (i = e.$el.find(t.el)), "bullets" === t.type && t.clickable && i.addClass(t.clickableClass), i.addClass(t.modifierClass + t.type), "bullets" === t.type && t.dynamicBullets && (i.addClass("" + t.modifierClass + t.type + "-dynamic"), e.pagination.dynamicBulletIndex = 0, t.dynamicMainBullets < 1 && (t.dynamicMainBullets = 1)), "progressbar" === t.type && t.progressbarOpposite && i.addClass(t.progressbarOppositeClass), t.clickable && i.on("click", "." + t.bulletClass, (function (t) { t.preventDefault(); var i = s(this).index() * e.params.slidesPerGroup; e.params.loop && (i += e.loopedSlides), e.slideTo(i) })), n.extend(e.pagination, { $el: i, el: i[0] })) } }, destroy: function () { var e = this.params.pagination; if (e.el && this.pagination.el && this.pagination.$el && 0 !== this.pagination.$el.length) { var t = this.pagination.$el; t.removeClass(e.hiddenClass), t.removeClass(e.modifierClass + e.type), this.pagination.bullets && this.pagination.bullets.removeClass(e.bulletActiveClass), e.clickable && t.off("click", "." + e.bulletClass) } } }, F = { setTranslate: function () { if (this.params.scrollbar.el && this.scrollbar.el) { var e = this.scrollbar, t = this.rtlTranslate, i = this.progress, s = e.dragSize, a = e.trackSize, r = e.$dragEl, n = e.$el, o = this.params.scrollbar, l = s, d = (a - s) * i; t ? (d = -d) > 0 ? (l = s - d, d = 0) : -d + s > a && (l = a + d) : d < 0 ? (l = s + d, d = 0) : d + s > a && (l = a - d), this.isHorizontal() ? (r.transform("translate3d(" + d + "px, 0, 0)"), r[0].style.width = l + "px") : (r.transform("translate3d(0px, " + d + "px, 0)"), r[0].style.height = l + "px"), o.hide && (clearTimeout(this.scrollbar.timeout), n[0].style.opacity = 1, this.scrollbar.timeout = setTimeout((function () { n[0].style.opacity = 0, n.transition(400) }), 1e3)) } }, setTransition: function (e) { this.params.scrollbar.el && this.scrollbar.el && this.scrollbar.$dragEl.transition(e) }, updateSize: function () { if (this.params.scrollbar.el && this.scrollbar.el) { var e = this.scrollbar, t = e.$dragEl, i = e.$el; t[0].style.width = "", t[0].style.height = ""; var s, a = this.isHorizontal() ? i[0].offsetWidth : i[0].offsetHeight, r = this.size / this.virtualSize, o = r * (a / this.size); s = "auto" === this.params.scrollbar.dragSize ? a * r : parseInt(this.params.scrollbar.dragSize, 10), this.isHorizontal() ? t[0].style.width = s + "px" : t[0].style.height = s + "px", i[0].style.display = r >= 1 ? "none" : "", this.params.scrollbar.hide && (i[0].style.opacity = 0), n.extend(e, { trackSize: a, divider: r, moveDivider: o, dragSize: s }), e.$el[this.params.watchOverflow && this.isLocked ? "addClass" : "removeClass"](this.params.scrollbar.lockClass) } }, getPointerPosition: function (e) { return this.isHorizontal() ? "touchstart" === e.type || "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX || e.clientX : "touchstart" === e.type || "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY || e.clientY }, setDragPosition: function (e) { var t, i = this.scrollbar, s = this.rtlTranslate, a = i.$el, r = i.dragSize, n = i.trackSize, o = i.dragStartPos; t = (i.getPointerPosition(e) - a.offset()[this.isHorizontal() ? "left" : "top"] - (null !== o ? o : r / 2)) / (n - r), t = Math.max(Math.min(t, 1), 0), s && (t = 1 - t); var l = this.minTranslate() + (this.maxTranslate() - this.minTranslate()) * t; this.updateProgress(l), this.setTranslate(l), this.updateActiveIndex(), this.updateSlidesClasses() }, onDragStart: function (e) { var t = this.params.scrollbar, i = this.scrollbar, s = this.$wrapperEl, a = i.$el, r = i.$dragEl; this.scrollbar.isTouched = !0, this.scrollbar.dragStartPos = e.target === r[0] || e.target === r ? i.getPointerPosition(e) - e.target.getBoundingClientRect()[this.isHorizontal() ? "left" : "top"] : null, e.preventDefault(), e.stopPropagation(), s.transition(100), r.transition(100), i.setDragPosition(e), clearTimeout(this.scrollbar.dragTimeout), a.transition(0), t.hide && a.css("opacity", 1), this.params.cssMode && this.$wrapperEl.css("scroll-snap-type", "none"), this.emit("scrollbarDragStart", e) }, onDragMove: function (e) { var t = this.scrollbar, i = this.$wrapperEl, s = t.$el, a = t.$dragEl; this.scrollbar.isTouched && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, t.setDragPosition(e), i.transition(0), s.transition(0), a.transition(0), this.emit("scrollbarDragMove", e)) }, onDragEnd: function (e) { var t = this.params.scrollbar, i = this.scrollbar, s = this.$wrapperEl, a = i.$el; this.scrollbar.isTouched && (this.scrollbar.isTouched = !1, this.params.cssMode && (this.$wrapperEl.css("scroll-snap-type", ""), s.transition("")), t.hide && (clearTimeout(this.scrollbar.dragTimeout), this.scrollbar.dragTimeout = n.nextTick((function () { a.css("opacity", 0), a.transition(400) }), 1e3)), this.emit("scrollbarDragEnd", e), t.snapOnRelease && this.slideToClosest()) }, enableDraggable: function () { if (this.params.scrollbar.el) { var t = this.scrollbar, i = this.touchEventsTouch, s = this.touchEventsDesktop, a = this.params, r = t.$el[0], n = !(!o.passiveListener || !a.passiveListeners) && { passive: !1, capture: !1 }, l = !(!o.passiveListener || !a.passiveListeners) && { passive: !0, capture: !1 }; o.touch ? (r.addEventListener(i.start, this.scrollbar.onDragStart, n), r.addEventListener(i.move, this.scrollbar.onDragMove, n), r.addEventListener(i.end, this.scrollbar.onDragEnd, l)) : (r.addEventListener(s.start, this.scrollbar.onDragStart, n), e.addEventListener(s.move, this.scrollbar.onDragMove, n), e.addEventListener(s.end, this.scrollbar.onDragEnd, l)) } }, disableDraggable: function () { if (this.params.scrollbar.el) { var t = this.scrollbar, i = this.touchEventsTouch, s = this.touchEventsDesktop, a = this.params, r = t.$el[0], n = !(!o.passiveListener || !a.passiveListeners) && { passive: !1, capture: !1 }, l = !(!o.passiveListener || !a.passiveListeners) && { passive: !0, capture: !1 }; o.touch ? (r.removeEventListener(i.start, this.scrollbar.onDragStart, n), r.removeEventListener(i.move, this.scrollbar.onDragMove, n), r.removeEventListener(i.end, this.scrollbar.onDragEnd, l)) : (r.removeEventListener(s.start, this.scrollbar.onDragStart, n), e.removeEventListener(s.move, this.scrollbar.onDragMove, n), e.removeEventListener(s.end, this.scrollbar.onDragEnd, l)) } }, init: function () { if (this.params.scrollbar.el) { var e = this.scrollbar, t = this.$el, i = this.params.scrollbar, a = s(i.el); this.params.uniqueNavElements && "string" == typeof i.el && a.length > 1 && 1 === t.find(i.el).length && (a = t.find(i.el)); var r = a.find("." + this.params.scrollbar.dragClass); 0 === r.length && (r = s('<div class="' + this.params.scrollbar.dragClass + '"></div>'), a.append(r)), n.extend(e, { $el: a, el: a[0], $dragEl: r, dragEl: r[0] }), i.draggable && e.enableDraggable() } }, destroy: function () { this.scrollbar.disableDraggable() } }, R = { setTransform: function (e, t) { var i = this.rtl, a = s(e), r = i ? -1 : 1, n = a.attr("data-swiper-parallax") || "0", o = a.attr("data-swiper-parallax-x"), l = a.attr("data-swiper-parallax-y"), d = a.attr("data-swiper-parallax-scale"), h = a.attr("data-swiper-parallax-opacity"); if (o || l ? (o = o || "0", l = l || "0") : this.isHorizontal() ? (o = n, l = "0") : (l = n, o = "0"), o = o.indexOf("%") >= 0 ? parseInt(o, 10) * t * r + "%" : o * t * r + "px", l = l.indexOf("%") >= 0 ? parseInt(l, 10) * t + "%" : l * t + "px", null != h) { var p = h - (h - 1) * (1 - Math.abs(t)); a[0].style.opacity = p } if (null == d) a.transform("translate3d(" + o + ", " + l + ", 0px)"); else { var c = d - (d - 1) * (1 - Math.abs(t)); a.transform("translate3d(" + o + ", " + l + ", 0px) scale(" + c + ")") } }, setTranslate: function () { var e = this, t = e.$el, i = e.slides, a = e.progress, r = e.snapGrid; t.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((function (t, i) { e.parallax.setTransform(i, a) })), i.each((function (t, i) { var n = i.progress; e.params.slidesPerGroup > 1 && "auto" !== e.params.slidesPerView && (n += Math.ceil(t / 2) - a * (r.length - 1)), n = Math.min(Math.max(n, -1), 1), s(i).find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((function (t, i) { e.parallax.setTransform(i, n) })) })) }, setTransition: function (e) { void 0 === e && (e = this.params.speed); this.$el.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((function (t, i) { var a = s(i), r = parseInt(a.attr("data-swiper-parallax-duration"), 10) || e; 0 === e && (r = 0), a.transition(r) })) } }, q = { getDistanceBetweenTouches: function (e) { if (e.targetTouches.length < 2) return 1; var t = e.targetTouches[0].pageX, i = e.targetTouches[0].pageY, s = e.targetTouches[1].pageX, a = e.targetTouches[1].pageY; return Math.sqrt(Math.pow(s - t, 2) + Math.pow(a - i, 2)) }, onGestureStart: function (e) { var t = this.params.zoom, i = this.zoom, a = i.gesture; if (i.fakeGestureTouched = !1, i.fakeGestureMoved = !1, !o.gestures) { if ("touchstart" !== e.type || "touchstart" === e.type && e.targetTouches.length < 2) return; i.fakeGestureTouched = !0, a.scaleStart = q.getDistanceBetweenTouches(e) } a.$slideEl && a.$slideEl.length || (a.$slideEl = s(e.target).closest(".swiper-slide"), 0 === a.$slideEl.length && (a.$slideEl = this.slides.eq(this.activeIndex)), a.$imageEl = a.$slideEl.find("img, svg, canvas"), a.$imageWrapEl = a.$imageEl.parent("." + t.containerClass), a.maxRatio = a.$imageWrapEl.attr("data-swiper-zoom") || t.maxRatio, 0 !== a.$imageWrapEl.length) ? (a.$imageEl.transition(0), this.zoom.isScaling = !0) : a.$imageEl = void 0 }, onGestureChange: function (e) { var t = this.params.zoom, i = this.zoom, s = i.gesture; if (!o.gestures) { if ("touchmove" !== e.type || "touchmove" === e.type && e.targetTouches.length < 2) return; i.fakeGestureMoved = !0, s.scaleMove = q.getDistanceBetweenTouches(e) } s.$imageEl && 0 !== s.$imageEl.length && (o.gestures ? i.scale = e.scale * i.currentScale : i.scale = s.scaleMove / s.scaleStart * i.currentScale, i.scale > s.maxRatio && (i.scale = s.maxRatio - 1 + Math.pow(i.scale - s.maxRatio + 1, .5)), i.scale < t.minRatio && (i.scale = t.minRatio + 1 - Math.pow(t.minRatio - i.scale + 1, .5)), s.$imageEl.transform("translate3d(0,0,0) scale(" + i.scale + ")")) }, onGestureEnd: function (e) { var t = this.params.zoom, i = this.zoom, s = i.gesture; if (!o.gestures) { if (!i.fakeGestureTouched || !i.fakeGestureMoved) return; if ("touchend" !== e.type || "touchend" === e.type && e.changedTouches.length < 2 && !g.android) return; i.fakeGestureTouched = !1, i.fakeGestureMoved = !1 } s.$imageEl && 0 !== s.$imageEl.length && (i.scale = Math.max(Math.min(i.scale, s.maxRatio), t.minRatio), s.$imageEl.transition(this.params.speed).transform("translate3d(0,0,0) scale(" + i.scale + ")"), i.currentScale = i.scale, i.isScaling = !1, 1 === i.scale && (s.$slideEl = void 0)) }, onTouchStart: function (e) { var t = this.zoom, i = t.gesture, s = t.image; i.$imageEl && 0 !== i.$imageEl.length && (s.isTouched || (g.android && e.preventDefault(), s.isTouched = !0, s.touchesStart.x = "touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX, s.touchesStart.y = "touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY)) }, onTouchMove: function (e) { var t = this.zoom, i = t.gesture, s = t.image, a = t.velocity; if (i.$imageEl && 0 !== i.$imageEl.length && (this.allowClick = !1, s.isTouched && i.$slideEl)) { s.isMoved || (s.width = i.$imageEl[0].offsetWidth, s.height = i.$imageEl[0].offsetHeight, s.startX = n.getTranslate(i.$imageWrapEl[0], "x") || 0, s.startY = n.getTranslate(i.$imageWrapEl[0], "y") || 0, i.slideWidth = i.$slideEl[0].offsetWidth, i.slideHeight = i.$slideEl[0].offsetHeight, i.$imageWrapEl.transition(0), this.rtl && (s.startX = -s.startX, s.startY = -s.startY)); var r = s.width * t.scale, o = s.height * t.scale; if (!(r < i.slideWidth && o < i.slideHeight)) { if (s.minX = Math.min(i.slideWidth / 2 - r / 2, 0), s.maxX = -s.minX, s.minY = Math.min(i.slideHeight / 2 - o / 2, 0), s.maxY = -s.minY, s.touchesCurrent.x = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX, s.touchesCurrent.y = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY, !s.isMoved && !t.isScaling) { if (this.isHorizontal() && (Math.floor(s.minX) === Math.floor(s.startX) && s.touchesCurrent.x < s.touchesStart.x || Math.floor(s.maxX) === Math.floor(s.startX) && s.touchesCurrent.x > s.touchesStart.x)) return void (s.isTouched = !1); if (!this.isHorizontal() && (Math.floor(s.minY) === Math.floor(s.startY) && s.touchesCurrent.y < s.touchesStart.y || Math.floor(s.maxY) === Math.floor(s.startY) && s.touchesCurrent.y > s.touchesStart.y)) return void (s.isTouched = !1) } e.preventDefault(), e.stopPropagation(), s.isMoved = !0, s.currentX = s.touchesCurrent.x - s.touchesStart.x + s.startX, s.currentY = s.touchesCurrent.y - s.touchesStart.y + s.startY, s.currentX < s.minX && (s.currentX = s.minX + 1 - Math.pow(s.minX - s.currentX + 1, .8)), s.currentX > s.maxX && (s.currentX = s.maxX - 1 + Math.pow(s.currentX - s.maxX + 1, .8)), s.currentY < s.minY && (s.currentY = s.minY + 1 - Math.pow(s.minY - s.currentY + 1, .8)), s.currentY > s.maxY && (s.currentY = s.maxY - 1 + Math.pow(s.currentY - s.maxY + 1, .8)), a.prevPositionX || (a.prevPositionX = s.touchesCurrent.x), a.prevPositionY || (a.prevPositionY = s.touchesCurrent.y), a.prevTime || (a.prevTime = Date.now()), a.x = (s.touchesCurrent.x - a.prevPositionX) / (Date.now() - a.prevTime) / 2, a.y = (s.touchesCurrent.y - a.prevPositionY) / (Date.now() - a.prevTime) / 2, Math.abs(s.touchesCurrent.x - a.prevPositionX) < 2 && (a.x = 0), Math.abs(s.touchesCurrent.y - a.prevPositionY) < 2 && (a.y = 0), a.prevPositionX = s.touchesCurrent.x, a.prevPositionY = s.touchesCurrent.y, a.prevTime = Date.now(), i.$imageWrapEl.transform("translate3d(" + s.currentX + "px, " + s.currentY + "px,0)") } } }, onTouchEnd: function () { var e = this.zoom, t = e.gesture, i = e.image, s = e.velocity; if (t.$imageEl && 0 !== t.$imageEl.length) { if (!i.isTouched || !i.isMoved) return i.isTouched = !1, void (i.isMoved = !1); i.isTouched = !1, i.isMoved = !1; var a = 300, r = 300, n = s.x * a, o = i.currentX + n, l = s.y * r, d = i.currentY + l; 0 !== s.x && (a = Math.abs((o - i.currentX) / s.x)), 0 !== s.y && (r = Math.abs((d - i.currentY) / s.y)); var h = Math.max(a, r); i.currentX = o, i.currentY = d; var p = i.width * e.scale, c = i.height * e.scale; i.minX = Math.min(t.slideWidth / 2 - p / 2, 0), i.maxX = -i.minX, i.minY = Math.min(t.slideHeight / 2 - c / 2, 0), i.maxY = -i.minY, i.currentX = Math.max(Math.min(i.currentX, i.maxX), i.minX), i.currentY = Math.max(Math.min(i.currentY, i.maxY), i.minY), t.$imageWrapEl.transition(h).transform("translate3d(" + i.currentX + "px, " + i.currentY + "px,0)") } }, onTransitionEnd: function () { var e = this.zoom, t = e.gesture; t.$slideEl && this.previousIndex !== this.activeIndex && (t.$imageEl.transform("translate3d(0,0,0) scale(1)"), t.$imageWrapEl.transform("translate3d(0,0,0)"), e.scale = 1, e.currentScale = 1, t.$slideEl = void 0, t.$imageEl = void 0, t.$imageWrapEl = void 0) }, toggle: function (e) { var t = this.zoom; t.scale && 1 !== t.scale ? t.out() : t.in(e) }, in: function (e) { var t, i, a, r, n, o, l, d, h, p, c, u, v, f, m, g, b = this.zoom, w = this.params.zoom, y = b.gesture, x = b.image; (y.$slideEl || (y.$slideEl = this.clickedSlide ? s(this.clickedSlide) : this.slides.eq(this.activeIndex), y.$imageEl = y.$slideEl.find("img, svg, canvas"), y.$imageWrapEl = y.$imageEl.parent("." + w.containerClass)), y.$imageEl && 0 !== y.$imageEl.length) && (y.$slideEl.addClass("" + w.zoomedSlideClass), void 0 === x.touchesStart.x && e ? (t = "touchend" === e.type ? e.changedTouches[0].pageX : e.pageX, i = "touchend" === e.type ? e.changedTouches[0].pageY : e.pageY) : (t = x.touchesStart.x, i = x.touchesStart.y), b.scale = y.$imageWrapEl.attr("data-swiper-zoom") || w.maxRatio, b.currentScale = y.$imageWrapEl.attr("data-swiper-zoom") || w.maxRatio, e ? (m = y.$slideEl[0].offsetWidth, g = y.$slideEl[0].offsetHeight, a = y.$slideEl.offset().left + m / 2 - t, r = y.$slideEl.offset().top + g / 2 - i, l = y.$imageEl[0].offsetWidth, d = y.$imageEl[0].offsetHeight, h = l * b.scale, p = d * b.scale, v = -(c = Math.min(m / 2 - h / 2, 0)), f = -(u = Math.min(g / 2 - p / 2, 0)), (n = a * b.scale) < c && (n = c), n > v && (n = v), (o = r * b.scale) < u && (o = u), o > f && (o = f)) : (n = 0, o = 0), y.$imageWrapEl.transition(300).transform("translate3d(" + n + "px, " + o + "px,0)"), y.$imageEl.transition(300).transform("translate3d(0,0,0) scale(" + b.scale + ")")) }, out: function () { var e = this.zoom, t = this.params.zoom, i = e.gesture; i.$slideEl || (i.$slideEl = this.clickedSlide ? s(this.clickedSlide) : this.slides.eq(this.activeIndex), i.$imageEl = i.$slideEl.find("img, svg, canvas"), i.$imageWrapEl = i.$imageEl.parent("." + t.containerClass)), i.$imageEl && 0 !== i.$imageEl.length && (e.scale = 1, e.currentScale = 1, i.$imageWrapEl.transition(300).transform("translate3d(0,0,0)"), i.$imageEl.transition(300).transform("translate3d(0,0,0) scale(1)"), i.$slideEl.removeClass("" + t.zoomedSlideClass), i.$slideEl = void 0) }, enable: function () { var e = this.zoom; if (!e.enabled) { e.enabled = !0; var t = !("touchstart" !== this.touchEvents.start || !o.passiveListener || !this.params.passiveListeners) && { passive: !0, capture: !1 }, i = !o.passiveListener || { passive: !1, capture: !0 }; o.gestures ? (this.$wrapperEl.on("gesturestart", ".swiper-slide", e.onGestureStart, t), this.$wrapperEl.on("gesturechange", ".swiper-slide", e.onGestureChange, t), this.$wrapperEl.on("gestureend", ".swiper-slide", e.onGestureEnd, t)) : "touchstart" === this.touchEvents.start && (this.$wrapperEl.on(this.touchEvents.start, ".swiper-slide", e.onGestureStart, t), this.$wrapperEl.on(this.touchEvents.move, ".swiper-slide", e.onGestureChange, t), this.$wrapperEl.on(this.touchEvents.end, ".swiper-slide", e.onGestureEnd, t), this.touchEvents.cancel && this.$wrapperEl.on(this.touchEvents.cancel, ".swiper-slide", e.onGestureEnd, t)), this.$wrapperEl.on(this.touchEvents.move, "." + this.params.zoom.containerClass, e.onTouchMove, i) } }, disable: function () { var e = this.zoom; if (e.enabled) { this.zoom.enabled = !1; var t = !("touchstart" !== this.touchEvents.start || !o.passiveListener || !this.params.passiveListeners) && { passive: !0, capture: !1 }, i = !o.passiveListener || { passive: !1, capture: !0 }; o.gestures ? (this.$wrapperEl.off("gesturestart", ".swiper-slide", e.onGestureStart, t), this.$wrapperEl.off("gesturechange", ".swiper-slide", e.onGestureChange, t), this.$wrapperEl.off("gestureend", ".swiper-slide", e.onGestureEnd, t)) : "touchstart" === this.touchEvents.start && (this.$wrapperEl.off(this.touchEvents.start, ".swiper-slide", e.onGestureStart, t), this.$wrapperEl.off(this.touchEvents.move, ".swiper-slide", e.onGestureChange, t), this.$wrapperEl.off(this.touchEvents.end, ".swiper-slide", e.onGestureEnd, t), this.touchEvents.cancel && this.$wrapperEl.off(this.touchEvents.cancel, ".swiper-slide", e.onGestureEnd, t)), this.$wrapperEl.off(this.touchEvents.move, "." + this.params.zoom.containerClass, e.onTouchMove, i) } } }, W = { loadInSlide: function (e, t) { void 0 === t && (t = !0); var i = this, a = i.params.lazy; if (void 0 !== e && 0 !== i.slides.length) { var r = i.virtual && i.params.virtual.enabled ? i.$wrapperEl.children("." + i.params.slideClass + '[data-swiper-slide-index="' + e + '"]') : i.slides.eq(e), n = r.find("." + a.elementClass + ":not(." + a.loadedClass + "):not(." + a.loadingClass + ")"); !r.hasClass(a.elementClass) || r.hasClass(a.loadedClass) || r.hasClass(a.loadingClass) || (n = n.add(r[0])), 0 !== n.length && n.each((function (e, n) { var o = s(n); o.addClass(a.loadingClass); var l = o.attr("data-background"), d = o.attr("data-src"), h = o.attr("data-srcset"), p = o.attr("data-sizes"); i.loadImage(o[0], d || l, h, p, !1, (function () { if (null != i && i && (!i || i.params) && !i.destroyed) { if (l ? (o.css("background-image", 'url("' + l + '")'), o.removeAttr("data-background")) : (h && (o.attr("srcset", h), o.removeAttr("data-srcset")), p && (o.attr("sizes", p), o.removeAttr("data-sizes")), d && (o.attr("src", d), o.removeAttr("data-src"))), o.addClass(a.loadedClass).removeClass(a.loadingClass), r.find("." + a.preloaderClass).remove(), i.params.loop && t) { var e = r.attr("data-swiper-slide-index"); if (r.hasClass(i.params.slideDuplicateClass)) { var s = i.$wrapperEl.children('[data-swiper-slide-index="' + e + '"]:not(.' + i.params.slideDuplicateClass + ")"); i.lazy.loadInSlide(s.index(), !1) } else { var n = i.$wrapperEl.children("." + i.params.slideDuplicateClass + '[data-swiper-slide-index="' + e + '"]'); i.lazy.loadInSlide(n.index(), !1) } } i.emit("lazyImageReady", r[0], o[0]) } })), i.emit("lazyImageLoad", r[0], o[0]) })) } }, load: function () { var e = this, t = e.$wrapperEl, i = e.params, a = e.slides, r = e.activeIndex, n = e.virtual && i.virtual.enabled, o = i.lazy, l = i.slidesPerView; function d(e) { if (n) { if (t.children("." + i.slideClass + '[data-swiper-slide-index="' + e + '"]').length) return !0 } else if (a[e]) return !0; return !1 } function h(e) { return n ? s(e).attr("data-swiper-slide-index") : s(e).index() } if ("auto" === l && (l = 0), e.lazy.initialImageLoaded || (e.lazy.initialImageLoaded = !0), e.params.watchSlidesVisibility) t.children("." + i.slideVisibleClass).each((function (t, i) { var a = n ? s(i).attr("data-swiper-slide-index") : s(i).index(); e.lazy.loadInSlide(a) })); else if (l > 1) for (var p = r; p < r + l; p += 1)d(p) && e.lazy.loadInSlide(p); else e.lazy.loadInSlide(r); if (o.loadPrevNext) if (l > 1 || o.loadPrevNextAmount && o.loadPrevNextAmount > 1) { for (var c = o.loadPrevNextAmount, u = l, v = Math.min(r + u + Math.max(c, u), a.length), f = Math.max(r - Math.max(u, c), 0), m = r + l; m < v; m += 1)d(m) && e.lazy.loadInSlide(m); for (var g = f; g < r; g += 1)d(g) && e.lazy.loadInSlide(g) } else { var b = t.children("." + i.slideNextClass); b.length > 0 && e.lazy.loadInSlide(h(b)); var w = t.children("." + i.slidePrevClass); w.length > 0 && e.lazy.loadInSlide(h(w)) } } }, j = { LinearSpline: function (e, t) { var i, s, a, r, n, o = function (e, t) { for (s = -1, i = e.length; i - s > 1;)e[a = i + s >> 1] <= t ? s = a : i = a; return i }; return this.x = e, this.y = t, this.lastIndex = e.length - 1, this.interpolate = function (e) { return e ? (n = o(this.x, e), r = n - 1, (e - this.x[r]) * (this.y[n] - this.y[r]) / (this.x[n] - this.x[r]) + this.y[r]) : 0 }, this }, getInterpolateFunction: function (e) { this.controller.spline || (this.controller.spline = this.params.loop ? new j.LinearSpline(this.slidesGrid, e.slidesGrid) : new j.LinearSpline(this.snapGrid, e.snapGrid)) }, setTranslate: function (e, t) { var i, s, a = this, r = a.controller.control; function n(e) { var t = a.rtlTranslate ? -a.translate : a.translate; "slide" === a.params.controller.by && (a.controller.getInterpolateFunction(e), s = -a.controller.spline.interpolate(-t)), s && "container" !== a.params.controller.by || (i = (e.maxTranslate() - e.minTranslate()) / (a.maxTranslate() - a.minTranslate()), s = (t - a.minTranslate()) * i + e.minTranslate()), a.params.controller.inverse && (s = e.maxTranslate() - s), e.updateProgress(s), e.setTranslate(s, a), e.updateActiveIndex(), e.updateSlidesClasses() } if (Array.isArray(r)) for (var o = 0; o < r.length; o += 1)r[o] !== t && r[o] instanceof z && n(r[o]); else r instanceof z && t !== r && n(r) }, setTransition: function (e, t) { var i, s = this, a = s.controller.control; function r(t) { t.setTransition(e, s), 0 !== e && (t.transitionStart(), t.params.autoHeight && n.nextTick((function () { t.updateAutoHeight() })), t.$wrapperEl.transitionEnd((function () { a && (t.params.loop && "slide" === s.params.controller.by && t.loopFix(), t.transitionEnd()) }))) } if (Array.isArray(a)) for (i = 0; i < a.length; i += 1)a[i] !== t && a[i] instanceof z && r(a[i]); else a instanceof z && t !== a && r(a) } }, U = { makeElFocusable: function (e) { return e.attr("tabIndex", "0"), e }, addElRole: function (e, t) { return e.attr("role", t), e }, addElLabel: function (e, t) { return e.attr("aria-label", t), e }, disableEl: function (e) { return e.attr("aria-disabled", !0), e }, enableEl: function (e) { return e.attr("aria-disabled", !1), e }, onEnterKey: function (e) { var t = this.params.a11y; if (13 === e.keyCode) { var i = s(e.target); this.navigation && this.navigation.$nextEl && i.is(this.navigation.$nextEl) && (this.isEnd && !this.params.loop || this.slideNext(), this.isEnd ? this.a11y.notify(t.lastSlideMessage) : this.a11y.notify(t.nextSlideMessage)), this.navigation && this.navigation.$prevEl && i.is(this.navigation.$prevEl) && (this.isBeginning && !this.params.loop || this.slidePrev(), this.isBeginning ? this.a11y.notify(t.firstSlideMessage) : this.a11y.notify(t.prevSlideMessage)), this.pagination && i.is("." + this.params.pagination.bulletClass) && i[0].click() } }, notify: function (e) { var t = this.a11y.liveRegion; 0 !== t.length && (t.html(""), t.html(e)) }, updateNavigation: function () { if (!this.params.loop) { var e = this.navigation, t = e.$nextEl, i = e.$prevEl; i && i.length > 0 && (this.isBeginning ? this.a11y.disableEl(i) : this.a11y.enableEl(i)), t && t.length > 0 && (this.isEnd ? this.a11y.disableEl(t) : this.a11y.enableEl(t)) } }, updatePagination: function () { var e = this, t = e.params.a11y; e.pagination && e.params.pagination.clickable && e.pagination.bullets && e.pagination.bullets.length && e.pagination.bullets.each((function (i, a) { var r = s(a); e.a11y.makeElFocusable(r), e.a11y.addElRole(r, "button"), e.a11y.addElLabel(r, t.paginationBulletMessage.replace(/{{index}}/, r.index() + 1)) })) }, init: function () { this.$el.append(this.a11y.liveRegion); var e, t, i = this.params.a11y; this.navigation && this.navigation.$nextEl && (e = this.navigation.$nextEl), this.navigation && this.navigation.$prevEl && (t = this.navigation.$prevEl), e && (this.a11y.makeElFocusable(e), this.a11y.addElRole(e, "button"), this.a11y.addElLabel(e, i.nextSlideMessage), e.on("keydown", this.a11y.onEnterKey)), t && (this.a11y.makeElFocusable(t), this.a11y.addElRole(t, "button"), this.a11y.addElLabel(t, i.prevSlideMessage), t.on("keydown", this.a11y.onEnterKey)), this.pagination && this.params.pagination.clickable && this.pagination.bullets && this.pagination.bullets.length && this.pagination.$el.on("keydown", "." + this.params.pagination.bulletClass, this.a11y.onEnterKey) }, destroy: function () { var e, t; this.a11y.liveRegion && this.a11y.liveRegion.length > 0 && this.a11y.liveRegion.remove(), this.navigation && this.navigation.$nextEl && (e = this.navigation.$nextEl), this.navigation && this.navigation.$prevEl && (t = this.navigation.$prevEl), e && e.off("keydown", this.a11y.onEnterKey), t && t.off("keydown", this.a11y.onEnterKey), this.pagination && this.params.pagination.clickable && this.pagination.bullets && this.pagination.bullets.length && this.pagination.$el.off("keydown", "." + this.params.pagination.bulletClass, this.a11y.onEnterKey) } }, K = { init: function () { if (this.params.history) { if (!t.history || !t.history.pushState) return this.params.history.enabled = !1, void (this.params.hashNavigation.enabled = !0); var e = this.history; e.initialized = !0, e.paths = K.getPathValues(), (e.paths.key || e.paths.value) && (e.scrollToSlide(0, e.paths.value, this.params.runCallbacksOnInit), this.params.history.replaceState || t.addEventListener("popstate", this.history.setHistoryPopState)) } }, destroy: function () { this.params.history.replaceState || t.removeEventListener("popstate", this.history.setHistoryPopState) }, setHistoryPopState: function () { this.history.paths = K.getPathValues(), this.history.scrollToSlide(this.params.speed, this.history.paths.value, !1) }, getPathValues: function () { var e = t.location.pathname.slice(1).split("/").filter((function (e) { return "" !== e })), i = e.length; return { key: e[i - 2], value: e[i - 1] } }, setHistory: function (e, i) { if (this.history.initialized && this.params.history.enabled) { var s = this.slides.eq(i), a = K.slugify(s.attr("data-history")); t.location.pathname.includes(e) || (a = e + "/" + a); var r = t.history.state; r && r.value === a || (this.params.history.replaceState ? t.history.replaceState({ value: a }, null, a) : t.history.pushState({ value: a }, null, a)) } }, slugify: function (e) { return e.toString().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+/, "").replace(/-+$/, "") }, scrollToSlide: function (e, t, i) { if (t) for (var s = 0, a = this.slides.length; s < a; s += 1) { var r = this.slides.eq(s); if (K.slugify(r.attr("data-history")) === t && !r.hasClass(this.params.slideDuplicateClass)) { var n = r.index(); this.slideTo(n, e, i) } } else this.slideTo(0, e, i) } }, _ = { onHashCange: function () { var t = e.location.hash.replace("#", ""); if (t !== this.slides.eq(this.activeIndex).attr("data-hash")) { var i = this.$wrapperEl.children("." + this.params.slideClass + '[data-hash="' + t + '"]').index(); if (void 0 === i) return; this.slideTo(i) } }, setHash: function () { if (this.hashNavigation.initialized && this.params.hashNavigation.enabled) if (this.params.hashNavigation.replaceState && t.history && t.history.replaceState) t.history.replaceState(null, null, "#" + this.slides.eq(this.activeIndex).attr("data-hash") || ""); else { var i = this.slides.eq(this.activeIndex), s = i.attr("data-hash") || i.attr("data-history"); e.location.hash = s || "" } }, init: function () { if (!(!this.params.hashNavigation.enabled || this.params.history && this.params.history.enabled)) { this.hashNavigation.initialized = !0; var i = e.location.hash.replace("#", ""); if (i) for (var a = 0, r = this.slides.length; a < r; a += 1) { var n = this.slides.eq(a); if ((n.attr("data-hash") || n.attr("data-history")) === i && !n.hasClass(this.params.slideDuplicateClass)) { var o = n.index(); this.slideTo(o, 0, this.params.runCallbacksOnInit, !0) } } this.params.hashNavigation.watchState && s(t).on("hashchange", this.hashNavigation.onHashCange) } }, destroy: function () { this.params.hashNavigation.watchState && s(t).off("hashchange", this.hashNavigation.onHashCange) } }, Z = { run: function () { var e = this, t = e.slides.eq(e.activeIndex), i = e.params.autoplay.delay; t.attr("data-swiper-autoplay") && (i = t.attr("data-swiper-autoplay") || e.params.autoplay.delay), clearTimeout(e.autoplay.timeout), e.autoplay.timeout = n.nextTick((function () { e.params.autoplay.reverseDirection ? e.params.loop ? (e.loopFix(), e.slidePrev(e.params.speed, !0, !0), e.emit("autoplay")) : e.isBeginning ? e.params.autoplay.stopOnLastSlide ? e.autoplay.stop() : (e.slideTo(e.slides.length - 1, e.params.speed, !0, !0), e.emit("autoplay")) : (e.slidePrev(e.params.speed, !0, !0), e.emit("autoplay")) : e.params.loop ? (e.loopFix(), e.slideNext(e.params.speed, !0, !0), e.emit("autoplay")) : e.isEnd ? e.params.autoplay.stopOnLastSlide ? e.autoplay.stop() : (e.slideTo(0, e.params.speed, !0, !0), e.emit("autoplay")) : (e.slideNext(e.params.speed, !0, !0), e.emit("autoplay")), e.params.cssMode && e.autoplay.running && e.autoplay.run() }), i) }, start: function () { return void 0 === this.autoplay.timeout && (!this.autoplay.running && (this.autoplay.running = !0, this.emit("autoplayStart"), this.autoplay.run(), !0)) }, stop: function () { return !!this.autoplay.running && (void 0 !== this.autoplay.timeout && (this.autoplay.timeout && (clearTimeout(this.autoplay.timeout), this.autoplay.timeout = void 0), this.autoplay.running = !1, this.emit("autoplayStop"), !0)) }, pause: function (e) { this.autoplay.running && (this.autoplay.paused || (this.autoplay.timeout && clearTimeout(this.autoplay.timeout), this.autoplay.paused = !0, 0 !== e && this.params.autoplay.waitForTransition ? (this.$wrapperEl[0].addEventListener("transitionend", this.autoplay.onTransitionEnd), this.$wrapperEl[0].addEventListener("webkitTransitionEnd", this.autoplay.onTransitionEnd)) : (this.autoplay.paused = !1, this.autoplay.run()))) } }, Q = { setTranslate: function () { for (var e = this.slides, t = 0; t < e.length; t += 1) { var i = this.slides.eq(t), s = -i[0].swiperSlideOffset; this.params.virtualTranslate || (s -= this.translate); var a = 0; this.isHorizontal() || (a = s, s = 0); var r = this.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(i[0].progress), 0) : 1 + Math.min(Math.max(i[0].progress, -1), 0); i.css({ opacity: r }).transform("translate3d(" + s + "px, " + a + "px, 0px)") } }, setTransition: function (e) { var t = this, i = t.slides, s = t.$wrapperEl; if (i.transition(e), t.params.virtualTranslate && 0 !== e) { var a = !1; i.transitionEnd((function () { if (!a && t && !t.destroyed) { a = !0, t.animating = !1; for (var e = ["webkitTransitionEnd", "transitionend"], i = 0; i < e.length; i += 1)s.trigger(e[i]) } })) } } }, J = { setTranslate: function () { var e, t = this.$el, i = this.$wrapperEl, a = this.slides, r = this.width, n = this.height, o = this.rtlTranslate, l = this.size, d = this.params.cubeEffect, h = this.isHorizontal(), p = this.virtual && this.params.virtual.enabled, c = 0; d.shadow && (h ? (0 === (e = i.find(".swiper-cube-shadow")).length && (e = s('<div class="swiper-cube-shadow"></div>'), i.append(e)), e.css({ height: r + "px" })) : 0 === (e = t.find(".swiper-cube-shadow")).length && (e = s('<div class="swiper-cube-shadow"></div>'), t.append(e))); for (var u = 0; u < a.length; u += 1) { var v = a.eq(u), f = u; p && (f = parseInt(v.attr("data-swiper-slide-index"), 10)); var m = 90 * f, g = Math.floor(m / 360); o && (m = -m, g = Math.floor(-m / 360)); var b = Math.max(Math.min(v[0].progress, 1), -1), w = 0, y = 0, x = 0; f % 4 == 0 ? (w = 4 * -g * l, x = 0) : (f - 1) % 4 == 0 ? (w = 0, x = 4 * -g * l) : (f - 2) % 4 == 0 ? (w = l + 4 * g * l, x = l) : (f - 3) % 4 == 0 && (w = -l, x = 3 * l + 4 * l * g), o && (w = -w), h || (y = w, w = 0); var E = "rotateX(" + (h ? 0 : -m) + "deg) rotateY(" + (h ? m : 0) + "deg) translate3d(" + w + "px, " + y + "px, " + x + "px)"; if (b <= 1 && b > -1 && (c = 90 * f + 90 * b, o && (c = 90 * -f - 90 * b)), v.transform(E), d.slideShadows) { var T = h ? v.find(".swiper-slide-shadow-left") : v.find(".swiper-slide-shadow-top"), C = h ? v.find(".swiper-slide-shadow-right") : v.find(".swiper-slide-shadow-bottom"); 0 === T.length && (T = s('<div class="swiper-slide-shadow-' + (h ? "left" : "top") + '"></div>'), v.append(T)), 0 === C.length && (C = s('<div class="swiper-slide-shadow-' + (h ? "right" : "bottom") + '"></div>'), v.append(C)), T.length && (T[0].style.opacity = Math.max(-b, 0)), C.length && (C[0].style.opacity = Math.max(b, 0)) } } if (i.css({ "-webkit-transform-origin": "50% 50% -" + l / 2 + "px", "-moz-transform-origin": "50% 50% -" + l / 2 + "px", "-ms-transform-origin": "50% 50% -" + l / 2 + "px", "transform-origin": "50% 50% -" + l / 2 + "px" }), d.shadow) if (h) e.transform("translate3d(0px, " + (r / 2 + d.shadowOffset) + "px, " + -r / 2 + "px) rotateX(90deg) rotateZ(0deg) scale(" + d.shadowScale + ")"); else { var S = Math.abs(c) - 90 * Math.floor(Math.abs(c) / 90), M = 1.5 - (Math.sin(2 * S * Math.PI / 360) / 2 + Math.cos(2 * S * Math.PI / 360) / 2), P = d.shadowScale, z = d.shadowScale / M, k = d.shadowOffset; e.transform("scale3d(" + P + ", 1, " + z + ") translate3d(0px, " + (n / 2 + k) + "px, " + -n / 2 / z + "px) rotateX(-90deg)") } var $ = L.isSafari || L.isUiWebView ? -l / 2 : 0; i.transform("translate3d(0px,0," + $ + "px) rotateX(" + (this.isHorizontal() ? 0 : c) + "deg) rotateY(" + (this.isHorizontal() ? -c : 0) + "deg)") }, setTransition: function (e) { var t = this.$el; this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e), this.params.cubeEffect.shadow && !this.isHorizontal() && t.find(".swiper-cube-shadow").transition(e) } }, ee = { setTranslate: function () { for (var e = this.slides, t = this.rtlTranslate, i = 0; i < e.length; i += 1) { var a = e.eq(i), r = a[0].progress; this.params.flipEffect.limitRotation && (r = Math.max(Math.min(a[0].progress, 1), -1)); var n = -180 * r, o = 0, l = -a[0].swiperSlideOffset, d = 0; if (this.isHorizontal() ? t && (n = -n) : (d = l, l = 0, o = -n, n = 0), a[0].style.zIndex = -Math.abs(Math.round(r)) + e.length, this.params.flipEffect.slideShadows) { var h = this.isHorizontal() ? a.find(".swiper-slide-shadow-left") : a.find(".swiper-slide-shadow-top"), p = this.isHorizontal() ? a.find(".swiper-slide-shadow-right") : a.find(".swiper-slide-shadow-bottom"); 0 === h.length && (h = s('<div class="swiper-slide-shadow-' + (this.isHorizontal() ? "left" : "top") + '"></div>'), a.append(h)), 0 === p.length && (p = s('<div class="swiper-slide-shadow-' + (this.isHorizontal() ? "right" : "bottom") + '"></div>'), a.append(p)), h.length && (h[0].style.opacity = Math.max(-r, 0)), p.length && (p[0].style.opacity = Math.max(r, 0)) } a.transform("translate3d(" + l + "px, " + d + "px, 0px) rotateX(" + o + "deg) rotateY(" + n + "deg)") } }, setTransition: function (e) { var t = this, i = t.slides, s = t.activeIndex, a = t.$wrapperEl; if (i.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e), t.params.virtualTranslate && 0 !== e) { var r = !1; i.eq(s).transitionEnd((function () { if (!r && t && !t.destroyed) { r = !0, t.animating = !1; for (var e = ["webkitTransitionEnd", "transitionend"], i = 0; i < e.length; i += 1)a.trigger(e[i]) } })) } } }, te = { setTranslate: function () { for (var e = this.width, t = this.height, i = this.slides, a = this.$wrapperEl, r = this.slidesSizesGrid, n = this.params.coverflowEffect, l = this.isHorizontal(), d = this.translate, h = l ? e / 2 - d : t / 2 - d, p = l ? n.rotate : -n.rotate, c = n.depth, u = 0, v = i.length; u < v; u += 1) { var f = i.eq(u), m = r[u], g = (h - f[0].swiperSlideOffset - m / 2) / m * n.modifier, b = l ? p * g : 0, w = l ? 0 : p * g, y = -c * Math.abs(g), x = l ? 0 : n.stretch * g, E = l ? n.stretch * g : 0; Math.abs(E) < .001 && (E = 0), Math.abs(x) < .001 && (x = 0), Math.abs(y) < .001 && (y = 0), Math.abs(b) < .001 && (b = 0), Math.abs(w) < .001 && (w = 0); var T = "translate3d(" + E + "px," + x + "px," + y + "px)  rotateX(" + w + "deg) rotateY(" + b + "deg)"; if (f.transform(T), f[0].style.zIndex = 1 - Math.abs(Math.round(g)), n.slideShadows) { var C = l ? f.find(".swiper-slide-shadow-left") : f.find(".swiper-slide-shadow-top"), S = l ? f.find(".swiper-slide-shadow-right") : f.find(".swiper-slide-shadow-bottom"); 0 === C.length && (C = s('<div class="swiper-slide-shadow-' + (l ? "left" : "top") + '"></div>'), f.append(C)), 0 === S.length && (S = s('<div class="swiper-slide-shadow-' + (l ? "right" : "bottom") + '"></div>'), f.append(S)), C.length && (C[0].style.opacity = g > 0 ? g : 0), S.length && (S[0].style.opacity = -g > 0 ? -g : 0) } } (o.pointerEvents || o.prefixedPointerEvents) && (a[0].style.perspectiveOrigin = h + "px 50%") }, setTransition: function (e) { this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e) } }, ie = { init: function () { var e = this.params.thumbs, t = this.constructor; e.swiper instanceof t ? (this.thumbs.swiper = e.swiper, n.extend(this.thumbs.swiper.originalParams, { watchSlidesProgress: !0, slideToClickedSlide: !1 }), n.extend(this.thumbs.swiper.params, { watchSlidesProgress: !0, slideToClickedSlide: !1 })) : n.isObject(e.swiper) && (this.thumbs.swiper = new t(n.extend({}, e.swiper, { watchSlidesVisibility: !0, watchSlidesProgress: !0, slideToClickedSlide: !1 })), this.thumbs.swiperCreated = !0), this.thumbs.swiper.$el.addClass(this.params.thumbs.thumbsContainerClass), this.thumbs.swiper.on("tap", this.thumbs.onThumbClick) }, onThumbClick: function () { var e = this.thumbs.swiper; if (e) { var t = e.clickedIndex, i = e.clickedSlide; if (!(i && s(i).hasClass(this.params.thumbs.slideThumbActiveClass) || null == t)) { var a; if (a = e.params.loop ? parseInt(s(e.clickedSlide).attr("data-swiper-slide-index"), 10) : t, this.params.loop) { var r = this.activeIndex; this.slides.eq(r).hasClass(this.params.slideDuplicateClass) && (this.loopFix(), this._clientLeft = this.$wrapperEl[0].clientLeft, r = this.activeIndex); var n = this.slides.eq(r).prevAll('[data-swiper-slide-index="' + a + '"]').eq(0).index(), o = this.slides.eq(r).nextAll('[data-swiper-slide-index="' + a + '"]').eq(0).index(); a = void 0 === n ? o : void 0 === o ? n : o - r < r - n ? o : n } this.slideTo(a) } } }, update: function (e) { var t = this.thumbs.swiper; if (t) { var i = "auto" === t.params.slidesPerView ? t.slidesPerViewDynamic() : t.params.slidesPerView; if (this.realIndex !== t.realIndex) { var s, a = t.activeIndex; if (t.params.loop) { t.slides.eq(a).hasClass(t.params.slideDuplicateClass) && (t.loopFix(), t._clientLeft = t.$wrapperEl[0].clientLeft, a = t.activeIndex); var r = t.slides.eq(a).prevAll('[data-swiper-slide-index="' + this.realIndex + '"]').eq(0).index(), n = t.slides.eq(a).nextAll('[data-swiper-slide-index="' + this.realIndex + '"]').eq(0).index(); s = void 0 === r ? n : void 0 === n ? r : n - a == a - r ? a : n - a < a - r ? n : r } else s = this.realIndex; t.visibleSlidesIndexes && t.visibleSlidesIndexes.indexOf(s) < 0 && (t.params.centeredSlides ? s = s > a ? s - Math.floor(i / 2) + 1 : s + Math.floor(i / 2) - 1 : s > a && (s = s - i + 1), t.slideTo(s, e ? 0 : void 0)) } var o = 1, l = this.params.thumbs.slideThumbActiveClass; if (this.params.slidesPerView > 1 && !this.params.centeredSlides && (o = this.params.slidesPerView), t.slides.removeClass(l), t.params.loop || t.params.virtual && t.params.virtual.enabled) for (var d = 0; d < o; d += 1)t.$wrapperEl.children('[data-swiper-slide-index="' + (this.realIndex + d) + '"]').addClass(l); else for (var h = 0; h < o; h += 1)t.slides.eq(this.realIndex + h).addClass(l) } } }, se = [k, $, I, D, A, G, B, { name: "mousewheel", params: { mousewheel: { enabled: !1, releaseOnEdges: !1, invert: !1, forceToAxis: !1, sensitivity: 1, eventsTarged: "container" } }, create: function () { n.extend(this, { mousewheel: { enabled: !1, enable: V.enable.bind(this), disable: V.disable.bind(this), handle: V.handle.bind(this), handleMouseEnter: V.handleMouseEnter.bind(this), handleMouseLeave: V.handleMouseLeave.bind(this), lastScrollTime: n.now() } }) }, on: { init: function () { !this.params.mousewheel.enabled && this.params.cssMode && this.mousewheel.disable(), this.params.mousewheel.enabled && this.mousewheel.enable() }, destroy: function () { this.params.cssMode && this.mousewheel.enable(), this.mousewheel.enabled && this.mousewheel.disable() } } }, { name: "navigation", params: { navigation: { nextEl: null, prevEl: null, hideOnClick: !1, disabledClass: "swiper-button-disabled", hiddenClass: "swiper-button-hidden", lockClass: "swiper-button-lock" } }, create: function () { n.extend(this, { navigation: { init: X.init.bind(this), update: X.update.bind(this), destroy: X.destroy.bind(this), onNextClick: X.onNextClick.bind(this), onPrevClick: X.onPrevClick.bind(this) } }) }, on: { init: function () { this.navigation.init(), this.navigation.update() }, toEdge: function () { this.navigation.update() }, fromEdge: function () { this.navigation.update() }, destroy: function () { this.navigation.destroy() }, click: function (e) { var t, i = this.navigation, a = i.$nextEl, r = i.$prevEl; !this.params.navigation.hideOnClick || s(e.target).is(r) || s(e.target).is(a) || (a ? t = a.hasClass(this.params.navigation.hiddenClass) : r && (t = r.hasClass(this.params.navigation.hiddenClass)), !0 === t ? this.emit("navigationShow", this) : this.emit("navigationHide", this), a && a.toggleClass(this.params.navigation.hiddenClass), r && r.toggleClass(this.params.navigation.hiddenClass)) } } }, { name: "pagination", params: { pagination: { el: null, bulletElement: "span", clickable: !1, hideOnClick: !1, renderBullet: null, renderProgressbar: null, renderFraction: null, renderCustom: null, progressbarOpposite: !1, type: "bullets", dynamicBullets: !1, dynamicMainBullets: 1, formatFractionCurrent: function (e) { return e }, formatFractionTotal: function (e) { return e }, bulletClass: "swiper-pagination-bullet", bulletActiveClass: "swiper-pagination-bullet-active", modifierClass: "swiper-pagination-", currentClass: "swiper-pagination-current", totalClass: "swiper-pagination-total", hiddenClass: "swiper-pagination-hidden", progressbarFillClass: "swiper-pagination-progressbar-fill", progressbarOppositeClass: "swiper-pagination-progressbar-opposite", clickableClass: "swiper-pagination-clickable", lockClass: "swiper-pagination-lock" } }, create: function () { n.extend(this, { pagination: { init: Y.init.bind(this), render: Y.render.bind(this), update: Y.update.bind(this), destroy: Y.destroy.bind(this), dynamicBulletIndex: 0 } }) }, on: { init: function () { this.pagination.init(), this.pagination.render(), this.pagination.update() }, activeIndexChange: function () { this.params.loop ? this.pagination.update() : void 0 === this.snapIndex && this.pagination.update() }, snapIndexChange: function () { this.params.loop || this.pagination.update() }, slidesLengthChange: function () { this.params.loop && (this.pagination.render(), this.pagination.update()) }, snapGridLengthChange: function () { this.params.loop || (this.pagination.render(), this.pagination.update()) }, destroy: function () { this.pagination.destroy() }, click: function (e) { this.params.pagination.el && this.params.pagination.hideOnClick && this.pagination.$el.length > 0 && !s(e.target).hasClass(this.params.pagination.bulletClass) && (!0 === this.pagination.$el.hasClass(this.params.pagination.hiddenClass) ? this.emit("paginationShow", this) : this.emit("paginationHide", this), this.pagination.$el.toggleClass(this.params.pagination.hiddenClass)) } } }, { name: "scrollbar", params: { scrollbar: { el: null, dragSize: "auto", hide: !1, draggable: !1, snapOnRelease: !0, lockClass: "swiper-scrollbar-lock", dragClass: "swiper-scrollbar-drag" } }, create: function () { n.extend(this, { scrollbar: { init: F.init.bind(this), destroy: F.destroy.bind(this), updateSize: F.updateSize.bind(this), setTranslate: F.setTranslate.bind(this), setTransition: F.setTransition.bind(this), enableDraggable: F.enableDraggable.bind(this), disableDraggable: F.disableDraggable.bind(this), setDragPosition: F.setDragPosition.bind(this), getPointerPosition: F.getPointerPosition.bind(this), onDragStart: F.onDragStart.bind(this), onDragMove: F.onDragMove.bind(this), onDragEnd: F.onDragEnd.bind(this), isTouched: !1, timeout: null, dragTimeout: null } }) }, on: { init: function () { this.scrollbar.init(), this.scrollbar.updateSize(), this.scrollbar.setTranslate() }, update: function () { this.scrollbar.updateSize() }, resize: function () { this.scrollbar.updateSize() }, observerUpdate: function () { this.scrollbar.updateSize() }, setTranslate: function () { this.scrollbar.setTranslate() }, setTransition: function (e) { this.scrollbar.setTransition(e) }, destroy: function () { this.scrollbar.destroy() } } }, { name: "parallax", params: { parallax: { enabled: !1 } }, create: function () { n.extend(this, { parallax: { setTransform: R.setTransform.bind(this), setTranslate: R.setTranslate.bind(this), setTransition: R.setTransition.bind(this) } }) }, on: { beforeInit: function () { this.params.parallax.enabled && (this.params.watchSlidesProgress = !0, this.originalParams.watchSlidesProgress = !0) }, init: function () { this.params.parallax.enabled && this.parallax.setTranslate() }, setTranslate: function () { this.params.parallax.enabled && this.parallax.setTranslate() }, setTransition: function (e) { this.params.parallax.enabled && this.parallax.setTransition(e) } } }, { name: "zoom", params: { zoom: { enabled: !1, maxRatio: 3, minRatio: 1, toggle: !0, containerClass: "swiper-zoom-container", zoomedSlideClass: "swiper-slide-zoomed" } }, create: function () { var e = this, t = { enabled: !1, scale: 1, currentScale: 1, isScaling: !1, gesture: { $slideEl: void 0, slideWidth: void 0, slideHeight: void 0, $imageEl: void 0, $imageWrapEl: void 0, maxRatio: 3 }, image: { isTouched: void 0, isMoved: void 0, currentX: void 0, currentY: void 0, minX: void 0, minY: void 0, maxX: void 0, maxY: void 0, width: void 0, height: void 0, startX: void 0, startY: void 0, touchesStart: {}, touchesCurrent: {} }, velocity: { x: void 0, y: void 0, prevPositionX: void 0, prevPositionY: void 0, prevTime: void 0 } }; "onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out".split(" ").forEach((function (i) { t[i] = q[i].bind(e) })), n.extend(e, { zoom: t }); var i = 1; Object.defineProperty(e.zoom, "scale", { get: function () { return i }, set: function (t) { if (i !== t) { var s = e.zoom.gesture.$imageEl ? e.zoom.gesture.$imageEl[0] : void 0, a = e.zoom.gesture.$slideEl ? e.zoom.gesture.$slideEl[0] : void 0; e.emit("zoomChange", t, s, a) } i = t } }) }, on: { init: function () { this.params.zoom.enabled && this.zoom.enable() }, destroy: function () { this.zoom.disable() }, touchStart: function (e) { this.zoom.enabled && this.zoom.onTouchStart(e) }, touchEnd: function (e) { this.zoom.enabled && this.zoom.onTouchEnd(e) }, doubleTap: function (e) { this.params.zoom.enabled && this.zoom.enabled && this.params.zoom.toggle && this.zoom.toggle(e) }, transitionEnd: function () { this.zoom.enabled && this.params.zoom.enabled && this.zoom.onTransitionEnd() }, slideChange: function () { this.zoom.enabled && this.params.zoom.enabled && this.params.cssMode && this.zoom.onTransitionEnd() } } }, { name: "lazy", params: { lazy: { enabled: !1, loadPrevNext: !1, loadPrevNextAmount: 1, loadOnTransitionStart: !1, elementClass: "swiper-lazy", loadingClass: "swiper-lazy-loading", loadedClass: "swiper-lazy-loaded", preloaderClass: "swiper-lazy-preloader" } }, create: function () { n.extend(this, { lazy: { initialImageLoaded: !1, load: W.load.bind(this), loadInSlide: W.loadInSlide.bind(this) } }) }, on: { beforeInit: function () { this.params.lazy.enabled && this.params.preloadImages && (this.params.preloadImages = !1) }, init: function () { this.params.lazy.enabled && !this.params.loop && 0 === this.params.initialSlide && this.lazy.load() }, scroll: function () { this.params.freeMode && !this.params.freeModeSticky && this.lazy.load() }, resize: function () { this.params.lazy.enabled && this.lazy.load() }, scrollbarDragMove: function () { this.params.lazy.enabled && this.lazy.load() }, transitionStart: function () { this.params.lazy.enabled && (this.params.lazy.loadOnTransitionStart || !this.params.lazy.loadOnTransitionStart && !this.lazy.initialImageLoaded) && this.lazy.load() }, transitionEnd: function () { this.params.lazy.enabled && !this.params.lazy.loadOnTransitionStart && this.lazy.load() }, slideChange: function () { this.params.lazy.enabled && this.params.cssMode && this.lazy.load() } } }, { name: "controller", params: { controller: { control: void 0, inverse: !1, by: "slide" } }, create: function () { n.extend(this, { controller: { control: this.params.controller.control, getInterpolateFunction: j.getInterpolateFunction.bind(this), setTranslate: j.setTranslate.bind(this), setTransition: j.setTransition.bind(this) } }) }, on: { update: function () { this.controller.control && this.controller.spline && (this.controller.spline = void 0, delete this.controller.spline) }, resize: function () { this.controller.control && this.controller.spline && (this.controller.spline = void 0, delete this.controller.spline) }, observerUpdate: function () { this.controller.control && this.controller.spline && (this.controller.spline = void 0, delete this.controller.spline) }, setTranslate: function (e, t) { this.controller.control && this.controller.setTranslate(e, t) }, setTransition: function (e, t) { this.controller.control && this.controller.setTransition(e, t) } } }, { name: "a11y", params: { a11y: { enabled: !0, notificationClass: "swiper-notification", prevSlideMessage: "Previous slide", nextSlideMessage: "Next slide", firstSlideMessage: "This is the first slide", lastSlideMessage: "This is the last slide", paginationBulletMessage: "Go to slide {{index}}" } }, create: function () { var e = this; n.extend(e, { a11y: { liveRegion: s('<span class="' + e.params.a11y.notificationClass + '" aria-live="assertive" aria-atomic="true"></span>') } }), Object.keys(U).forEach((function (t) { e.a11y[t] = U[t].bind(e) })) }, on: { init: function () { this.params.a11y.enabled && (this.a11y.init(), this.a11y.updateNavigation()) }, toEdge: function () { this.params.a11y.enabled && this.a11y.updateNavigation() }, fromEdge: function () { this.params.a11y.enabled && this.a11y.updateNavigation() }, paginationUpdate: function () { this.params.a11y.enabled && this.a11y.updatePagination() }, destroy: function () { this.params.a11y.enabled && this.a11y.destroy() } } }, { name: "history", params: { history: { enabled: !1, replaceState: !1, key: "slides" } }, create: function () { n.extend(this, { history: { init: K.init.bind(this), setHistory: K.setHistory.bind(this), setHistoryPopState: K.setHistoryPopState.bind(this), scrollToSlide: K.scrollToSlide.bind(this), destroy: K.destroy.bind(this) } }) }, on: { init: function () { this.params.history.enabled && this.history.init() }, destroy: function () { this.params.history.enabled && this.history.destroy() }, transitionEnd: function () { this.history.initialized && this.history.setHistory(this.params.history.key, this.activeIndex) }, slideChange: function () { this.history.initialized && this.params.cssMode && this.history.setHistory(this.params.history.key, this.activeIndex) } } }, { name: "hash-navigation", params: { hashNavigation: { enabled: !1, replaceState: !1, watchState: !1 } }, create: function () { n.extend(this, { hashNavigation: { initialized: !1, init: _.init.bind(this), destroy: _.destroy.bind(this), setHash: _.setHash.bind(this), onHashCange: _.onHashCange.bind(this) } }) }, on: { init: function () { this.params.hashNavigation.enabled && this.hashNavigation.init() }, destroy: function () { this.params.hashNavigation.enabled && this.hashNavigation.destroy() }, transitionEnd: function () { this.hashNavigation.initialized && this.hashNavigation.setHash() }, slideChange: function () { this.hashNavigation.initialized && this.params.cssMode && this.hashNavigation.setHash() } } }, { name: "autoplay", params: { autoplay: { enabled: !1, delay: 3e3, waitForTransition: !0, disableOnInteraction: !0, stopOnLastSlide: !1, reverseDirection: !1 } }, create: function () { var e = this; n.extend(e, { autoplay: { running: !1, paused: !1, run: Z.run.bind(e), start: Z.start.bind(e), stop: Z.stop.bind(e), pause: Z.pause.bind(e), onVisibilityChange: function () { "hidden" === document.visibilityState && e.autoplay.running && e.autoplay.pause(), "visible" === document.visibilityState && e.autoplay.paused && e.autoplay.run() }, onTransitionEnd: function (t) { e && !e.destroyed && e.$wrapperEl && t.target === this && (e.$wrapperEl[0].removeEventListener("transitionend", e.autoplay.onTransitionEnd), e.$wrapperEl[0].removeEventListener("webkitTransitionEnd", e.autoplay.onTransitionEnd), e.autoplay.paused = !1, e.autoplay.running ? e.autoplay.run() : e.autoplay.stop()) } } }) }, on: { init: function () { this.params.autoplay.enabled && (this.autoplay.start(), document.addEventListener("visibilitychange", this.autoplay.onVisibilityChange)) }, beforeTransitionStart: function (e, t) { this.autoplay.running && (t || !this.params.autoplay.disableOnInteraction ? this.autoplay.pause(e) : this.autoplay.stop()) }, sliderFirstMove: function () { this.autoplay.running && (this.params.autoplay.disableOnInteraction ? this.autoplay.stop() : this.autoplay.pause()) }, touchEnd: function () { this.params.cssMode && this.autoplay.paused && !this.params.autoplay.disableOnInteraction && this.autoplay.run() }, destroy: function () { this.autoplay.running && this.autoplay.stop(), document.removeEventListener("visibilitychange", this.autoplay.onVisibilityChange) } } }, { name: "effect-fade", params: { fadeEffect: { crossFade: !1 } }, create: function () { n.extend(this, { fadeEffect: { setTranslate: Q.setTranslate.bind(this), setTransition: Q.setTransition.bind(this) } }) }, on: { beforeInit: function () { if ("fade" === this.params.effect) { this.classNames.push(this.params.containerModifierClass + "fade"); var e = { slidesPerView: 1, slidesPerColumn: 1, slidesPerGroup: 1, watchSlidesProgress: !0, spaceBetween: 0, virtualTranslate: !0 }; n.extend(this.params, e), n.extend(this.originalParams, e) } }, setTranslate: function () { "fade" === this.params.effect && this.fadeEffect.setTranslate() }, setTransition: function (e) { "fade" === this.params.effect && this.fadeEffect.setTransition(e) } } }, { name: "effect-cube", params: { cubeEffect: { slideShadows: !0, shadow: !0, shadowOffset: 20, shadowScale: .94 } }, create: function () { n.extend(this, { cubeEffect: { setTranslate: J.setTranslate.bind(this), setTransition: J.setTransition.bind(this) } }) }, on: { beforeInit: function () { if ("cube" === this.params.effect) { this.classNames.push(this.params.containerModifierClass + "cube"), this.classNames.push(this.params.containerModifierClass + "3d"); var e = { slidesPerView: 1, slidesPerColumn: 1, slidesPerGroup: 1, watchSlidesProgress: !0, resistanceRatio: 0, spaceBetween: 0, centeredSlides: !1, virtualTranslate: !0 }; n.extend(this.params, e), n.extend(this.originalParams, e) } }, setTranslate: function () { "cube" === this.params.effect && this.cubeEffect.setTranslate() }, setTransition: function (e) { "cube" === this.params.effect && this.cubeEffect.setTransition(e) } } }, { name: "effect-flip", params: { flipEffect: { slideShadows: !0, limitRotation: !0 } }, create: function () { n.extend(this, { flipEffect: { setTranslate: ee.setTranslate.bind(this), setTransition: ee.setTransition.bind(this) } }) }, on: { beforeInit: function () { if ("flip" === this.params.effect) { this.classNames.push(this.params.containerModifierClass + "flip"), this.classNames.push(this.params.containerModifierClass + "3d"); var e = { slidesPerView: 1, slidesPerColumn: 1, slidesPerGroup: 1, watchSlidesProgress: !0, spaceBetween: 0, virtualTranslate: !0 }; n.extend(this.params, e), n.extend(this.originalParams, e) } }, setTranslate: function () { "flip" === this.params.effect && this.flipEffect.setTranslate() }, setTransition: function (e) { "flip" === this.params.effect && this.flipEffect.setTransition(e) } } }, { name: "effect-coverflow", params: { coverflowEffect: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: !0 } }, create: function () { n.extend(this, { coverflowEffect: { setTranslate: te.setTranslate.bind(this), setTransition: te.setTransition.bind(this) } }) }, on: { beforeInit: function () { "coverflow" === this.params.effect && (this.classNames.push(this.params.containerModifierClass + "coverflow"), this.classNames.push(this.params.containerModifierClass + "3d"), this.params.watchSlidesProgress = !0, this.originalParams.watchSlidesProgress = !0) }, setTranslate: function () { "coverflow" === this.params.effect && this.coverflowEffect.setTranslate() }, setTransition: function (e) { "coverflow" === this.params.effect && this.coverflowEffect.setTransition(e) } } }, { name: "thumbs", params: { thumbs: { swiper: null, slideThumbActiveClass: "swiper-slide-thumb-active", thumbsContainerClass: "swiper-container-thumbs" } }, create: function () { n.extend(this, { thumbs: { swiper: null, init: ie.init.bind(this), update: ie.update.bind(this), onThumbClick: ie.onThumbClick.bind(this) } }) }, on: { beforeInit: function () { var e = this.params.thumbs; e && e.swiper && (this.thumbs.init(), this.thumbs.update(!0)) }, slideChange: function () { this.thumbs.swiper && this.thumbs.update() }, update: function () { this.thumbs.swiper && this.thumbs.update() }, resize: function () { this.thumbs.swiper && this.thumbs.update() }, observerUpdate: function () { this.thumbs.swiper && this.thumbs.update() }, setTransition: function (e) { var t = this.thumbs.swiper; t && t.setTransition(e) }, beforeDestroy: function () { var e = this.thumbs.swiper; e && this.thumbs.swiperCreated && e && e.destroy() } } }]; return void 0 === z.use && (z.use = z.Class.use, z.installModule = z.Class.installModule), z.use(se), z }));
//# sourceMappingURL=swiper.min.js.map


/***********************************************************************************************************************************/
/*************************************************************AOS**********************************************************************/
//# sourceMappingURL=aos.js.map
/*!
 * parallax.js v1.5.0 (http://pixelcog.github.io/parallax.js/)
 * @copyright 2016 PixelCog, Inc.
 * @license MIT (https://github.com/pixelcog/parallax.js/blob/master/LICENSE)
 */
!function (e, t) { "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.AOS = t() : e.AOS = t() }(this, function () { return function (e) { function t(o) { if (n[o]) return n[o].exports; var i = n[o] = { exports: {}, id: o, loaded: !1 }; return e[o].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports } var n = {}; return t.m = e, t.c = n, t.p = "dist/", t(0) }([function (e, t, n) { "use strict"; function o(e) { return e && e.__esModule ? e : { default: e } } var i = Object.assign || function (e) { for (var t = 1; t < arguments.length; t++) { var n = arguments[t]; for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]) } return e }, r = n(1), a = (o(r), n(6)), u = o(a), c = n(7), f = o(c), s = n(8), d = o(s), l = n(9), p = o(l), m = n(10), b = o(m), v = n(11), y = o(v), g = n(14), h = o(g), w = [], k = !1, x = document.all && !window.atob, j = { offset: 120, delay: 0, easing: "ease", duration: 400, disable: !1, once: !1, startEvent: "DOMContentLoaded" }, O = function () { var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0]; if (e && (k = !0), k) return w = (0, y.default)(w, j), (0, b.default)(w, j.once), w }, S = function () { w = (0, h.default)(), O() }, _ = function () { w.forEach(function (e, t) { e.node.removeAttribute("data-aos"), e.node.removeAttribute("data-aos-easing"), e.node.removeAttribute("data-aos-duration"), e.node.removeAttribute("data-aos-delay") }) }, E = function (e) { return e === !0 || "mobile" === e && p.default.mobile() || "phone" === e && p.default.phone() || "tablet" === e && p.default.tablet() || "function" == typeof e && e() === !0 }, z = function (e) { return j = i(j, e), w = (0, h.default)(), E(j.disable) || x ? _() : (document.querySelector("body").setAttribute("data-aos-easing", j.easing), document.querySelector("body").setAttribute("data-aos-duration", j.duration), document.querySelector("body").setAttribute("data-aos-delay", j.delay), "DOMContentLoaded" === j.startEvent && ["complete", "interactive"].indexOf(document.readyState) > -1 ? O(!0) : "load" === j.startEvent ? window.addEventListener(j.startEvent, function () { O(!0) }) : document.addEventListener(j.startEvent, function () { O(!0) }), window.addEventListener("resize", (0, f.default)(O, 50, !0)), window.addEventListener("orientationchange", (0, f.default)(O, 50, !0)), window.addEventListener("scroll", (0, u.default)(function () { (0, b.default)(w, j.once) }, 99)), document.addEventListener("DOMNodeRemoved", function (e) { var t = e.target; t && 1 === t.nodeType && t.hasAttribute && t.hasAttribute("data-aos") && (0, f.default)(S, 50, !0) }), (0, d.default)("[data-aos]", S), w) }; e.exports = { init: z, refresh: O, refreshHard: S } }, function (e, t) { }, , , , , function (e, t) { (function (t) { "use strict"; function n(e, t, n) { function o(t) { var n = b, o = v; return b = v = void 0, k = t, g = e.apply(o, n) } function r(e) { return k = e, h = setTimeout(s, t), S ? o(e) : g } function a(e) { var n = e - w, o = e - k, i = t - n; return _ ? j(i, y - o) : i } function c(e) { var n = e - w, o = e - k; return void 0 === w || n >= t || n < 0 || _ && o >= y } function s() { var e = O(); return c(e) ? d(e) : void (h = setTimeout(s, a(e))) } function d(e) { return h = void 0, E && b ? o(e) : (b = v = void 0, g) } function l() { void 0 !== h && clearTimeout(h), k = 0, b = w = v = h = void 0 } function p() { return void 0 === h ? g : d(O()) } function m() { var e = O(), n = c(e); if (b = arguments, v = this, w = e, n) { if (void 0 === h) return r(w); if (_) return h = setTimeout(s, t), o(w) } return void 0 === h && (h = setTimeout(s, t)), g } var b, v, y, g, h, w, k = 0, S = !1, _ = !1, E = !0; if ("function" != typeof e) throw new TypeError(f); return t = u(t) || 0, i(n) && (S = !!n.leading, _ = "maxWait" in n, y = _ ? x(u(n.maxWait) || 0, t) : y, E = "trailing" in n ? !!n.trailing : E), m.cancel = l, m.flush = p, m } function o(e, t, o) { var r = !0, a = !0; if ("function" != typeof e) throw new TypeError(f); return i(o) && (r = "leading" in o ? !!o.leading : r, a = "trailing" in o ? !!o.trailing : a), n(e, t, { leading: r, maxWait: t, trailing: a }) } function i(e) { var t = "undefined" == typeof e ? "undefined" : c(e); return !!e && ("object" == t || "function" == t) } function r(e) { return !!e && "object" == ("undefined" == typeof e ? "undefined" : c(e)) } function a(e) { return "symbol" == ("undefined" == typeof e ? "undefined" : c(e)) || r(e) && k.call(e) == d } function u(e) { if ("number" == typeof e) return e; if (a(e)) return s; if (i(e)) { var t = "function" == typeof e.valueOf ? e.valueOf() : e; e = i(t) ? t + "" : t } if ("string" != typeof e) return 0 === e ? e : +e; e = e.replace(l, ""); var n = m.test(e); return n || b.test(e) ? v(e.slice(2), n ? 2 : 8) : p.test(e) ? s : +e } var c = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) { return typeof e } : function (e) { return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e }, f = "Expected a function", s = NaN, d = "[object Symbol]", l = /^\s+|\s+$/g, p = /^[-+]0x[0-9a-f]+$/i, m = /^0b[01]+$/i, b = /^0o[0-7]+$/i, v = parseInt, y = "object" == ("undefined" == typeof t ? "undefined" : c(t)) && t && t.Object === Object && t, g = "object" == ("undefined" == typeof self ? "undefined" : c(self)) && self && self.Object === Object && self, h = y || g || Function("return this")(), w = Object.prototype, k = w.toString, x = Math.max, j = Math.min, O = function () { return h.Date.now() }; e.exports = o }).call(t, function () { return this }()) }, function (e, t) { (function (t) { "use strict"; function n(e, t, n) { function i(t) { var n = b, o = v; return b = v = void 0, O = t, g = e.apply(o, n) } function r(e) { return O = e, h = setTimeout(s, t), S ? i(e) : g } function u(e) { var n = e - w, o = e - O, i = t - n; return _ ? x(i, y - o) : i } function f(e) { var n = e - w, o = e - O; return void 0 === w || n >= t || n < 0 || _ && o >= y } function s() { var e = j(); return f(e) ? d(e) : void (h = setTimeout(s, u(e))) } function d(e) { return h = void 0, E && b ? i(e) : (b = v = void 0, g) } function l() { void 0 !== h && clearTimeout(h), O = 0, b = w = v = h = void 0 } function p() { return void 0 === h ? g : d(j()) } function m() { var e = j(), n = f(e); if (b = arguments, v = this, w = e, n) { if (void 0 === h) return r(w); if (_) return h = setTimeout(s, t), i(w) } return void 0 === h && (h = setTimeout(s, t)), g } var b, v, y, g, h, w, O = 0, S = !1, _ = !1, E = !0; if ("function" != typeof e) throw new TypeError(c); return t = a(t) || 0, o(n) && (S = !!n.leading, _ = "maxWait" in n, y = _ ? k(a(n.maxWait) || 0, t) : y, E = "trailing" in n ? !!n.trailing : E), m.cancel = l, m.flush = p, m } function o(e) { var t = "undefined" == typeof e ? "undefined" : u(e); return !!e && ("object" == t || "function" == t) } function i(e) { return !!e && "object" == ("undefined" == typeof e ? "undefined" : u(e)) } function r(e) { return "symbol" == ("undefined" == typeof e ? "undefined" : u(e)) || i(e) && w.call(e) == s } function a(e) { if ("number" == typeof e) return e; if (r(e)) return f; if (o(e)) { var t = "function" == typeof e.valueOf ? e.valueOf() : e; e = o(t) ? t + "" : t } if ("string" != typeof e) return 0 === e ? e : +e; e = e.replace(d, ""); var n = p.test(e); return n || m.test(e) ? b(e.slice(2), n ? 2 : 8) : l.test(e) ? f : +e } var u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) { return typeof e } : function (e) { return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e }, c = "Expected a function", f = NaN, s = "[object Symbol]", d = /^\s+|\s+$/g, l = /^[-+]0x[0-9a-f]+$/i, p = /^0b[01]+$/i, m = /^0o[0-7]+$/i, b = parseInt, v = "object" == ("undefined" == typeof t ? "undefined" : u(t)) && t && t.Object === Object && t, y = "object" == ("undefined" == typeof self ? "undefined" : u(self)) && self && self.Object === Object && self, g = v || y || Function("return this")(), h = Object.prototype, w = h.toString, k = Math.max, x = Math.min, j = function () { return g.Date.now() }; e.exports = n }).call(t, function () { return this }()) }, function (e, t) { "use strict"; function n(e, t) { a.push({ selector: e, fn: t }), !u && r && (u = new r(o), u.observe(i.documentElement, { childList: !0, subtree: !0, removedNodes: !0 })), o() } function o() { for (var e, t, n = 0, o = a.length; n < o; n++) { e = a[n], t = i.querySelectorAll(e.selector); for (var r, u = 0, c = t.length; u < c; u++)r = t[u], r.ready || (r.ready = !0, e.fn.call(r, r)) } } Object.defineProperty(t, "__esModule", { value: !0 }); var i = window.document, r = window.MutationObserver || window.WebKitMutationObserver, a = [], u = void 0; t.default = n }, function (e, t) { "use strict"; function n(e, t) { if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function") } function o() { return navigator.userAgent || navigator.vendor || window.opera || "" } Object.defineProperty(t, "__esModule", { value: !0 }); var i = function () { function e(e, t) { for (var n = 0; n < t.length; n++) { var o = t[n]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o) } } return function (t, n, o) { return n && e(t.prototype, n), o && e(t, o), t } }(), r = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i, a = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i, u = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i, c = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i, f = function () { function e() { n(this, e) } return i(e, [{ key: "phone", value: function () { var e = o(); return !(!r.test(e) && !a.test(e.substr(0, 4))) } }, { key: "mobile", value: function () { var e = o(); return !(!u.test(e) && !c.test(e.substr(0, 4))) } }, { key: "tablet", value: function () { return this.mobile() && !this.phone() } }]), e }(); t.default = new f }, function (e, t) { "use strict"; Object.defineProperty(t, "__esModule", { value: !0 }); var n = function (e, t, n) { var o = e.node.getAttribute("data-aos-once"); t > e.position ? e.node.classList.add("aos-animate") : "undefined" != typeof o && ("false" === o || !n && "true" !== o) && e.node.classList.remove("aos-animate") }, o = function (e, t) { var o = window.pageYOffset, i = window.innerHeight; e.forEach(function (e, r) { n(e, i + o, t) }) }; t.default = o }, function (e, t, n) { "use strict"; function o(e) { return e && e.__esModule ? e : { default: e } } Object.defineProperty(t, "__esModule", { value: !0 }); var i = n(12), r = o(i), a = function (e, t) { return e.forEach(function (e, n) { e.node.classList.add("aos-init"), e.position = (0, r.default)(e.node, t.offset) }), e }; t.default = a }, function (e, t, n) { "use strict"; function o(e) { return e && e.__esModule ? e : { default: e } } Object.defineProperty(t, "__esModule", { value: !0 }); var i = n(13), r = o(i), a = function (e, t) { var n = 0, o = 0, i = window.innerHeight, a = { offset: e.getAttribute("data-aos-offset"), anchor: e.getAttribute("data-aos-anchor"), anchorPlacement: e.getAttribute("data-aos-anchor-placement") }; switch (a.offset && !isNaN(a.offset) && (o = parseInt(a.offset)), a.anchor && document.querySelectorAll(a.anchor) && (e = document.querySelectorAll(a.anchor)[0]), n = (0, r.default)(e).top, a.anchorPlacement) { case "top-bottom": break; case "center-bottom": n += e.offsetHeight / 2; break; case "bottom-bottom": n += e.offsetHeight; break; case "top-center": n += i / 2; break; case "bottom-center": n += i / 2 + e.offsetHeight; break; case "center-center": n += i / 2 + e.offsetHeight / 2; break; case "top-top": n += i; break; case "bottom-top": n += e.offsetHeight + i; break; case "center-top": n += e.offsetHeight / 2 + i }return a.anchorPlacement || a.offset || isNaN(t) || (o = t), n + o }; t.default = a }, function (e, t) { "use strict"; Object.defineProperty(t, "__esModule", { value: !0 }); var n = function (e) { for (var t = 0, n = 0; e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop);)t += e.offsetLeft - ("BODY" != e.tagName ? e.scrollLeft : 0), n += e.offsetTop - ("BODY" != e.tagName ? e.scrollTop : 0), e = e.offsetParent; return { top: n, left: t } }; t.default = n }, function (e, t) { "use strict"; Object.defineProperty(t, "__esModule", { value: !0 }); var n = function (e) { e = e || document.querySelectorAll("[data-aos]"); var t = []; return [].forEach.call(e, function (e, n) { t.push({ node: e }) }), t }; t.default = n }]) });
//# sourceMappingURL=aos.js.map

/* ImageMapster
   Version: 1.2.10 (2/25/2013)

Copyright 2011-2012 James Treworgy

http://www.outsharked.com/imagemapster
https://github.com/jamietre/ImageMapster

A jQuery plugin to enhance image maps.

*/

;

/// LICENSE (MIT License)
///
/// Permission is hereby granted, free of charge, to any person obtaining
/// a copy of this software and associated documentation files (the
/// "Software"), to deal in the Software without restriction, including
/// without limitation the rights to use, copy, modify, merge, publish,
/// distribute, sublicense, and/or sell copies of the Software, and to
/// permit persons to whom the Software is furnished to do so, subject to
/// the following conditions:
///
/// The above copyright notice and this permission notice shall be
/// included in all copies or substantial portions of the Software.
///
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
/// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
/// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
/// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
/// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
/// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
/// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///
/// January 19, 2011

/** @license MIT License (c) copyright B Cavalier & J Hann */

/**
* when
* A lightweight CommonJS Promises/A and when() implementation
*
* when is part of the cujo.js family of libraries (http://cujojs.com/)
*
* Licensed under the MIT License at:
* http://www.opensource.org/licenses/mit-license.php
*
* @version 1.2.0
*/

/*lint-ignore-start*/

(function (define) {
    define(function () {
        var freeze, reduceArray, slice, undef;

        //
        // Public API
        //

        when.defer = defer;
        when.reject = reject;
        when.isPromise = isPromise;

        when.all = all;
        when.some = some;
        when.any = any;

        when.map = map;
        when.reduce = reduce;

        when.chain = chain;

        /** Object.freeze */
        freeze = Object.freeze || function (o) { return o; };

        /**
        * Trusted Promise constructor.  A Promise created from this constructor is
        * a trusted when.js promise.  Any other duck-typed promise is considered
        * untrusted.
        *
        * @constructor
        */
        function Promise() { }

        Promise.prototype = freeze({
            always: function (alwaysback, progback) {
                return this.then(alwaysback, alwaysback, progback);
            },

            otherwise: function (errback) {
                return this.then(undef, errback);
            }
        });

        /**
        * Create an already-resolved promise for the supplied value
        * @private
        *
        * @param value anything
        * @return {Promise}
        */
        function resolved(value) {

            var p = new Promise();

            p.then = function (callback) {
                var nextValue;
                try {
                    if (callback) nextValue = callback(value);
                    return promise(nextValue === undef ? value : nextValue);
                } catch (e) {
                    return rejected(e);
                }
            };

            return freeze(p);
        }

        /**
        * Create an already-rejected {@link Promise} with the supplied
        * rejection reason.
        * @private
        *
        * @param reason rejection reason
        * @return {Promise}
        */
        function rejected(reason) {

            var p = new Promise();

            p.then = function (callback, errback) {
                var nextValue;
                try {
                    if (errback) {
                        nextValue = errback(reason);
                        return promise(nextValue === undef ? reason : nextValue)
                    }

                    return rejected(reason);

                } catch (e) {
                    return rejected(e);
                }
            };

            return freeze(p);
        }

        /**
        * Returns a rejected promise for the supplied promiseOrValue. If
        * promiseOrValue is a value, it will be the rejection value of the
        * returned promise.  If promiseOrValue is a promise, its
        * completion value will be the rejected value of the returned promise
        *
        * @param promiseOrValue {*} the rejected value of the returned {@link Promise}
        *
        * @return {Promise} rejected {@link Promise}
        */
        function reject(promiseOrValue) {
            return when(promiseOrValue, function (value) {
                return rejected(value);
            });
        }

        /**
        * Creates a new, CommonJS compliant, Deferred with fully isolated
        * resolver and promise parts, either or both of which may be given out
        * safely to consumers.
        * The Deferred itself has the full API: resolve, reject, progress, and
        * then. The resolver has resolve, reject, and progress.  The promise
        * only has then.
        *
        * @memberOf when
        * @function
        *
        * @returns {Deferred}
        */
        function defer() {
            var deferred, promise, listeners, progressHandlers, _then, _progress, complete;

            listeners = [];
            progressHandlers = [];

            /**
            * Pre-resolution then() that adds the supplied callback, errback, and progback
            * functions to the registered listeners
            *
            * @private
            *
            * @param [callback] {Function} resolution handler
            * @param [errback] {Function} rejection handler
            * @param [progback] {Function} progress handler
            *
            * @throws {Error} if any argument is not null, undefined, or a Function
            */
            _then = function unresolvedThen(callback, errback, progback) {
                var deferred = defer();

                listeners.push(function (promise) {
                    promise.then(callback, errback)
                        .then(deferred.resolve, deferred.reject, deferred.progress);
                });

                progback && progressHandlers.push(progback);

                return deferred.promise;
            };

            /**
            * Registers a handler for this {@link Deferred}'s {@link Promise}.  Even though all arguments
            * are optional, each argument that *is* supplied must be null, undefined, or a Function.
            * Any other value will cause an Error to be thrown.
            *
            * @memberOf Promise
            *
            * @param [callback] {Function} resolution handler
            * @param [errback] {Function} rejection handler
            * @param [progback] {Function} progress handler
            *
            * @throws {Error} if any argument is not null, undefined, or a Function
            */
            function then(callback, errback, progback) {
                return _then(callback, errback, progback);
            }

            /**
            * Resolves this {@link Deferred}'s {@link Promise} with val as the
            * resolution value.
            *
            * @memberOf Resolver
            *
            * @param val anything
            */
            function resolve(val) {
                complete(resolved(val));
            }

            /**
            * Rejects this {@link Deferred}'s {@link Promise} with err as the
            * reason.
            *
            * @memberOf Resolver
            *
            * @param err anything
            */
            function reject(err) {
                complete(rejected(err));
            }

            /**
            * @private
            * @param update
            */
            _progress = function (update) {
                var progress, i = 0;
                while (progress = progressHandlers[i++]) progress(update);
            };

            /**
            * Emits a progress update to all progress observers registered with
            * this {@link Deferred}'s {@link Promise}
            *
            * @memberOf Resolver
            *
            * @param update anything
            */
            function progress(update) {
                _progress(update);
            }

            /**
            * Transition from pre-resolution state to post-resolution state, notifying
            * all listeners of the resolution or rejection
            *
            * @private
            *
            * @param completed {Promise} the completed value of this deferred
            */
            complete = function (completed) {
                var listener, i = 0;

                // Replace _then with one that directly notifies with the result.
                _then = completed.then;

                // Replace complete so that this Deferred can only be completed
                // once. Also Replace _progress, so that subsequent attempts to issue
                // progress throw.
                complete = _progress = function alreadyCompleted() {
                    // TODO: Consider silently returning here so that parties who
                    // have a reference to the resolver cannot tell that the promise
                    // has been resolved using try/catch
                    throw new Error("already completed");
                };

                // Free progressHandlers array since we'll never issue progress events
                // for this promise again now that it's completed
                progressHandlers = undef;

                // Notify listeners
                // Traverse all listeners registered directly with this Deferred

                while (listener = listeners[i++]) {
                    listener(completed);
                }

                listeners = [];
            };

            /**
            * The full Deferred object, with both {@link Promise} and {@link Resolver}
            * parts
            * @class Deferred
            * @name Deferred
            */
            deferred = {};

            // Promise and Resolver parts
            // Freeze Promise and Resolver APIs

            promise = new Promise();
            promise.then = deferred.then = then;

            /**
            * The {@link Promise} for this {@link Deferred}
            * @memberOf Deferred
            * @name promise
            * @type {Promise}
            */
            deferred.promise = freeze(promise);

            /**
            * The {@link Resolver} for this {@link Deferred}
            * @memberOf Deferred
            * @name resolver
            * @class Resolver
            */
            deferred.resolver = freeze({
                resolve: (deferred.resolve = resolve),
                reject: (deferred.reject = reject),
                progress: (deferred.progress = progress)
            });

            return deferred;
        }

        /**
        * Determines if promiseOrValue is a promise or not.  Uses the feature
        * test from http://wiki.commonjs.org/wiki/Promises/A to determine if
        * promiseOrValue is a promise.
        *
        * @param promiseOrValue anything
        *
        * @returns {Boolean} true if promiseOrValue is a {@link Promise}
        */
        function isPromise(promiseOrValue) {
            return promiseOrValue && typeof promiseOrValue.then === 'function';
        }

        /**
        * Register an observer for a promise or immediate value.
        *
        * @function
        * @name when
        * @namespace
        *
        * @param promiseOrValue anything
        * @param {Function} [callback] callback to be called when promiseOrValue is
        *   successfully resolved.  If promiseOrValue is an immediate value, callback
        *   will be invoked immediately.
        * @param {Function} [errback] callback to be called when promiseOrValue is
        *   rejected.
        * @param {Function} [progressHandler] callback to be called when progress updates
        *   are issued for promiseOrValue.
        *
        * @returns {Promise} a new {@link Promise} that will complete with the return
        *   value of callback or errback or the completion value of promiseOrValue if
        *   callback and/or errback is not supplied.
        */
        function when(promiseOrValue, callback, errback, progressHandler) {
            // Get a promise for the input promiseOrValue
            // See promise()
            var trustedPromise = promise(promiseOrValue);

            // Register promise handlers
            return trustedPromise.then(callback, errback, progressHandler);
        }

        /**
        * Returns promiseOrValue if promiseOrValue is a {@link Promise}, a new Promise if
        * promiseOrValue is a foreign promise, or a new, already-resolved {@link Promise}
        * whose resolution value is promiseOrValue if promiseOrValue is an immediate value.
        *
        * Note that this function is not safe to export since it will return its
        * input when promiseOrValue is a {@link Promise}
        *
        * @private
        *
        * @param promiseOrValue anything
        *
        * @returns Guaranteed to return a trusted Promise.  If promiseOrValue is a when.js {@link Promise}
        *   returns promiseOrValue, otherwise, returns a new, already-resolved, when.js {@link Promise}
        *   whose resolution value is:
        *   * the resolution value of promiseOrValue if it's a foreign promise, or
        *   * promiseOrValue if it's a value
        */
        function promise(promiseOrValue) {
            var promise, deferred;

            if (promiseOrValue instanceof Promise) {
                // It's a when.js promise, so we trust it
                promise = promiseOrValue;

            } else {
                // It's not a when.js promise.  Check to see if it's a foreign promise
                // or a value.

                deferred = defer();
                if (isPromise(promiseOrValue)) {
                    // It's a compliant promise, but we don't know where it came from,
                    // so we don't trust its implementation entirely.  Introduce a trusted
                    // middleman when.js promise

                    // IMPORTANT: This is the only place when.js should ever call .then() on
                    // an untrusted promise.
                    promiseOrValue.then(deferred.resolve, deferred.reject, deferred.progress);
                    promise = deferred.promise;

                } else {
                    // It's a value, not a promise.  Create an already-resolved promise
                    // for it.
                    deferred.resolve(promiseOrValue);
                    promise = deferred.promise;
                }
            }

            return promise;
        }

        /**
        * Return a promise that will resolve when howMany of the supplied promisesOrValues
        * have resolved. The resolution value of the returned promise will be an array of
        * length howMany containing the resolutions values of the triggering promisesOrValues.
        *
        * @memberOf when
        *
        * @param promisesOrValues {Array} array of anything, may contain a mix
        *      of {@link Promise}s and values
        * @param howMany
        * @param [callback]
        * @param [errback]
        * @param [progressHandler]
        *
        * @returns {Promise}
        */
        function some(promisesOrValues, howMany, callback, errback, progressHandler) {

            checkCallbacks(2, arguments);

            return when(promisesOrValues, function (promisesOrValues) {

                var toResolve, results, ret, deferred, resolver, rejecter, handleProgress, len, i;

                len = promisesOrValues.length >>> 0;

                toResolve = Math.max(0, Math.min(howMany, len));
                results = [];
                deferred = defer();
                ret = when(deferred, callback, errback, progressHandler);

                // Wrapper so that resolver can be replaced
                function resolve(val) {
                    resolver(val);
                }

                // Wrapper so that rejecter can be replaced
                function reject(err) {
                    rejecter(err);
                }

                // Wrapper so that progress can be replaced
                function progress(update) {
                    handleProgress(update);
                }

                function complete() {
                    resolver = rejecter = handleProgress = noop;
                }

                // No items in the input, resolve immediately
                if (!toResolve) {
                    deferred.resolve(results);

                } else {
                    // Resolver for promises.  Captures the value and resolves
                    // the returned promise when toResolve reaches zero.
                    // Overwrites resolver var with a noop once promise has
                    // be resolved to cover case where n < promises.length
                    resolver = function (val) {
                        // This orders the values based on promise resolution order
                        // Another strategy would be to use the original position of
                        // the corresponding promise.
                        results.push(val);

                        if (! --toResolve) {
                            complete();
                            deferred.resolve(results);
                        }
                    };

                    // Rejecter for promises.  Rejects returned promise
                    // immediately, and overwrites rejecter var with a noop
                    // once promise to cover case where n < promises.length.
                    // TODO: Consider rejecting only when N (or promises.length - N?)
                    // promises have been rejected instead of only one?
                    rejecter = function (err) {
                        complete();
                        deferred.reject(err);
                    };

                    handleProgress = deferred.progress;

                    // TODO: Replace while with forEach
                    for (i = 0; i < len; ++i) {
                        if (i in promisesOrValues) {
                            when(promisesOrValues[i], resolve, reject, progress);
                        }
                    }
                }

                return ret;
            });
        }

        /**
        * Return a promise that will resolve only once all the supplied promisesOrValues
        * have resolved. The resolution value of the returned promise will be an array
        * containing the resolution values of each of the promisesOrValues.
        *
        * @memberOf when
        *
        * @param promisesOrValues {Array|Promise} array of anything, may contain a mix
        *      of {@link Promise}s and values
        * @param [callback] {Function}
        * @param [errback] {Function}
        * @param [progressHandler] {Function}
        *
        * @returns {Promise}
        */
        function all(promisesOrValues, callback, errback, progressHandler) {

            checkCallbacks(1, arguments);

            return when(promisesOrValues, function (promisesOrValues) {
                return _reduce(promisesOrValues, reduceIntoArray, []);
            }).then(callback, errback, progressHandler);
        }

        function reduceIntoArray(current, val, i) {
            current[i] = val;
            return current;
        }

        /**
        * Return a promise that will resolve when any one of the supplied promisesOrValues
        * has resolved. The resolution value of the returned promise will be the resolution
        * value of the triggering promiseOrValue.
        *
        * @memberOf when
        *
        * @param promisesOrValues {Array|Promise} array of anything, may contain a mix
        *      of {@link Promise}s and values
        * @param [callback] {Function}
        * @param [errback] {Function}
        * @param [progressHandler] {Function}
        *
        * @returns {Promise}
        */
        function any(promisesOrValues, callback, errback, progressHandler) {

            function unwrapSingleResult(val) {
                return callback ? callback(val[0]) : val[0];
            }

            return some(promisesOrValues, 1, unwrapSingleResult, errback, progressHandler);
        }

        /**
        * Traditional map function, similar to `Array.prototype.map()`, but allows
        * input to contain {@link Promise}s and/or values, and mapFunc may return
        * either a value or a {@link Promise}
        *
        * @memberOf when
        *
        * @param promise {Array|Promise} array of anything, may contain a mix
        *      of {@link Promise}s and values
        * @param mapFunc {Function} mapping function mapFunc(value) which may return
        *      either a {@link Promise} or value
        *
        * @returns {Promise} a {@link Promise} that will resolve to an array containing
        *      the mapped output values.
        */
        function map(promise, mapFunc) {
            return when(promise, function (array) {
                return _map(array, mapFunc);
            });
        }

        /**
        * Private map helper to map an array of promises
        * @private
        *
        * @param promisesOrValues {Array}
        * @param mapFunc {Function}
        * @return {Promise}
        */
        function _map(promisesOrValues, mapFunc) {

            var results, len, i;

            // Since we know the resulting length, we can preallocate the results
            // array to avoid array expansions.
            len = promisesOrValues.length >>> 0;
            results = new Array(len);

            // Since mapFunc may be async, get all invocations of it into flight
            // asap, and then use reduce() to collect all the results
            for (i = 0; i < len; i++) {
                if (i in promisesOrValues)
                    results[i] = when(promisesOrValues[i], mapFunc);
            }

            // Could use all() here, but that would result in another array
            // being allocated, i.e. map() would end up allocating 2 arrays
            // of size len instead of just 1.  Since all() uses reduce()
            // anyway, avoid the additional allocation by calling reduce
            // directly.
            return _reduce(results, reduceIntoArray, results);
        }

        /**
        * Traditional reduce function, similar to `Array.prototype.reduce()`, but
        * input may contain {@link Promise}s and/or values, and reduceFunc
        * may return either a value or a {@link Promise}, *and* initialValue may
        * be a {@link Promise} for the starting value.
        *
        * @memberOf when
        *
        * @param promise {Array|Promise} array of anything, may contain a mix
        *      of {@link Promise}s and values.  May also be a {@link Promise} for
        *      an array.
        * @param reduceFunc {Function} reduce function reduce(currentValue, nextValue, index, total),
        *      where total is the total number of items being reduced, and will be the same
        *      in each call to reduceFunc.
        * @param initialValue starting value, or a {@link Promise} for the starting value
        *
        * @returns {Promise} that will resolve to the final reduced value
        */
        function reduce(promise, reduceFunc, initialValue) {
            var args = slice.call(arguments, 1);
            return when(promise, function (array) {
                return _reduce.apply(undef, [array].concat(args));
            });
        }

        /**
        * Private reduce to reduce an array of promises
        * @private
        *
        * @param promisesOrValues {Array}
        * @param reduceFunc {Function}
        * @param initialValue {*}
        * @return {Promise}
        */
        function _reduce(promisesOrValues, reduceFunc, initialValue) {

            var total, args;

            total = promisesOrValues.length;

            // Skip promisesOrValues, since it will be used as 'this' in the call
            // to the actual reduce engine below.

            // Wrap the supplied reduceFunc with one that handles promises and then
            // delegates to the supplied.

            args = [
                function (current, val, i) {
                    return when(current, function (c) {
                        return when(val, function (value) {
                            return reduceFunc(c, value, i, total);
                        });
                    });
                }
            ];

            if (arguments.length > 2) args.push(initialValue);

            return reduceArray.apply(promisesOrValues, args);
        }

        /**
        * Ensure that resolution of promiseOrValue will complete resolver with the completion
        * value of promiseOrValue, or instead with resolveValue if it is provided.
        *
        * @memberOf when
        *
        * @param promiseOrValue
        * @param resolver {Resolver}
        * @param [resolveValue] anything
        *
        * @returns {Promise}
        */
        function chain(promiseOrValue, resolver, resolveValue) {
            var useResolveValue = arguments.length > 2;

            return when(promiseOrValue,
                function (val) {
                    if (useResolveValue) val = resolveValue;
                    resolver.resolve(val);
                    return val;
                },
                function (e) {
                    resolver.reject(e);
                    return rejected(e);
                },
                resolver.progress
            );
        }

        //
        // Utility functions
        //

        /**
        * Helper that checks arrayOfCallbacks to ensure that each element is either
        * a function, or null or undefined.
        *
        * @private
        *
        * @param arrayOfCallbacks {Array} array to check
        * @throws {Error} if any element of arrayOfCallbacks is something other than
        * a Functions, null, or undefined.
        */
        function checkCallbacks(start, arrayOfCallbacks) {
            var arg, i = arrayOfCallbacks.length;
            while (i > start) {
                arg = arrayOfCallbacks[--i];
                if (arg != null && typeof arg != 'function') throw new Error('callback is not a function');
            }
        }

        /**
        * No-Op function used in method replacement
        * @private
        */
        function noop() { }

        slice = [].slice;

        // ES5 reduce implementation if native not available
        // See: http://es5.github.com/#x15.4.4.21 as there are many
        // specifics and edge cases.
        reduceArray = [].reduce ||
            function (reduceFunc /*, initialValue */) {
                // ES5 dictates that reduce.length === 1

                // This implementation deviates from ES5 spec in the following ways:
                // 1. It does not check if reduceFunc is a Callable

                var arr, args, reduced, len, i;

                i = 0;
                arr = Object(this);
                len = arr.length >>> 0;
                args = arguments;

                // If no initialValue, use first item of array (we know length !== 0 here)
                // and adjust i to start at second item
                if (args.length <= 1) {
                    // Skip to the first real element in the array
                    for (; ;) {
                        if (i in arr) {
                            reduced = arr[i++];
                            break;
                        }

                        // If we reached the end of the array without finding any real
                        // elements, it's a TypeError
                        if (++i >= len) {
                            throw new TypeError();
                        }
                    }
                } else {
                    // If initialValue provided, use it
                    reduced = args[1];
                }

                // Do the actual reduce
                for (; i < len; ++i) {
                    // Skip holes
                    if (i in arr)
                        reduced = reduceFunc(reduced, arr[i], i, arr);
                }

                return reduced;
            };

        return when;
    });
})(typeof define == 'function'
    ? define
    : function (factory) {
        typeof module != 'undefined'
            ? (module.exports = factory())
            : (jQuery.mapster_when = factory());
    }
    // Boilerplate for AMD, Node, and browser global
);
/*lint-ignore-end*/
/* ImageMapster core */

/*jslint laxbreak: true, evil: true, unparam: true */

/*global jQuery: true, Zepto: true */


(function ($) {
    // all public functions in $.mapster.impl are methods
    $.fn.mapster = function (method) {
        var m = $.mapster.impl;
        if ($.isFunction(m[method])) {
            return m[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return m.bind.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mapster');
        }
    };

    $.mapster = {
        version: "1.2.10",
        render_defaults: {
            isSelectable: true,
            isDeselectable: true,
            fade: false,
            fadeDuration: 150,
            fill: true,
            fillColor: '000000',
            fillColorMask: 'FFFFFF',
            fillOpacity: 0.7,
            highlight: true,
            stroke: false,
            strokeColor: 'ff0000',
            strokeOpacity: 1,
            strokeWidth: 1,
            includeKeys: '',
            altImage: null,
            altImageId: null, // used internally            
            altImages: {}
        },
        defaults: {
            clickNavigate: false,
            wrapClass: null,
            wrapCss: null,
            onGetList: null,
            sortList: false,
            listenToList: false,
            mapKey: '',
            mapValue: '',
            singleSelect: false,
            listKey: 'value',
            listSelectedAttribute: 'selected',
            listSelectedClass: null,
            onClick: null,
            onMouseover: null,
            onMouseout: null,
            mouseoutDelay: 0,
            onStateChange: null,
            boundList: null,
            onConfigured: null,
            configTimeout: 30000,
            noHrefIsMask: true,
            scaleMap: true,
            safeLoad: false,
            areas: []
        },
        shared_defaults: {
            render_highlight: { fade: true },
            render_select: { fade: false },
            staticState: null,
            selected: null
        },
        area_defaults:
        {
            includeKeys: '',
            isMask: false
        },
        canvas_style: {
            position: 'absolute',
            left: 0,
            top: 0,
            padding: 0,
            border: 0
        },
        hasCanvas: null,
        isTouch: null,
        map_cache: [],
        hooks: {},
        addHook: function (name, callback) {
            this.hooks[name] = (this.hooks[name] || []).push(callback);
        },
        callHooks: function (name, context) {
            $.each(this.hooks[name] || [], function (i, e) {
                e.apply(context);
            });
        },
        utils: {
            when: $.mapster_when,
            defer: $.mapster_when.defer,

            // extends the constructor, returns a new object prototype. Does not refer to the
            // original constructor so is protected if the original object is altered. This way you
            // can "extend" an object by replacing it with its subclass.
            subclass: function (BaseClass, constr) {
                var Subclass = function () {
                    var me = this,
                        args = Array.prototype.slice.call(arguments, 0);
                    me.base = BaseClass.prototype;
                    me.base.init = function () {
                        BaseClass.prototype.constructor.apply(me, args);
                    };
                    constr.apply(me, args);
                };
                Subclass.prototype = new BaseClass();
                Subclass.prototype.constructor = Subclass;
                return Subclass;
            },
            asArray: function (obj) {
                return obj.constructor === Array ?
                    obj : this.split(obj);
            },
            // clean split: no padding or empty elements
            split: function (text, cb) {
                var i, el, arr = text.split(',');
                for (i = 0; i < arr.length; i++) {
                    el = $.trim(arr[i]);
                    if (el === '') {
                        arr.splice(i, 1);
                    } else {
                        arr[i] = cb ? cb(el) : el;
                    }
                }
                return arr;
            },
            // similar to $.extend but does not add properties (only updates), unless the
            // first argument is an empty object, then all properties will be copied
            updateProps: function (_target, _template) {
                var onlyProps,
                    target = _target || {},
                    template = $.isEmptyObject(target) ? _template : _target;

                //if (template) {
                onlyProps = [];
                $.each(template, function (prop) {
                    onlyProps.push(prop);
                });
                //}

                $.each(Array.prototype.slice.call(arguments, 1), function (i, src) {
                    $.each(src || {}, function (prop) {
                        if (!onlyProps || $.inArray(prop, onlyProps) >= 0) {
                            var p = src[prop];

                            if ($.isPlainObject(p)) {
                                // not recursive - only copies 1 level of subobjects, and always merges
                                target[prop] = $.extend(target[prop] || {}, p);
                            } else if (p && p.constructor === Array) {
                                target[prop] = p.slice(0);
                            } else if (typeof p !== 'undefined') {
                                target[prop] = src[prop];
                            }

                        }
                    });
                });
                return target;
            },
            isElement: function (o) {
                return (typeof HTMLElement === "object" ? o instanceof HTMLElement :
                    o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string");
            },
            // finds element of array or object with a property "prop" having value "val"
            // if prop is not defined, then just looks for property with value "val"
            indexOfProp: function (obj, prop, val) {
                var result = obj.constructor === Array ? -1 : null;
                $.each(obj, function (i, e) {
                    if (e && (prop ? e[prop] : e) === val) {
                        result = i;
                        return false;
                    }
                });
                return result;
            },
            // returns "obj" if true or false, or "def" if not true/false
            boolOrDefault: function (obj, def) {
                return this.isBool(obj) ?
                    obj : def || false;
            },
            isBool: function (obj) {
                return typeof obj === "boolean";
            },
            isUndef: function (obj) {
                return typeof obj === "undefined";
            },
            // evaluates "obj", if function, calls it with args
            // (todo - update this to handle variable lenght/more than one arg)
            ifFunction: function (obj, that, args) {
                if ($.isFunction(obj)) {
                    obj.call(that, args);
                }
            },
            size: function (image, raw) {
                var u = $.mapster.utils;
                return {
                    width: raw ? (image.width || image.naturalWidth) : u.imgWidth(image, true),
                    height: raw ? (image.height || image.naturalHeight) : u.imgHeight(image, true),
                    complete: function () { return !!this.height && !!this.width; }
                };
            },


            /**
             * Set the opacity of the element. This is an IE<8 specific function for handling VML.
             * When using VML we must override the "setOpacity" utility function (monkey patch ourselves).
             * jQuery does not deal with opacity correctly for VML elements. This deals with that.
             * 
             * @param {Element} el The DOM element
             * @param {double} opacity A value between 0 and 1 inclusive.
             */

            setOpacity: function (el, opacity) {
                if ($.mapster.hasCanvas()) {
                    el.style.opacity = opacity;
                } else {
                    $(el).each(function (i, e) {
                        if (typeof e.opacity !== 'undefined') {
                            e.opacity = opacity;
                        } else {
                            $(e).css("opacity", opacity);
                        }
                    });
                }
            },


            // fade "el" from opacity "op" to "endOp" over a period of time "duration"

            fader: (function () {
                var elements = {},
                    lastKey = 0,
                    fade_func = function (el, op, endOp, duration) {
                        var index,
                            cbIntervals = duration / 15,
                            obj, u = $.mapster.utils;

                        if (typeof el === 'number') {
                            obj = elements[el];
                            if (!obj) {
                                return;
                            }
                        } else {
                            index = u.indexOfProp(elements, null, el);
                            if (index) {
                                delete elements[index];
                            }
                            elements[++lastKey] = obj = el;
                            el = lastKey;
                        }

                        endOp = endOp || 1;

                        op = (op + (endOp / cbIntervals) > endOp - 0.01) ? endOp : op + (endOp / cbIntervals);

                        u.setOpacity(obj, op);
                        if (op < endOp) {
                            setTimeout(function () {
                                fade_func(el, op, endOp, duration);
                            }, 15);
                        }
                    };
                return fade_func;
            }())
        },
        getBoundList: function (opts, key_list) {
            if (!opts.boundList) {
                return null;
            }
            var index, key, result = $(), list = $.mapster.utils.split(key_list);
            opts.boundList.each(function (i, e) {
                for (index = 0; index < list.length; index++) {
                    key = list[index];
                    if ($(e).is('[' + opts.listKey + '="' + key + '"]')) {
                        result = result.add(e);
                    }
                }
            });
            return result;
        },
        // Causes changes to the bound list based on the user action (select or deselect)
        // area: the jQuery area object
        // returns the matching elements from the bound list for the first area passed (normally only one should be passed, but
        // a list can be passed
        setBoundListProperties: function (opts, target, selected) {
            target.each(function (i, e) {
                if (opts.listSelectedClass) {
                    if (selected) {
                        $(e).addClass(opts.listSelectedClass);
                    } else {
                        $(e).removeClass(opts.listSelectedClass);
                    }
                }
                if (opts.listSelectedAttribute) {
                    $(e).attr(opts.listSelectedAttribute, selected);
                }
            });
        },
        getMapDataIndex: function (obj) {
            var img, id;
            switch (obj.tagName && obj.tagName.toLowerCase()) {
                case 'area':
                    id = $(obj).parent().attr('name');
                    img = $("img[usemap='#" + id + "']")[0];
                    break;
                case 'img':
                    img = obj;
                    break;
            }
            return img ?
                this.utils.indexOfProp(this.map_cache, 'image', img) : -1;
        },
        getMapData: function (obj) {
            var index = this.getMapDataIndex(obj.length ? obj[0] : obj);
            if (index >= 0) {
                return index >= 0 ? this.map_cache[index] : null;
            }
        },
        /**
         * Queue a command to be run after the active async operation has finished
         * @param  {MapData}  map_data    The target MapData object
         * @param  {jQuery}   that        jQuery object on which the command was invoked
         * @param  {string}   command     the ImageMapster method name
         * @param  {object[]} args        arguments passed to the method
         * @return {bool}                 true if the command was queued, false if not (e.g. there was no need to)
         */
        queueCommand: function (map_data, that, command, args) {
            if (!map_data) {
                return false;
            }
            if (!map_data.complete || map_data.currentAction) {
                map_data.commands.push(
                    {
                        that: that,
                        command: command,
                        args: args
                    });
                return true;
            }
            return false;
        },
        unload: function () {
            this.impl.unload();
            this.utils = null;
            this.impl = null;
            $.fn.mapster = null;
            $.mapster = null;
            $('*').unbind();
        }
    };

    // Config for object prototypes
    // first: use only first object (for things that should not apply to lists)
    /// calls back one of two fuinctions, depending on whether an area was obtained.
    // opts: {
    //    name: 'method name',
    //    key: 'key,
    //    args: 'args'
    //
    //}
    // name: name of method (required)
    // args: arguments to re-call with
    // Iterates through all the objects passed, and determines whether it's an area or an image, and calls the appropriate
    // callback for each. If anything is returned from that callback, the process is stopped and that data return. Otherwise,
    // the object itself is returned.

    var m = $.mapster,
        u = m.utils,
        ap = Array.prototype;


    // jQuery's width() and height() are broken on IE9 in some situations. This tries everything. 
    $.each(["width", "height"], function (i, e) {
        var capProp = e.substr(0, 1).toUpperCase() + e.substr(1);
        // when jqwidth parm is passed, it also checks the jQuery width()/height() property
        // the issue is that jQUery width() can report a valid size before the image is loaded in some browsers
        // without it, we can read zero even when image is loaded in other browsers if its not visible
        // we must still check because stuff like adblock can temporarily block it
        // what a goddamn headache
        u["img" + capProp] = function (img, jqwidth) {
            return (jqwidth ? $(img)[e]() : 0) ||
                img[e] || img["natural" + capProp] || img["client" + capProp] || img["offset" + capProp];
        };

    });

    /**
     * The Method object encapsulates the process of testing an ImageMapster method to see if it's being
     * invoked on an image, or an area; then queues the command if the MapData is in an active state.
     * 
     * @param {[jQuery]}    that        The target of the invocation
     * @param {[function]}  func_map    The callback if the target is an imagemap
     * @param {[function]}  func_area   The callback if the target is an area
     * @param {[object]}    opt         Options: { key: a map key if passed explicitly
     *                                             name: the command name, if it can be queued,
     *                                             args: arguments to the method
     *                                            }
     */

    m.Method = function (that, func_map, func_area, opts) {
        var me = this;
        me.name = opts.name;
        me.output = that;
        me.input = that;
        me.first = opts.first || false;
        me.args = opts.args ? ap.slice.call(opts.args, 0) : [];
        me.key = opts.key;
        me.func_map = func_map;
        me.func_area = func_area;
        //$.extend(me, opts);
        me.name = opts.name;
        me.allowAsync = opts.allowAsync || false;
    };
    m.Method.prototype = {
        constructor: m.Method,
        go: function () {
            var i, data, ar, len, result, src = this.input,
                area_list = [],
                me = this;

            len = src.length;
            for (i = 0; i < len; i++) {
                data = $.mapster.getMapData(src[i]);
                if (data) {
                    if (!me.allowAsync && m.queueCommand(data, me.input, me.name, me.args)) {
                        if (this.first) {
                            result = '';
                        }
                        continue;
                    }

                    ar = data.getData(src[i].nodeName === 'AREA' ? src[i] : this.key);
                    if (ar) {
                        if ($.inArray(ar, area_list) < 0) {
                            area_list.push(ar);
                        }
                    } else {
                        result = this.func_map.apply(data, me.args);
                    }
                    if (this.first || typeof result !== 'undefined') {
                        break;
                    }
                }
            }
            // if there were areas, call the area function for each unique group
            $(area_list).each(function (i, e) {
                result = me.func_area.apply(e, me.args);
            });

            if (typeof result !== 'undefined') {
                return result;
            } else {
                return this.output;
            }
        }
    };

    $.mapster.impl = (function () {
        var me = {},
            addMap = function (map_data) {
                return m.map_cache.push(map_data) - 1;
            },
            removeMap = function (map_data) {
                m.map_cache.splice(map_data.index, 1);
                for (var i = m.map_cache.length - 1; i >= this.index; i--) {
                    m.map_cache[i].index--;
                }
            };


        /**
         * Test whether the browser supports VML. Credit: google.
         * http://stackoverflow.com/questions/654112/how-do-you-detect-support-for-vml-or-svg-in-a-browser
         * 
         * @return {bool} true if vml is supported, false if not
         */

        function hasVml() {
            var a = $('<div />').appendTo('body');
            a.html('<v:shape id="vml_flag1" adj="1" />');

            var b = a[0].firstChild;
            b.style.behavior = "url(#default#VML)";
            var has = b ? typeof b.adj === "object" : true;
            a.remove();
            return has;
        }

        /**
         * Return a reference to the IE namespaces object, if available, or an empty object otherwise
         * @return {obkect} The document.namespaces object.
         */
        function namespaces() {
            return typeof (document.namespaces) === 'object' ?
                document.namespaces :
                null;
        }

        /**
         * Test for the presence of HTML5 Canvas support. This also checks to see if excanvas.js has been 
         * loaded and is faking it; if so, we assume that canvas is not supported.
         *
         * @return {bool} true if HTML5 canvas support, false if not
         */

        function hasCanvas() {
            var d = namespaces();
            // when g_vml_ is present, then we can be sure excanvas is active, meaning there's not a real canvas.

            return d && d.g_vml_ ?
                false :
                $('<canvas />')[0].getContext ?
                    true :
                    false;
        }

        /**
         * Merge new area data into existing area options on a MapData object. Used for rebinding.
         * 
         * @param  {[MapData]} map_data     The MapData object
         * @param  {[object[]]} areas       areas array to merge
         */

        function merge_areas(map_data, areas) {
            var ar, index,
                map_areas = map_data.options.areas;

            if (areas) {
                $.each(areas, function (i, e) {

                    // Issue #68 - ignore invalid data in areas array

                    if (!e || !e.key) {
                        return;
                    }

                    index = u.indexOfProp(map_areas, "key", e.key);

                    if (index >= 0) {
                        $.extend(map_areas[index], e);
                    }
                    else {
                        map_areas.push(e);
                    }
                    ar = map_data.getDataForKey(e.key);
                    if (ar) {
                        $.extend(ar.options, e);
                    }
                });
            }
        }
        function merge_options(map_data, options) {
            var temp_opts = u.updateProps({}, options);
            delete temp_opts.areas;

            u.updateProps(map_data.options, temp_opts);

            merge_areas(map_data, options.areas);
            // refresh the area_option template
            u.updateProps(map_data.area_options, map_data.options);
        }

        // Most methods use the "Method" object which handles figuring out whether it's an image or area called and
        // parsing key parameters. The constructor wants:
        // this, the jQuery object
        // a function that is called when an image was passed (with a this context of the MapData)
        // a function that is called when an area was passed (with a this context of the AreaData)
        // options: first = true means only the first member of a jQuery object is handled
        //          key = the key parameters passed
        //          defaultReturn: a value to return other than the jQuery object (if its not chainable)
        //          args: the arguments
        // Returns a comma-separated list of user-selected areas. "staticState" areas are not considered selected for the purposes of this method.

        me.get = function (key) {
            var md = m.getMapData(this);
            if (!(md && md.complete)) {
                throw ("Can't access data until binding complete.");
            }

            return (new m.Method(this,
                function () {
                    // map_data return
                    return this.getSelected();
                },
                function () {
                    return this.isSelected();
                },
                {
                    name: 'get',
                    args: arguments,
                    key: key,
                    first: true,
                    allowAsync: true,
                    defaultReturn: ''
                }
            )).go();
        };
        me.data = function (key) {
            return (new m.Method(this,
                null,
                function () {
                    return this;
                },
                {
                    name: 'data',
                    args: arguments,
                    key: key
                }
            )).go();
        };


        // Set or return highlight state.
        //  $(img).mapster('highlight') -- return highlighted area key, or null if none
        //  $(area).mapster('highlight') -- highlight an area
        //  $(img).mapster('highlight','area_key') -- highlight an area
        //  $(img).mapster('highlight',false) -- remove highlight
        me.highlight = function (key) {
            return (new m.Method(this,
                function () {
                    if (key === false) {
                        this.ensureNoHighlight();
                    } else {
                        var id = this.highlightId;
                        return id >= 0 ? this.data[id].key : null;
                    }
                },
                function () {
                    this.highlight();
                },
                {
                    name: 'highlight',
                    args: arguments,
                    key: key,
                    first: true
                }
            )).go();
        };
        // Return the primary keys for an area or group key.
        // $(area).mapster('key')
        // includes all keys (not just primary keys)
        // $(area).mapster('key',true)
        // $(img).mapster('key','group-key')

        // $(img).mapster('key','group-key', true)
        me.keys = function (key, all) {
            var keyList = [],
                md = m.getMapData(this);

            if (!(md && md.complete)) {
                throw ("Can't access data until binding complete.");
            }


            function addUniqueKeys(ad) {
                var areas, keys = [];
                if (!all) {
                    keys.push(ad.key);
                } else {
                    areas = ad.areas();
                    $.each(areas, function (i, e) {
                        keys = keys.concat(e.keys);
                    });
                }
                $.each(keys, function (i, e) {
                    if ($.inArray(e, keyList) < 0) {
                        keyList.push(e);
                    }
                });
            }

            if (!(md && md.complete)) {
                return '';
            }
            if (typeof key === 'string') {
                if (all) {
                    addUniqueKeys(md.getDataForKey(key));
                } else {
                    keyList = [md.getKeysForGroup(key)];
                }
            } else {
                all = key;
                this.each(function (i, e) {
                    if (e.nodeName === 'AREA') {
                        addUniqueKeys(md.getDataForArea(e));
                    }
                });
            }
            return keyList.join(',');


        };
        me.select = function () {
            me.set.call(this, true);
        };
        me.deselect = function () {
            me.set.call(this, false);
        };

        /**
         * Select or unselect areas. Areas can be identified by a single string key, a comma-separated list of keys, 
         * or an array of strings.
         * 
         * 
         * @param {boolean} selected Determines whether areas are selected or deselected
         * @param {string|string[]} key A string, comma-separated string, or array of strings indicating 
         *                              the areas to select or deselect
         * @param {object} options Rendering options to apply when selecting an area
         */

        me.set = function (selected, key, options) {
            var lastMap, map_data, opts = options,
                key_list, area_list; // array of unique areas passed

            function setSelection(ar) {
                if (ar) {
                    switch (selected) {
                        case true:
                            ar.select(opts); break;
                        case false:
                            ar.deselect(true); break;
                        default:
                            ar.toggle(opts); break;
                    }
                }
            }
            function addArea(ar) {
                if (ar && $.inArray(ar, area_list) < 0) {
                    area_list.push(ar);
                    key_list += (key_list === '' ? '' : ',') + ar.key;
                }
            }
            // Clean up after a group that applied to the same map
            function finishSetForMap(map_data) {
                $.each(area_list, function (i, el) {
                    setSelection(el);
                });
                if (!selected) {
                    map_data.removeSelectionFinish();
                }
                if (map_data.options.boundList) {
                    m.setBoundListProperties(map_data.options, m.getBoundList(map_data.options, key_list), selected);
                }
            }

            this.filter('img,area').each(function (i, e) {
                var keys;
                map_data = m.getMapData(e);

                if (map_data !== lastMap) {
                    if (lastMap) {
                        finishSetForMap(lastMap);
                    }

                    area_list = [];
                    key_list = '';
                }

                if (map_data) {

                    keys = '';
                    if (e.nodeName.toUpperCase() === 'IMG') {
                        if (!m.queueCommand(map_data, $(e), 'set', [selected, key, opts])) {
                            if (key instanceof Array) {
                                if (key.length) {
                                    keys = key.join(",");
                                }
                            }
                            else {
                                keys = key;
                            }

                            if (keys) {
                                $.each(u.split(keys), function (i, key) {
                                    addArea(map_data.getDataForKey(key.toString()));
                                    lastMap = map_data;
                                });
                            }
                        }
                    } else {
                        opts = key;
                        if (!m.queueCommand(map_data, $(e), 'set', [selected, opts])) {
                            addArea(map_data.getDataForArea(e));
                            lastMap = map_data;
                        }

                    }
                }
            });

            if (map_data) {
                finishSetForMap(map_data);
            }


            return this;
        };
        me.unbind = function (preserveState) {
            return (new m.Method(this,
                function () {
                    this.clearEvents();
                    this.clearMapData(preserveState);
                    removeMap(this);
                },
                null,
                {
                    name: 'unbind',
                    args: arguments
                }
            )).go();
        };


        // refresh options and update selection information.
        me.rebind = function (options) {
            return (new m.Method(this,
                function () {
                    var me = this;

                    me.complete = false;
                    me.configureOptions(options);
                    me.bindImages().then(function () {
                        me.buildDataset(true);
                        me.complete = true;
                    });
                    //this.redrawSelections();
                },
                null,
                {
                    name: 'rebind',
                    args: arguments
                }
            )).go();
        };
        // get options. nothing or false to get, or "true" to get effective options (versus passed options)
        me.get_options = function (key, effective) {
            var eff = u.isBool(key) ? key : effective; // allow 2nd parm as "effective" when no key
            return (new m.Method(this,
                function () {
                    var opts = $.extend({}, this.options);
                    if (eff) {
                        opts.render_select = u.updateProps(
                            {},
                            m.render_defaults,
                            opts,
                            opts.render_select);

                        opts.render_highlight = u.updateProps(
                            {},
                            m.render_defaults,
                            opts,
                            opts.render_highlight);
                    }
                    return opts;
                },
                function () {
                    return eff ? this.effectiveOptions() : this.options;
                },
                {
                    name: 'get_options',
                    args: arguments,
                    first: true,
                    allowAsync: true,
                    key: key
                }
            )).go();
        };

        // set options - pass an object with options to set,
        me.set_options = function (options) {
            return (new m.Method(this,
                function () {
                    merge_options(this, options);
                },
                null,
                {
                    name: 'set_options',
                    args: arguments
                }
            )).go();
        };
        me.unload = function () {
            var i;
            for (i = m.map_cache.length - 1; i >= 0; i--) {
                if (m.map_cache[i]) {
                    me.unbind.call($(m.map_cache[i].image));
                }
            }
            me.graphics = null;
        };

        me.snapshot = function () {
            return (new m.Method(this,
                function () {
                    $.each(this.data, function (i, e) {
                        e.selected = false;
                    });

                    this.base_canvas = this.graphics.createVisibleCanvas(this);
                    $(this.image).before(this.base_canvas);
                },
                null,
                { name: 'snapshot' }
            )).go();
        };

        // do not queue this function

        me.state = function () {
            var md, result = null;
            $(this).each(function (i, e) {
                if (e.nodeName === 'IMG') {
                    md = m.getMapData(e);
                    if (md) {
                        result = md.state();
                    }
                    return false;
                }
            });
            return result;
        };

        me.bind = function (options) {

            return this.each(function (i, e) {
                var img, map, usemap, md;

                // save ref to this image even if we can't access it yet. commands will be queued
                img = $(e);

                md = m.getMapData(e);

                // if already bound completely, do a total rebind

                if (md) {
                    me.unbind.apply(img);
                    if (!md.complete) {
                        // will be queued
                        img.bind();
                        return true;
                    }
                    md = null;
                }

                // ensure it's a valid image
                // jQuery bug with Opera, results in full-url#usemap being returned from jQuery's attr.
                // So use raw getAttribute instead.

                usemap = this.getAttribute('usemap');
                map = usemap && $('map[name="' + usemap.substr(1) + '"]');
                if (!(img.is('img') && usemap && map.size() > 0)) {
                    return true;
                }

                // sorry - your image must have border:0, things are too unpredictable otherwise.
                img.css('border', 0);

                if (!md) {
                    md = new m.MapData(this, options);

                    md.index = addMap(md);
                    md.map = map;
                    md.bindImages().then(function () {
                        md.initialize();
                    });
                }
            });
        };

        me.init = function (useCanvas) {
            var style, shapes;

            // for testing/debugging, use of canvas can be forced by initializing 
            // manually with "true" or "false". But generally we test for it.

            m.hasCanvas = function () {
                if (!u.isBool(m.hasCanvas.value)) {
                    m.hasCanvas.value = u.isBool(useCanvas) ?
                        useCanvas :
                        hasCanvas();
                }
                return m.hasCanvas.value;
            };
            m.hasVml = function () {
                if (!u.isBool(m.hasVml.value)) {
                    // initialize VML the first time we detect its presence.
                    var d = namespaces();

                    if (d && !d.v) {
                        d.add("v", "urn:schemas-microsoft-com:vml");
                        style = document.createStyleSheet();
                        shapes = ['shape', 'rect', 'oval', 'circ', 'fill', 'stroke', 'imagedata', 'group', 'textbox'];
                        $.each(shapes,
                            function (i, el) {
                                style.addRule('v\\:' + el, "behavior: url(#default#VML); antialias:true");
                            });
                    }
                    m.hasVml.value = hasVml();
                }

                return m.hasVml.value;
            };

            m.isTouch = !!document.documentElement.ontouchstart;

            $.extend(m.defaults, m.render_defaults, m.shared_defaults);
            $.extend(m.area_defaults, m.render_defaults, m.shared_defaults);

        };
        me.test = function (obj) {
            return eval(obj);
        };
        return me;
    }());

    $.mapster.impl.init();


}(jQuery));
/* graphics.js
   Graphics object handles all rendering.
*/
(function ($) {
    var p, m = $.mapster,
        u = m.utils,
        canvasMethods,
        vmlMethods;

    /**
     * Implemenation to add each area in an AreaData object to the canvas
     * @param {Graphics} graphics The target graphics object
     * @param {AreaData} areaData The AreaData object (a collection of area elements and metadata)
     * @param {object} options Rendering options to apply when rendering this group of areas
     */
    function addShapeGroupImpl(graphics, areaData, options) {
        var me = graphics,
            md = me.map_data,
            isMask = options.isMask;

        // first get area options. Then override fade for selecting, and finally merge in the 
        // "select" effect options.

        $.each(areaData.areas(), function (i, e) {
            options.isMask = isMask || (e.nohref && md.options.noHrefIsMask);
            me.addShape(e, options);
        });

        // it's faster just to manipulate the passed options isMask property and restore it, than to 
        // copy the object each time

        options.isMask = isMask;

    }

    /**
    * Convert a hex value to decimal
    * @param  {string} hex A hexadecimal toString
    * @return {int} Integer represenation of the hex string
    */

    function hex_to_decimal(hex) {
        return Math.max(0, Math.min(parseInt(hex, 16), 255));
    }
    function css3color(color, opacity) {
        return 'rgba(' + hex_to_decimal(color.substr(0, 2)) + ','
            + hex_to_decimal(color.substr(2, 2)) + ','
            + hex_to_decimal(color.substr(4, 2)) + ',' + opacity + ')';
    }
    /**
     * An object associated with a particular map_data instance to manage renderin.
     * @param {MapData} map_data The MapData object bound to this instance
     */

    m.Graphics = function (map_data) {
        //$(window).unload($.mapster.unload);
        // create graphics functions for canvas and vml browsers. usage:
        // 1) init with map_data, 2) call begin with canvas to be used (these are separate b/c may not require canvas to be specified
        // 3) call add_shape_to for each shape or mask, 4) call render() to finish

        var me = this;
        me.active = false;
        me.canvas = null;
        me.width = 0;
        me.height = 0;
        me.shapes = [];
        me.masks = [];
        me.map_data = map_data;
    };

    p = m.Graphics.prototype = {
        constructor: m.Graphics,

        /**
         * Initiate a graphics request for a canvas
         * @param  {Element} canvas The canvas element that is the target of this operation
         * @param  {string} [elementName] The name to assign to the element (VML only)
         */

        begin: function (canvas, elementName) {
            var c = $(canvas);

            this.elementName = elementName;
            this.canvas = canvas;

            this.width = c.width();
            this.height = c.height();
            this.shapes = [];
            this.masks = [];
            this.active = true;

        },

        /**
         * Add an area to be rendered to this canvas. 
         * @param {MapArea} mapArea The MapArea object to render
         * @param {object} options An object containing any rendering options that should override the
         *                         defaults for the area
         */

        addShape: function (mapArea, options) {
            var addto = options.isMask ? this.masks : this.shapes;
            addto.push({ mapArea: mapArea, options: options });
        },

        /**
         * Create a canvas that is sized and styled for the MapData object
         * @param  {MapData} mapData The MapData object that will receive this new canvas
         * @return {Element} A canvas element
         */

        createVisibleCanvas: function (mapData) {
            return $(this.createCanvasFor(mapData))
                .addClass('mapster_el')
                .css(m.canvas_style)[0];
        },

        /**
         * Add a group of shapes from an AreaData object to the canvas
         * 
         * @param {AreaData} areaData An AreaData object (a set of area elements)
         * @param {string} mode     The rendering mode, "select" or "highlight". This determines the target 
         *                          canvas and which default options to use.
         * @param {striong} options  Rendering options
         */

        addShapeGroup: function (areaData, mode, options) {
            // render includeKeys first - because they could be masks
            var me = this,
                list, name, canvas,
                map_data = this.map_data,
                opts = areaData.effectiveRenderOptions(mode);

            if (options) {
                $.extend(opts, options);
            }

            if (mode === 'select') {
                name = "static_" + areaData.areaId.toString();
                canvas = map_data.base_canvas;
            } else {
                canvas = map_data.overlay_canvas;
            }

            me.begin(canvas, name);

            if (opts.includeKeys) {
                list = u.split(opts.includeKeys);
                $.each(list, function (i, e) {
                    var areaData = map_data.getDataForKey(e.toString());
                    addShapeGroupImpl(me, areaData, areaData.effectiveRenderOptions(mode));
                });
            }

            addShapeGroupImpl(me, areaData, opts);
            me.render();
            if (opts.fade) {

                // fading requires special handling for IE. We must access the fill elements directly. The fader also has to deal with 
                // the "opacity" attribute (not css)

                u.fader(m.hasCanvas() ?
                    canvas :
                    $(canvas).find('._fill').not('.mapster_mask'),
                    0,
                    m.hasCanvas() ?
                        1 :
                        opts.fillOpacity,
                    opts.fadeDuration);

            }

        }

        // These prototype methods are implementation dependent
    };

    function noop() { }


    // configure remaining prototype methods for ie or canvas-supporting browser

    canvasMethods = {
        renderShape: function (context, mapArea, offset) {
            var i,
                c = mapArea.coords(null, offset);

            switch (mapArea.shape) {
                case 'rect':
                    context.rect(c[0], c[1], c[2] - c[0], c[3] - c[1]);
                    break;
                case 'poly':
                    context.moveTo(c[0], c[1]);

                    for (i = 2; i < mapArea.length; i += 2) {
                        context.lineTo(c[i], c[i + 1]);
                    }
                    context.lineTo(c[0], c[1]);
                    break;
                case 'circ':
                case 'circle':
                    context.arc(c[0], c[1], c[2], 0, Math.PI * 2, false);
                    break;
            }
        },
        addAltImage: function (context, image, mapArea, options) {
            context.beginPath();

            this.renderShape(context, mapArea);
            context.closePath();
            context.clip();

            context.globalAlpha = options.altImageOpacity || options.fillOpacity;

            context.drawImage(image, 0, 0, mapArea.owner.scaleInfo.width, mapArea.owner.scaleInfo.height);
        },
        render: function () {
            // firefox 6.0 context.save() seems to be broken. to work around,  we have to draw the contents on one temp canvas,
            // the mask on another, and merge everything. ugh. fixed in 1.2.2. unfortunately this is a lot more code for masks,
            // but no other way around it that i can see.

            var maskCanvas, maskContext,
                me = this,
                md = me.map_data,
                hasMasks = me.masks.length,
                shapeCanvas = me.createCanvasFor(md),
                shapeContext = shapeCanvas.getContext('2d'),
                context = me.canvas.getContext('2d');

            if (hasMasks) {
                maskCanvas = me.createCanvasFor(md);
                maskContext = maskCanvas.getContext('2d');
                maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

                $.each(me.masks, function (i, e) {
                    maskContext.save();
                    maskContext.beginPath();
                    me.renderShape(maskContext, e.mapArea);
                    maskContext.closePath();
                    maskContext.clip();
                    maskContext.lineWidth = 0;
                    maskContext.fillStyle = '#000';
                    maskContext.fill();
                    maskContext.restore();
                });

            }

            $.each(me.shapes, function (i, s) {
                shapeContext.save();
                if (s.options.fill) {
                    if (s.options.altImageId) {
                        me.addAltImage(shapeContext, md.images[s.options.altImageId], s.mapArea, s.options);
                    } else {
                        shapeContext.beginPath();
                        me.renderShape(shapeContext, s.mapArea);
                        shapeContext.closePath();
                        //shapeContext.clip();
                        shapeContext.fillStyle = css3color(s.options.fillColor, s.options.fillOpacity);
                        shapeContext.fill();
                    }
                }
                shapeContext.restore();
            });


            // render strokes at end since masks get stroked too

            $.each(me.shapes.concat(me.masks), function (i, s) {
                var offset = s.options.strokeWidth === 1 ? 0.5 : 0;
                // offset applies only when stroke width is 1 and stroke would render between pixels.

                if (s.options.stroke) {
                    shapeContext.save();
                    shapeContext.strokeStyle = css3color(s.options.strokeColor, s.options.strokeOpacity);
                    shapeContext.lineWidth = s.options.strokeWidth;

                    shapeContext.beginPath();

                    me.renderShape(shapeContext, s.mapArea, offset);
                    shapeContext.closePath();
                    shapeContext.stroke();
                    shapeContext.restore();
                }
            });

            if (hasMasks) {
                // render the new shapes against the mask

                maskContext.globalCompositeOperation = "source-out";
                maskContext.drawImage(shapeCanvas, 0, 0);

                // flatten into the main canvas
                context.drawImage(maskCanvas, 0, 0);
            } else {
                context.drawImage(shapeCanvas, 0, 0);
            }

            me.active = false;
            return me.canvas;
        },

        // create a canvas mimicing dimensions of an existing element
        createCanvasFor: function (md) {
            return $('<canvas width="' + md.scaleInfo.width + '" height="' + md.scaleInfo.height + '"></canvas>')[0];
        },
        clearHighlight: function () {
            var c = this.map_data.overlay_canvas;
            c.getContext('2d').clearRect(0, 0, c.width, c.height);
        },
        // Draw all items from selected_list to a new canvas, then swap with the old one. This is used to delete items when using canvases.
        refreshSelections: function () {
            var canvas_temp, map_data = this.map_data;
            // draw new base canvas, then swap with the old one to avoid flickering
            canvas_temp = map_data.base_canvas;

            map_data.base_canvas = this.createVisibleCanvas(map_data);
            $(map_data.base_canvas).hide();
            $(canvas_temp).before(map_data.base_canvas);

            map_data.redrawSelections();

            $(map_data.base_canvas).show();
            $(canvas_temp).remove();
        }
    };

    vmlMethods = {

        renderShape: function (mapArea, options, cssclass) {
            var me = this, fill, stroke, e, t_fill, el_name, el_class, template, c = mapArea.coords();
            el_name = me.elementName ? 'name="' + me.elementName + '" ' : '';
            el_class = cssclass ? 'class="' + cssclass + '" ' : '';

            t_fill = '<v:fill color="#' + options.fillColor + '" class="_fill" opacity="' +
                (options.fill ?
                    options.fillOpacity :
                    0) +
                '" /><v:stroke class="_fill" opacity="' +
                options.strokeOpacity + '"/>';


            stroke = options.stroke ?
                ' strokeweight=' + options.strokeWidth + ' stroked="t" strokecolor="#' +
                options.strokeColor + '"' :
                ' stroked="f"';

            fill = options.fill ?
                ' filled="t"' :
                ' filled="f"';

            switch (mapArea.shape) {
                case 'rect':
                    template = '<v:rect ' + el_class + el_name + fill + stroke +
                        ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' +
                        c[0] + 'px;top:' + c[1] + 'px;width:' + (c[2] - c[0]) +
                        'px;height:' + (c[3] - c[1]) + 'px;">' + t_fill + '</v:rect>';
                    break;
                case 'poly':
                    template = '<v:shape ' + el_class + el_name + fill + stroke + ' coordorigin="0,0" coordsize="' + me.width + ',' + me.height
                        + '" path="m ' + c[0] + ',' + c[1] + ' l ' + c.slice(2).join(',')
                        + ' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:' + me.width + 'px;height:' + me.height + 'px;">' + t_fill + '</v:shape>';
                    break;
                case 'circ':
                case 'circle':
                    template = '<v:oval ' + el_class + el_name + fill + stroke
                        + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + (c[0] - c[2]) + 'px;top:' + (c[1] - c[2])
                        + 'px;width:' + (c[2] * 2) + 'px;height:' + (c[2] * 2) + 'px;">' + t_fill + '</v:oval>';
                    break;
            }
            e = $(template);
            $(me.canvas).append(e);

            return e;
        },
        render: function () {
            var opts, me = this;

            $.each(this.shapes, function (i, e) {
                me.renderShape(e.mapArea, e.options);
            });

            if (this.masks.length) {
                $.each(this.masks, function (i, e) {
                    opts = u.updateProps({},
                        e.options, {
                        fillOpacity: 1,
                        fillColor: e.options.fillColorMask
                    });
                    me.renderShape(e.mapArea, opts, 'mapster_mask');
                });
            }

            this.active = false;
            return this.canvas;
        },

        createCanvasFor: function (md) {
            var w = md.scaleInfo.width,
                h = md.scaleInfo.height;
            return $('<var width="' + w + '" height="' + h
                + '" style="zoom:1;overflow:hidden;display:block;width:'
                + w + 'px;height:' + h + 'px;"></var>')[0];
        },

        clearHighlight: function () {
            $(this.map_data.overlay_canvas).children().remove();
        },
        // remove single or all selections
        removeSelections: function (area_id) {
            if (area_id >= 0) {
                $(this.map_data.base_canvas).find('[name="static_' + area_id.toString() + '"]').remove();
            }
            else {
                $(this.map_data.base_canvas).children().remove();
            }
        }

    };

    // for all methods with two implemenatations, add a function that will automatically replace itself with the correct
    // method on first invocation

    $.each(['renderShape',
        'addAltImage',
        'render',
        'createCanvasFor',
        'clearHighlight',
        'removeSelections',
        'refreshSelections'],
        function (i, e) {
            p[e] = (function (method) {
                return function () {
                    p[method] = (m.hasCanvas() ?
                        canvasMethods[method] :
                        vmlMethods[method]) || noop;

                    return p[method].apply(this, arguments);
                };
            }(e));
        });


}(jQuery));
/* mapimage.js
   the MapImage object, repesents an instance of a single bound imagemap
*/

(function ($) {

    var m = $.mapster,
        u = m.utils,
        ap = [];
    /**
     * An object encapsulating all the images used by a MapData.
     */

    m.MapImages = function (owner) {
        this.owner = owner;
        this.clear();
    };


    m.MapImages.prototype = {
        constructor: m.MapImages,

        /* interface to make this array-like */

        slice: function () {
            return ap.slice.apply(this, arguments);
        },
        splice: function () {
            ap.slice.apply(this.status, arguments);
            var result = ap.slice.apply(this, arguments);
            return result;
        },

        /** 
         * a boolean value indicates whether all images are done loading 
         * @return {bool} true when all are done
         */
        complete: function () {
            return $.inArray(false, this.status) < 0;
        },

        /**
         * Save an image in the images array and return its index 
         * @param  {Image} image An Image object
         * @return {int} the index of the image
         */

        _add: function (image) {
            var index = ap.push.call(this, image) - 1;
            this.status[index] = false;
            return index;
        },

        /**
         * Return the index of an Image within the images array
         * @param  {Image} img An Image
         * @return {int} the index within the array, or -1 if it was not found
         */

        indexOf: function (image) {
            return $.inArray(image, this);
        },

        /**
         * Clear this object and reset it to its initial state after binding.
         */

        clear: function () {
            var me = this;

            if (me.ids && me.ids.length > 0) {
                $.each(me.ids, function (i, e) {
                    delete me[e];
                });
            }

            /**
             * A list of the cross-reference IDs bound to this object
             * @type {string[]}
             */

            me.ids = [];

            /**
             * Length property for array-like behavior, set to zero when initializing. Array prototype
             * methods will update it after that.
             * 
             * @type {int}
             */

            me.length = 0;

            /**
             * the loaded status of the corresponding image
             * @type {boolean[]}
             */

            me.status = [];


            // actually erase the images

            me.splice(0);

        },

        /**
         * Bind an image to the map and add it to the queue to be loaded; return an ID that
         * can be used to reference the
         * 
         * @param {Image|string} image An Image object or a URL to an image
         * @param {string} [id] An id to refer to this image
         * @returns {int} an ID referencing the index of the image object in 
         *                map_data.images
         */

        add: function (image, id) {
            var index, src, me = this;

            if (!image) { return; }

            if (typeof image === 'string') {
                src = image;
                image = me[src];
                if (typeof image === 'object') {
                    return me.indexOf(image);
                }

                image = $('<img />')
                    .addClass('mapster_el')
                    .hide();

                index = me._add(image[0]);

                image
                    .bind('load', function (e) {
                        me.imageLoaded.call(me, e);
                    })
                    .bind('error', function (e) {
                        me.imageLoadError.call(me, e);
                    });

                image.attr('src', src);
            } else {

                // use attr because we want the actual source, not the resolved path the browser will return directly calling image.src

                index = me._add($(image)[0]);
            }
            if (id) {
                if (this[id]) {
                    throw (id + " is already used or is not available as an altImage alias.");
                }
                me.ids.push(id);
                me[id] = me[index];
            }
            return index;
        },

        /**
         * Bind the images in this object, 
         * @param  {boolean} retry when true, indicates that the function is calling itself after failure 
         * @return {Promise} a promise that resolves when the images have finished loading
         */

        bind: function (retry) {
            var me = this,
                promise,
                triesLeft = me.owner.options.configTimeout / 200,

                /* A recursive function to continue checking that the images have been 
                   loaded until a timeout has elapsed */

                check = function () {
                    var i;

                    // refresh status of images

                    i = me.length;

                    while (i-- > 0) {
                        if (!me.isLoaded(i)) {
                            break;
                        }
                    }

                    // check to see if every image has already been loaded

                    if (me.complete()) {
                        me.resolve();
                    } else {
                        // to account for failure of onLoad to fire in rare situations
                        if (triesLeft-- > 0) {
                            me.imgTimeout = window.setTimeout(function () {
                                check.call(me, true);
                            }, 50);
                        } else {
                            me.imageLoadError.call(me);
                        }
                    }

                };

            promise = me.deferred = u.defer();

            check();
            return promise;
        },

        resolve: function () {
            var me = this,
                resolver = me.deferred;

            if (resolver) {
                // Make a copy of the resolver before calling & removing it to ensure
                // it is not called twice
                me.deferred = null;
                resolver.resolve();
            }
        },

        /**
         * Event handler for image onload
         * @param  {object} e jQuery event data
         */

        imageLoaded: function (e) {
            var me = this,
                index = me.indexOf(e.target);

            if (index >= 0) {

                me.status[index] = true;
                if ($.inArray(false, me.status) < 0) {
                    me.resolve();
                }
            }
        },

        /**
         * Event handler for onload error
         * @param  {object} e jQuery event data
         */

        imageLoadError: function (e) {
            clearTimeout(this.imgTimeout);
            this.triesLeft = 0;
            var err = e ? 'The image ' + e.target.src + ' failed to load.' :
                'The images never seemed to finish loading. You may just need to increase the configTimeout if images could take a long time to load.';
            throw err;
        },
        /**
         * Test if the image at specificed index has finished loading
         * @param  {int}  index The image index
         * @return {boolean} true if loaded, false if not
         */

        isLoaded: function (index) {
            var img,
                me = this,
                status = me.status;

            if (status[index]) { return true; }
            img = me[index];

            if (typeof img.complete !== 'undefined') {
                status[index] = img.complete;
            } else {
                status[index] = !!u.imgWidth(img);
            }
            // if complete passes, the image is loaded, but may STILL not be available because of stuff like adblock.
            // make sure it is.

            return status[index];
        }
    };
}(jQuery));
/* mapdata.js
   the MapData object, repesents an instance of a single bound imagemap
*/


(function ($) {

    var m = $.mapster,
        u = m.utils;

    /**
     * Set default values for MapData object properties
     * @param  {MapData} me The MapData object
     */

    function initializeDefaults(me) {
        $.extend(me, {
            complete: false,         // (bool)    when configuration is complete       
            map: null,                // ($)      the image map
            base_canvas: null,       // (canvas|var)  where selections are rendered
            overlay_canvas: null,    // (canvas|var)  where highlights are rendered
            commands: [],            // {}        commands that were run before configuration was completed (b/c images weren't loaded)
            data: [],                // MapData[] area groups
            mapAreas: [],            // MapArea[] list. AreaData entities contain refs to this array, so options are stored with each.
            _xref: {},               // (int)      xref of mapKeys to data[]
            highlightId: -1,        // (int)      the currently highlighted element.
            currentAreaId: -1,
            _tooltip_events: [],     // {}         info on events we bound to a tooltip container, so we can properly unbind them
            scaleInfo: null,         // {}         info about the image size, scaling, defaults
            index: -1,                 // index of this in map_cache - so we have an ID to use for wraper div
            activeAreaEvent: null
        });
    }

    /**
     * Return an array of all image-containing options from an options object; 
     * that is, containers that may have an "altImage" property
     * 
     * @param  {object} obj     An options object
     * @return {object[]}       An array of objects
     */
    function getOptionImages(obj) {
        return [obj, obj.render_highlight, obj.render_select];
    }

    /**
     * Parse all the altImage references, adding them to the library so they can be preloaded
     * and aliased.
     * 
     * @param  {MapData} me The MapData object on which to operate
     */
    function configureAltImages(me) {
        var opts = me.options,
            mi = me.images;

        // add alt images

        if (m.hasCanvas()) {
            // map altImage library first

            $.each(opts.altImages || {}, function (i, e) {
                mi.add(e, i);
            });

            // now find everything else

            $.each([opts].concat(opts.areas), function (i, e) {
                $.each(getOptionImages(e), function (i2, e2) {
                    if (e2 && e2.altImage) {
                        e2.altImageId = mi.add(e2.altImage);
                    }
                });
            });
        }

        // set area_options
        me.area_options = u.updateProps({}, // default options for any MapArea
            m.area_defaults,
            opts);
    }

    /**
     * Queue a mouse move action based on current delay settings 
     * (helper for mouseover/mouseout handlers)
     * 
     * @param  {MapData}    me       The MapData context
     * @param  {number}     delay    The number of milliseconds to delay the action
     * @param  {AreaData}   area     AreaData affected
     * @param  {Deferred}   deferred A deferred object to return (instead of a new one)
     * @return {Promise}    A promise that resolves when the action is completed
     */
    function queueMouseEvent(me, delay, area, deferred) {

        deferred = deferred || u.when.defer();

        function cbFinal(areaId) {
            if (me.currentAreaId !== areaId && me.highlightId >= 0) {
                deferred.resolve();
            }
        }
        if (me.activeAreaEvent) {
            window.clearTimeout(me.activeAreaEvent);
            me.activeAreaEvent = 0;
        }
        if (delay < 0) {
            return;
        }

        if (area.owner.currentAction || delay) {
            me.activeAreaEvent = window.setTimeout((function () {
                return function () {
                    queueMouseEvent(me, 0, area, deferred);
                };
            }(area)),
                delay || 100);
        } else {
            cbFinal(area.areaId);
        }
        return deferred;
    }

    /**
    * Mousedown event. This is captured only to prevent browser from drawing an outline around an
    * area when it's clicked.
    *
    * @param  {EventData} e jQuery event data
    */

    function mousedown(e) {
        if (!m.hasCanvas()) {
            this.blur();
        }
        e.preventDefault();
    }

    /**
     * Mouseover event. Handle highlight rendering and client callback on mouseover
     * 
     * @param  {MapData} me The MapData context
     * @param  {EventData} e jQuery event data
     * @return {[type]}   [description]
     */

    function mouseover(me, e) {
        var arData = me.getAllDataForArea(this),
            ar = arData.length ? arData[0] : null;

        // mouseover events are ignored entirely while resizing, though we do care about mouseout events
        // and must queue the action to keep things clean.

        if (!ar || ar.isNotRendered() || ar.owner.currentAction) {
            return;
        }

        if (me.currentAreaId === ar.areaId) {
            return;
        }
        if (me.highlightId !== ar.areaId) {
            me.clearEffects();

            ar.highlight();

            if (me.options.showToolTip) {
                $.each(arData, function (i, e) {
                    if (e.effectiveOptions().toolTip) {
                        e.showToolTip();
                    }
                });
            }
        }

        me.currentAreaId = ar.areaId;

        if ($.isFunction(me.options.onMouseover)) {
            me.options.onMouseover.call(this,
                {
                    e: e,
                    options: ar.effectiveOptions(),
                    key: ar.key,
                    selected: ar.isSelected()
                });
        }
    }

    /**
     * Mouseout event.
     *
     * @param  {MapData} me The MapData context
     * @param  {EventData} e jQuery event data
     * @return {[type]}   [description]
     */

    function mouseout(me, e) {
        var newArea,
            ar = me.getDataForArea(this),
            opts = me.options;


        if (me.currentAreaId < 0 || !ar) {
            return;
        }

        newArea = me.getDataForArea(e.relatedTarget);

        if (newArea === ar) {
            return;
        }

        me.currentAreaId = -1;
        ar.area = null;

        queueMouseEvent(me, opts.mouseoutDelay, ar)
            .then(me.clearEffects);

        if ($.isFunction(opts.onMouseout)) {
            opts.onMouseout.call(this,
                {
                    e: e,
                    options: opts,
                    key: ar.key,
                    selected: ar.isSelected()
                });
        }

    }

    /**
     * Clear any active tooltip or highlight
     *
     * @param  {MapData} me The MapData context
     * @param  {EventData} e jQuery event data
     * @return {[type]}   [description]
     */

    function clearEffects(me) {
        var opts = me.options;

        me.ensureNoHighlight();

        if (opts.toolTipClose
            && $.inArray('area-mouseout', opts.toolTipClose) >= 0
            && me.activeToolTip) {
            me.clearToolTip();
        }
    }

    /**
     * Mouse click event handler
     *
     * @param  {MapData} me The MapData context
     * @param  {EventData} e jQuery event data
     * @return {[type]}   [description]
     */

    function click(me, e) {
        var selected, list, list_target, newSelectionState, canChangeState, cbResult,
            that = this,
            ar = me.getDataForArea(this),
            opts = me.options;

        function clickArea(ar) {
            var areaOpts, target;
            canChangeState = (ar.isSelectable() &&
                (ar.isDeselectable() || !ar.isSelected()));

            if (canChangeState) {
                newSelectionState = !ar.isSelected();
            } else {
                newSelectionState = ar.isSelected();
            }

            list_target = m.getBoundList(opts, ar.key);

            if ($.isFunction(opts.onClick)) {
                cbResult = opts.onClick.call(that,
                    {
                        e: e,
                        listTarget: list_target,
                        key: ar.key,
                        selected: newSelectionState
                    });

                if (u.isBool(cbResult)) {
                    if (!cbResult) {
                        return false;
                    }
                    target = $(ar.area).attr('href');
                    if (target !== '#') {
                        window.location.href = target;
                        return false;
                    }
                }
            }

            if (canChangeState) {
                selected = ar.toggle();
            }

            if (opts.boundList && opts.boundList.length > 0) {
                m.setBoundListProperties(opts, list_target, ar.isSelected());
            }

            areaOpts = ar.effectiveOptions();
            if (areaOpts.includeKeys) {
                list = u.split(areaOpts.includeKeys);
                $.each(list, function (i, e) {
                    var ar = me.getDataForKey(e.toString());
                    if (!ar.options.isMask) {
                        clickArea(ar);
                    }
                });
            }
        }

        mousedown.call(this, e);

        if (opts.clickNavigate && ar.href) {
            window.location.href = ar.href;
            return;
        }

        if (ar && !ar.owner.currentAction) {
            opts = me.options;
            clickArea(ar);
        }
    }

    /**
     * Prototype for a MapData object, representing an ImageMapster bound object
     * @param {Element} image   an IMG element
     * @param {object} options  ImageMapster binding options
     */
    m.MapData = function (image, options) {
        var me = this;

        // (Image)  main map image

        me.image = image;

        me.images = new m.MapImages(me);
        me.graphics = new m.Graphics(me);

        // save the initial style of the image for unbinding. This is problematic, chrome 
        // duplicates styles when assigning, and cssText is apparently not universally supported.
        // Need to do something more robust to make unbinding work universally.

        me.imgCssText = image.style.cssText || null;

        initializeDefaults(me);

        me.configureOptions(options);

        // create context-bound event handlers from our private functions

        me.mouseover = function (e) { mouseover.call(this, me, e); };
        me.mouseout = function (e) { mouseout.call(this, me, e); };
        me.click = function (e) { click.call(this, me, e); };
        me.clearEffects = function (e) { clearEffects.call(this, me, e); };
    };

    m.MapData.prototype = {
        constructor: m.MapData,

        /**
        * Set target.options from defaults + options
        * @param  {[type]} target      The target
        * @param  {[type]} options     The options to merge
        */

        configureOptions: function (options) {
            this.options = u.updateProps({}, m.defaults, options);
        },

        /**
         * Ensure all images are loaded
         * @return {Promise} A promise that resolves when the images have finished loading (or fail)
         */

        bindImages: function () {
            var me = this,
                mi = me.images;

            // reset the images if this is a rebind

            if (mi.length > 2) {
                mi.splice(2);
            } else if (mi.length === 0) {

                // add the actual main image
                mi.add(me.image);
                // will create a duplicate of the main image, we need this to get raw size info
                mi.add(me.image.src);
            }

            configureAltImages(me);

            return me.images.bind();
        },

        /**
         * Test whether an async action is currently in progress
         * @return {Boolean} true or false indicating state
         */

        isActive: function () {
            return !this.complete || this.currentAction;
        },

        /**
         * Return an object indicating the various states. This isn't really used by 
         * production code.
         * 
         * @return {object} An object with properties for various states
         */

        state: function () {
            return {
                complete: this.complete,
                resizing: this.currentAction === 'resizing',
                zoomed: this.zoomed,
                zoomedArea: this.zoomedArea,
                scaleInfo: this.scaleInfo
            };
        },

        /**
         * Get a unique ID for the wrapper of this imagemapster
         * @return {string} A string that is unique to this image
         */

        wrapId: function () {
            return 'mapster_wrap_' + this.index;
        },
        _idFromKey: function (key) {
            return typeof key === "string" && this._xref.hasOwnProperty(key) ?
                this._xref[key] : -1;
        },

        /**
         * Return a comma-separated string of all selected keys
         * @return {string} CSV of all keys that are currently selected
         */

        getSelected: function () {
            var result = '';
            $.each(this.data, function (i, e) {
                if (e.isSelected()) {
                    result += (result ? ',' : '') + this.key;
                }
            });
            return result;
        },

        /**
         * Get an array of MapAreas associated with a specific AREA based on the keys for that area
         * @param  {Element} area   An HTML AREA
         * @param  {number} atMost  A number limiting the number of areas to be returned (typically 1 or 0 for no limit)
         * @return {MapArea[]}      Array of MapArea objects
         */

        getAllDataForArea: function (area, atMost) {
            var i, ar, result,
                me = this,
                key = $(area).filter('area').attr(me.options.mapKey);

            if (key) {
                result = [];
                key = u.split(key);

                for (i = 0; i < (atMost || key.length); i++) {
                    ar = me.data[me._idFromKey(key[i])];
                    ar.area = area.length ? area[0] : area;
                    // set the actual area moused over/selected
                    // TODO: this is a brittle model for capturing which specific area - if this method was not used,
                    // ar.area could have old data. fix this.
                    result.push(ar);
                }
            }

            return result;
        },
        getDataForArea: function (area) {
            var ar = this.getAllDataForArea(area, 1);
            return ar ? ar[0] || null : null;
        },
        getDataForKey: function (key) {
            return this.data[this._idFromKey(key)];
        },

        /**
         * Get the primary keys associated with an area group.
         * If this is a primary key, it will be returned.
         * 
         * @param  {string key An area key
         * @return {string} A CSV of area keys
         */

        getKeysForGroup: function (key) {
            var ar = this.getDataForKey(key);

            return !ar ? '' :
                ar.isPrimary ?
                    ar.key :
                    this.getPrimaryKeysForMapAreas(ar.areas()).join(',');
        },

        /**
         * given an array of MapArea object, return an array of its unique primary keys
         * @param  {MapArea[]} areas The areas to analyze
         * @return {string[]} An array of unique primary keys
         */

        getPrimaryKeysForMapAreas: function (areas) {
            var keys = [];
            $.each(areas, function (i, e) {
                if ($.inArray(e.keys[0], keys) < 0) {
                    keys.push(e.keys[0]);
                }
            });
            return keys;
        },
        getData: function (obj) {
            if (typeof obj === 'string') {
                return this.getDataForKey(obj);
            } else if (obj && obj.mapster || u.isElement(obj)) {
                return this.getDataForArea(obj);
            } else {
                return null;
            }
        },
        // remove highlight if present, raise event
        ensureNoHighlight: function () {
            var ar;
            if (this.highlightId >= 0) {
                this.graphics.clearHighlight();
                ar = this.data[this.highlightId];
                ar.changeState('highlight', false);
                this.setHighlightId(-1);
            }
        },
        setHighlightId: function (id) {
            this.highlightId = id;
        },

        /**
         * Clear all active selections on this map
         */

        clearSelections: function () {
            $.each(this.data, function (i, e) {
                if (e.selected) {
                    e.deselect(true);
                }
            });
            this.removeSelectionFinish();

        },

        /**
         * Set area options from an array of option data.
         * 
         * @param {object[]} areas An array of objects containing area-specific options
         */

        setAreaOptions: function (areas) {
            var i, area_options, ar;
            areas = areas || [];

            // refer by: map_data.options[map_data.data[x].area_option_id]

            for (i = areas.length - 1; i >= 0; i--) {
                area_options = areas[i];
                if (area_options) {
                    ar = this.getDataForKey(area_options.key);
                    if (ar) {
                        u.updateProps(ar.options, area_options);

                        // TODO: will not deselect areas that were previously selected, so this only works
                        // for an initial bind.

                        if (u.isBool(area_options.selected)) {
                            ar.selected = area_options.selected;
                        }
                    }
                }
            }
        },
        // keys: a comma-separated list
        drawSelections: function (keys) {
            var i, key_arr = u.asArray(keys);

            for (i = key_arr.length - 1; i >= 0; i--) {
                this.data[key_arr[i]].drawSelection();
            }
        },
        redrawSelections: function () {
            $.each(this.data, function (i, e) {
                if (e.isSelectedOrStatic()) {
                    e.drawSelection();
                }
            });

        },
        ///called when images are done loading
        initialize: function () {
            var imgCopy, base_canvas, overlay_canvas, wrap, parentId, css, i, size,
                img, sort_func, sorted_list, scale,
                me = this,
                opts = me.options;

            if (me.complete) {
                return;
            }

            img = $(me.image);

            parentId = img.parent().attr('id');

            // create a div wrapper only if there's not already a wrapper, otherwise, own it

            if (parentId && parentId.length >= 12 && parentId.substring(0, 12) === "mapster_wrap") {
                wrap = img.parent();
                wrap.attr('id', me.wrapId());
            } else {
                wrap = $('<div id="' + me.wrapId() + '"></div>');

                if (opts.wrapClass) {
                    if (opts.wrapClass === true) {
                        wrap.addClass(img[0].className);
                    }
                    else {
                        wrap.addClass(opts.wrapClass);
                    }
                }
            }
            me.wrapper = wrap;

            // me.images[1] is the copy of the original image. It should be loaded & at its native size now so we can obtain the true
            // width & height. This is needed to scale the imagemap if not being shown at its native size. It is also needed purely
            // to finish binding in case the original image was not visible. It can be impossible in some browsers to obtain the
            // native size of a hidden image.

            me.scaleInfo = scale = u.scaleMap(me.images[0], me.images[1], opts.scaleMap);

            me.base_canvas = base_canvas = me.graphics.createVisibleCanvas(me);
            me.overlay_canvas = overlay_canvas = me.graphics.createVisibleCanvas(me);

            // Now we got what we needed from the copy -clone from the original image again to make sure any other attributes are copied
            imgCopy = $(me.images[1])
                .addClass('mapster_el ' + me.images[0].className)
                .attr({ id: null, usemap: null });

            size = u.size(me.images[0]);

            if (size.complete) {
                imgCopy.css({
                    width: size.width,
                    height: size.height
                });
            }

            me.buildDataset();

            // now that we have processed all the areas, set css for wrapper, scale map if needed

            css = {
                display: 'block',
                position: 'relative',
                padding: 0,
                width: scale.width,
                height: scale.height
            };

            if (opts.wrapCss) {
                $.extend(css, opts.wrapCss);
            }
            // if we were rebinding with an existing wrapper, the image will aready be in it
            if (img.parent()[0] !== me.wrapper[0]) {

                img.before(me.wrapper);
            }

            wrap.css(css);

            // move all generated images into the wrapper for easy removal later

            $(me.images.slice(2)).hide();
            for (i = 1; i < me.images.length; i++) {
                wrap.append(me.images[i]);
            }

            //me.images[1].style.cssText = me.image.style.cssText;

            wrap.append(base_canvas)
                .append(overlay_canvas)
                .append(img.css(m.canvas_style));

            // images[0] is the original image with map, images[1] is the copy/background that is visible

            u.setOpacity(me.images[0], 0);
            $(me.images[1]).show();

            u.setOpacity(me.images[1], 1);

            if (opts.isSelectable && opts.onGetList) {
                sorted_list = me.data.slice(0);
                if (opts.sortList) {
                    if (opts.sortList === "desc") {
                        sort_func = function (a, b) {
                            return a === b ? 0 : (a > b ? -1 : 1);
                        };
                    }
                    else {
                        sort_func = function (a, b) {
                            return a === b ? 0 : (a < b ? -1 : 1);
                        };
                    }

                    sorted_list.sort(function (a, b) {
                        a = a.value;
                        b = b.value;
                        return sort_func(a, b);
                    });
                }

                me.options.boundList = opts.onGetList.call(me.image, sorted_list);
            }

            me.complete = true;
            me.processCommandQueue();

            if (opts.onConfigured && typeof opts.onConfigured === 'function') {
                opts.onConfigured.call(img, true);
            }
        },

        // when rebind is true, the MapArea data will not be rebuilt.
        buildDataset: function (rebind) {
            var sel, areas, j, area_id, $area, area, curKey, mapArea, key, keys, mapAreaId, group_value, dataItem, href,
                me = this,
                opts = me.options,
                default_group;

            function addAreaData(key, value) {
                var dataItem = new m.AreaData(me, key, value);
                dataItem.areaId = me._xref[key] = me.data.push(dataItem) - 1;
                return dataItem.areaId;
            }

            me._xref = {};
            me.data = [];
            if (!rebind) {
                me.mapAreas = [];
            }

            default_group = !opts.mapKey;
            if (default_group) {
                opts.mapKey = 'data-mapster-key';
            }

            // the [attribute] selector is broken on old IE with jQuery. hasVml() is a quick and dirty
            // way to test for that

            sel = m.hasVml() ? 'area' :
                (default_group ?
                    'area[coords]' :
                    'area[' + opts.mapKey + ']');

            areas = $(me.map).find(sel).unbind('.mapster');

            for (mapAreaId = 0; mapAreaId < areas.length; mapAreaId++) {
                area_id = 0;
                area = areas[mapAreaId];
                $area = $(area);

                // skip areas with no coords - selector broken for older ie
                if (!area.coords) {
                    continue;
                }
                // Create a key if none was assigned by the user

                if (default_group) {
                    curKey = String(mapAreaId);
                    $area.attr('data-mapster-key', curKey);

                } else {
                    curKey = area.getAttribute(opts.mapKey);
                }

                // conditions for which the area will be bound to mouse events
                // only bind to areas that don't have nohref. ie 6&7 cannot detect the presence of nohref, so we have to also not bind if href is missing.

                if (rebind) {
                    mapArea = me.mapAreas[$area.data('mapster') - 1];
                    mapArea.configure(curKey);
                } else {
                    mapArea = new m.MapArea(me, area, curKey);
                    me.mapAreas.push(mapArea);
                }

                keys = mapArea.keys; // converted to an array by mapArea


                // Iterate through each mapKey assigned to this area
                for (j = keys.length - 1; j >= 0; j--) {
                    key = keys[j];

                    if (opts.mapValue) {
                        group_value = $area.attr(opts.mapValue);
                    }
                    if (default_group) {
                        // set an attribute so we can refer to the area by index from the DOM object if no key
                        area_id = addAreaData(me.data.length, group_value);
                        dataItem = me.data[area_id];
                        dataItem.key = key = area_id.toString();
                    }
                    else {
                        area_id = me._xref[key];
                        if (area_id >= 0) {
                            dataItem = me.data[area_id];
                            if (group_value && !me.data[area_id].value) {
                                dataItem.value = group_value;
                            }
                        }
                        else {
                            area_id = addAreaData(key, group_value);
                            dataItem = me.data[area_id];
                            dataItem.isPrimary = j === 0;
                        }
                    }
                    mapArea.areaDataXref.push(area_id);
                    dataItem.areasXref.push(mapAreaId);
                }

                href = $area.attr('href');
                if (href && href !== '#' && !dataItem.href) {
                    dataItem.href = href;
                }

                if (!mapArea.nohref) {
                    $area.bind('click.mapster', me.click);

                    if (!m.isTouch) {
                        $area.bind('mouseover.mapster', me.mouseover)
                            .bind('mouseout.mapster', me.mouseout)
                            .bind('mousedown.mapster', me.mousedown);

                    }

                }

                // store an ID with each area. 
                $area.data("mapster", mapAreaId + 1);
            }

            // TODO listenToList
            //            if (opts.listenToList && opts.nitG) {
            //                opts.nitG.bind('click.mapster', event_hooks[map_data.hooks_index].listclick_hook);
            //            }

            // populate areas from config options
            me.setAreaOptions(opts.areas);
            me.redrawSelections();

        },
        processCommandQueue: function () {

            var cur, me = this;
            while (!me.currentAction && me.commands.length) {
                cur = me.commands[0];
                me.commands.splice(0, 1);
                m.impl[cur.command].apply(cur.that, cur.args);
            }
        },
        clearEvents: function () {
            $(this.map).find('area')
                .unbind('.mapster');
            $(this.images)
                .unbind('.mapster');
        },
        _clearCanvases: function (preserveState) {
            // remove the canvas elements created
            if (!preserveState) {
                $(this.base_canvas).remove();
            }
            $(this.overlay_canvas).remove();
        },
        clearMapData: function (preserveState) {
            var me = this;
            this._clearCanvases(preserveState);

            // release refs to DOM elements
            $.each(this.data, function (i, e) {
                e.reset();
            });
            this.data = null;
            if (!preserveState) {
                // get rid of everything except the original image
                this.image.style.cssText = this.imgCssText;
                $(this.wrapper).before(this.image).remove();
            }

            me.images.clear();

            this.image = null;
            u.ifFunction(this.clearTooltip, this);
        },

        // Compelete cleanup process for deslecting items. Called after a batch operation, or by AreaData for single
        // operations not flagged as "partial"

        removeSelectionFinish: function () {
            var g = this.graphics;

            g.refreshSelections();
            // do not call ensure_no_highlight- we don't really want to unhilight it, just remove the effect
            g.clearHighlight();
        }
    };
}(jQuery));
/* areadata.js
   AreaData and MapArea protoypes
*/

(function ($) {
    var m = $.mapster, u = m.utils;

    /**
     * Select this area
     * 
     * @param {AreaData} me  AreaData context
     * @param {object} options Options for rendering the selection
     */
    function select(options) {
        // need to add the new one first so that the double-opacity effect leaves the current one highlighted for singleSelect

        var me = this, o = me.owner;
        if (o.options.singleSelect) {
            o.clearSelections();
        }

        // because areas can overlap - we can't depend on the selection state to tell us anything about the inner areas.
        // don't check if it's already selected
        if (!me.isSelected()) {
            if (options) {

                // cache the current options, and map the altImageId if an altimage 
                // was passed

                me.optsCache = $.extend(me.effectiveRenderOptions('select'),
                    options,
                    {
                        altImageId: o.images.add(options.altImage)
                    });
            }

            me.drawSelection();

            me.selected = true;
            me.changeState('select', true);
        }

        if (o.options.singleSelect) {
            o.graphics.refreshSelections();
        }
    }

    /**
     * Deselect this area, optionally deferring finalization so additional areas can be deselected
     * in a single operation
     * 
     * @param  {boolean} partial when true, the caller must invoke "finishRemoveSelection" to render 
     */

    function deselect(partial) {
        var me = this;
        me.selected = false;
        me.changeState('select', false);

        // release information about last area options when deselecting.

        me.optsCache = null;
        me.owner.graphics.removeSelections(me.areaId);

        // Complete selection removal process. This is separated because it's very inefficient to perform the whole
        // process for multiple removals, as the canvas must be totally redrawn at the end of the process.ar.remove

        if (!partial) {
            me.owner.removeSelectionFinish();
        }
    }

    /**
     * Toggle the selection state of this area
     * @param  {object} options Rendering options, if toggling on
     * @return {bool} The new selection state
     */
    function toggle(options) {
        var me = this;
        if (!me.isSelected()) {
            me.select(options);
        }
        else {
            me.deselect();
        }
        return me.isSelected();
    }

    /**
     * An AreaData object; represents a conceptual area that can be composed of 
     * one or more MapArea objects
     * 
     * @param {MapData} owner The MapData object to which this belongs
     * @param {string} key   The key for this area
     * @param {string} value The mapValue string for this area
     */

    m.AreaData = function (owner, key, value) {
        $.extend(this, {
            owner: owner,
            key: key || '',
            // means this represents the first key in a list of keys (it's the area group that gets highlighted on mouseover)
            isPrimary: true,
            areaId: -1,
            href: '',
            value: value || '',
            options: {},
            // "null" means unchanged. Use "isSelected" method to just test true/false 
            selected: null,
            // xref to MapArea objects
            areasXref: [],
            // (temporary storage) - the actual area moused over
            area: null,
            // the last options used to render this. Cache so when re-drawing after a remove, changes in options won't
            // break already selected things. 
            optsCache: null
        });
    };

    /**
     * The public API for AreaData object
     */

    m.AreaData.prototype = {
        constuctor: m.AreaData,
        select: select,
        deselect: deselect,
        toggle: toggle,
        areas: function () {
            var i, result = [];
            for (i = 0; i < this.areasXref.length; i++) {
                result.push(this.owner.mapAreas[this.areasXref[i]]);
            }
            return result;
        },
        // return all coordinates for all areas
        coords: function (offset) {
            var coords = [];
            $.each(this.areas(), function (i, el) {
                coords = coords.concat(el.coords(offset));
            });
            return coords;
        },
        reset: function () {
            $.each(this.areas(), function (i, e) {
                e.reset();
            });
            this.areasXref = [];
            this.options = null;
        },
        // Return the effective selected state of an area, incorporating staticState
        isSelectedOrStatic: function () {

            var o = this.effectiveOptions();
            return u.isBool(o.staticState) ? o.staticState :
                this.isSelected();
        },
        isSelected: function () {
            return u.isBool(this.selected) ? this.selected :
                u.isBool(this.owner.area_options.selected) ? this.owner.area_options.selected : false;
        },
        isSelectable: function () {
            return u.isBool(this.effectiveOptions().staticState) ? false :
                (u.isBool(this.owner.options.staticState) ? false : u.boolOrDefault(this.effectiveOptions().isSelectable, true));
        },
        isDeselectable: function () {
            return u.isBool(this.effectiveOptions().staticState) ? false :
                (u.isBool(this.owner.options.staticState) ? false : u.boolOrDefault(this.effectiveOptions().isDeselectable, true));
        },
        isNotRendered: function () {
            var area = $(this.area);
            return area.attr('nohref') ||
                !area.attr('href') ||
                this.effectiveOptions().isMask;

        },


        /**
        * Return the overall options effective for this area. 
        * This should get the default options, and merge in area-specific options, finally
        * overlaying options passed by parameter
        * 
        * @param  {[type]} options  options which will supercede all other options for this area
        * @return {[type]}          the combined options
        */

        effectiveOptions: function (options) {

            var opts = u.updateProps({},
                this.owner.area_options,
                this.options,
                options || {},
                {
                    id: this.areaId
                }
            );

            opts.selected = this.isSelected();

            return opts;
        },

        /**
         * Return the options effective for this area for a "render" or "highlight" mode. 
         * This should get the default options, merge in the areas-specific options, 
         * and then the mode-specific options.
         * @param  {string} mode    'render' or 'highlight'
         * @param  {[type]} options  options which will supercede all other options for this area
         * @return {[type]}          the combined options
         */

        effectiveRenderOptions: function (mode, options) {
            var allOpts, opts = this.optsCache;

            if (!opts || mode === 'highlight') {
                allOpts = this.effectiveOptions(options);
                opts = u.updateProps({},
                    allOpts,
                    allOpts["render_" + mode]
                );

                if (mode !== 'highlight') {
                    this.optsCache = opts;
                }
            }
            return $.extend({}, opts);
        },

        // Fire callback on area state change
        changeState: function (state_type, state) {
            if ($.isFunction(this.owner.options.onStateChange)) {
                this.owner.options.onStateChange.call(this.owner.image,
                    {
                        key: this.key,
                        state: state_type,
                        selected: state
                    }
                );
            }
        },

        // highlight this area

        highlight: function (options) {
            var o = this.owner;
            if (this.effectiveOptions().highlight) {
                o.graphics.addShapeGroup(this, "highlight", options);
            }
            o.setHighlightId(this.areaId);
            this.changeState('highlight', true);
        },

        // select this area. if "callEvent" is true then the state change event will be called. (This method can be used
        // during config operations, in which case no event is indicated)

        drawSelection: function () {


            this.owner.graphics.addShapeGroup(this, "select");

        }


    };
    // represents an HTML area
    m.MapArea = function (owner, areaEl, keys) {
        if (!owner) {
            return;
        }
        var me = this;
        me.owner = owner;   // a MapData object
        me.area = areaEl;
        me.areaDataXref = []; // a list of map_data.data[] id's for each areaData object containing this
        me.originalCoords = [];
        $.each(u.split(areaEl.coords), function (i, el) {
            me.originalCoords.push(parseFloat(el));
        });
        me.length = me.originalCoords.length;
        me.shape = areaEl.shape.toLowerCase();
        me.nohref = areaEl.nohref || !areaEl.href;
        me.configure(keys);
    };
    m.MapArea.prototype = {
        constructor: m.MapArea,
        configure: function (keys) {
            this.keys = u.split(keys);
        },
        reset: function () {
            this.area = null;
        },
        coords: function (offset) {
            return $.map(this.originalCoords, function (e) {
                return offset ? e : e + offset;
            });
        }
    };
}(jQuery));
/* areacorners.js
   determine the best place to put a box of dimensions (width,height) given a circle, rect or poly
*/

(function ($) {
    var u = $.mapster.utils;


    /**
     * Compute positions that will place a target with dimensions [width,height] outside 
     * but near the boundaries of the elements "elements". When an imagemap is passed, the 
     *
     * @param  {Element|Element[]} elements An element or an array of elements (such as a jQuery object)
     * @param  {Element} image The image to which area elements are bound, if this is an image map.
     * @param  {Element} container The contianer in which the target must be constrained (or document, if missing)
     * @param  {int} width The width of the target object
     * @return {object} a structure with the x and y positions
     */
    u.areaCorners = function (elements, image, container, width, height) {
        var pos, found, minX, minY, maxX, maxY, bestMinX, bestMaxX, bestMinY, bestMaxY, curX, curY, nest, j,
            offsetx = 0,
            offsety = 0,
            rootx,
            rooty,
            iCoords, radius, angle, el,
            coords = [];

        // if a single element was passed, map it to an array

        elements = elements.length ?
            elements :
            [elements];

        container = container ?
            $(container) :
            $(document.body);

        // get the relative root of calculation

        pos = container.offset();
        rootx = pos.left;
        rooty = pos.top;

        // with areas, all we know about is relative to the top-left corner of the image. We need to add an offset compared to
        // the actual container. After this calculation, offsetx/offsety can be added to either the area coords, or the target's
        // absolute position to get the correct top/left boundaries of the container.

        if (image) {
            pos = $(image).offset();
            offsetx = pos.left;
            offsety = pos.top;
        }

        // map the coordinates of any type of shape to a poly and use the logic. simpler than using three different
        // calculation methods. Circles use a 20 degree increment for this estimation.

        for (j = 0; j < elements.length; j++) {
            el = elements[j];
            if (el.nodeName === 'AREA') {
                iCoords = u.split(el.coords, parseInt);

                switch (el.shape) {
                    case 'circle':
                        curX = iCoords[0];
                        curY = iCoords[1];
                        radius = iCoords[2];
                        coords = [];
                        for (j = 0; j < 360; j += 20) {
                            angle = j * Math.PI / 180;
                            coords.push(curX + radius * Math.cos(angle), curY + radius * Math.sin(angle));
                        }
                        break;
                    case 'rect':
                        coords.push(iCoords[0], iCoords[1], iCoords[2], iCoords[1], iCoords[2], iCoords[3], iCoords[0], iCoords[3]);
                        break;
                    default:
                        coords = coords.concat(iCoords);
                        break;
                }

                // map area positions to it's real position in the container

                for (j = 0; j < coords.length; j += 2) {
                    coords[j] = parseInt(coords[j], 10) + offsetx;
                    coords[j + 1] = parseInt(coords[j + 1], 10) + offsety;
                }
            } else {
                el = $(el);
                pos = el.position();
                coords.push(pos.left, pos.top,
                    pos.left + el.width(), pos.top,
                    pos.left + el.width(), pos.top + el.height(),
                    pos.left, pos.top + el.height());

            }
        }

        minX = minY = bestMinX = bestMinY = 999999;
        maxX = maxY = bestMaxX = bestMaxY = -1;

        for (j = coords.length - 2; j >= 0; j -= 2) {
            curX = coords[j];
            curY = coords[j + 1];

            if (curX < minX) {
                minX = curX;
                bestMaxY = curY;
            }
            if (curX > maxX) {
                maxX = curX;
                bestMinY = curY;
            }
            if (curY < minY) {
                minY = curY;
                bestMaxX = curX;
            }
            if (curY > maxY) {
                maxY = curY;
                bestMinX = curX;
            }

        }

        // try to figure out the best place for the tooltip

        if (width && height) {
            found = false;
            $.each([[bestMaxX - width, minY - height], [bestMinX, minY - height],
            [minX - width, bestMaxY - height], [minX - width, bestMinY],
            [maxX, bestMaxY - height], [maxX, bestMinY],
            [bestMaxX - width, maxY], [bestMinX, maxY]
            ], function (i, e) {
                if (!found && (e[0] > rootx && e[1] > rooty)) {
                    nest = e;
                    found = true;
                    return false;
                }
            });

            // default to lower-right corner if nothing fit inside the boundaries of the image

            if (!found) {
                nest = [maxX, maxY];
            }
        }
        return nest;
    };
}(jQuery));
/* scale.js: resize and zoom functionality
   requires areacorners.js, when.js
*/


(function ($) {
    var m = $.mapster, u = m.utils, p = m.MapArea.prototype;

    m.utils.getScaleInfo = function (eff, actual) {
        var pct;
        if (!actual) {
            pct = 1;
            actual = eff;
        } else {
            pct = eff.width / actual.width || eff.height / actual.height;
            // make sure a float error doesn't muck us up
            if (pct > 0.98 && pct < 1.02) { pct = 1; }
        }
        return {
            scale: (pct !== 1),
            scalePct: pct,
            realWidth: actual.width,
            realHeight: actual.height,
            width: eff.width,
            height: eff.height,
            ratio: eff.width / eff.height
        };
    };
    // Scale a set of AREAs, return old data as an array of objects
    m.utils.scaleMap = function (image, imageRaw, scale) {

        // stunningly, jQuery width can return zero even as width does not, seems to happen only
        // with adBlock or maybe other plugins. These must interfere with onload events somehow.


        var vis = u.size(image),
            raw = u.size(imageRaw, true);

        if (!raw.complete()) {
            throw ("Another script, such as an extension, appears to be interfering with image loading. Please let us know about this.");
        }
        if (!vis.complete()) {
            vis = raw;
        }
        return this.getScaleInfo(vis, scale ? raw : null);
    };

    /**
     * Resize the image map. Only one of newWidth and newHeight should be passed to preserve scale
     * 
     * @param  {int}   width       The new width OR an object containing named parameters matching this function sig
     * @param  {int}   height      The new height
     * @param  {int}   effectDuration Time in ms for the resize animation, or zero for no animation
     * @param  {function} callback    A function to invoke when the operation finishes
     * @return {promise}              NOT YET IMPLEMENTED
     */

    m.MapData.prototype.resize = function (width, height, duration, callback) {
        var p, promises, newsize, els, highlightId, ratio,
            me = this;

        // allow omitting duration
        callback = callback || duration;

        function sizeCanvas(canvas, w, h) {
            if (m.hasCanvas()) {
                canvas.width = w;
                canvas.height = h;
            } else {
                $(canvas).width(w);
                $(canvas).height(h);
            }
        }

        // Finalize resize action, do callback, pass control to command queue

        function cleanupAndNotify() {

            me.currentAction = '';

            if ($.isFunction(callback)) {
                callback();
            }

            me.processCommandQueue();
        }

        // handle cleanup after the inner elements are resized

        function finishResize() {
            sizeCanvas(me.overlay_canvas, width, height);

            // restore highlight state if it was highlighted before
            if (highlightId >= 0) {
                var areaData = me.data[highlightId];
                areaData.tempOptions = { fade: false };
                me.getDataForKey(areaData.key).highlight();
                areaData.tempOptions = null;
            }
            sizeCanvas(me.base_canvas, width, height);
            me.redrawSelections();
            cleanupAndNotify();
        }

        function resizeMapData() {
            $(me.image).css(newsize);
            // start calculation at the same time as effect
            me.scaleInfo = u.getScaleInfo({
                width: width,
                height: height
            },
                {
                    width: me.scaleInfo.realWidth,
                    height: me.scaleInfo.realHeight
                });
            $.each(me.data, function (i, e) {
                $.each(e.areas(), function (i, e) {
                    e.resize();
                });
            });
        }

        if (me.scaleInfo.width === width && me.scaleInfo.height === height) {
            return;
        }

        highlightId = me.highlightId;


        if (!width) {
            ratio = height / me.scaleInfo.realHeight;
            width = Math.round(me.scaleInfo.realWidth * ratio);
        }
        if (!height) {
            ratio = width / me.scaleInfo.realWidth;
            height = Math.round(me.scaleInfo.realHeight * ratio);
        }

        newsize = { 'width': String(width) + 'px', 'height': String(height) + 'px' };
        if (!m.hasCanvas()) {
            $(me.base_canvas).children().remove();
        }

        // resize all the elements that are part of the map except the image itself (which is not visible)
        // but including the div wrapper
        els = $(me.wrapper).find('.mapster_el').add(me.wrapper);

        if (duration) {
            promises = [];
            me.currentAction = 'resizing';
            els.each(function (i, e) {
                p = u.defer();
                promises.push(p);

                $(e).animate(newsize, {
                    duration: duration,
                    complete: p.resolve,
                    easing: "linear"
                });
            });

            p = u.defer();
            promises.push(p);

            // though resizeMapData is not async, it needs to be finished just the same as the animations,
            // so add it to the "to do" list.

            u.when.all(promises).then(finishResize);
            resizeMapData();
            p.resolve();
        } else {
            els.css(newsize);
            resizeMapData();
            finishResize();

        }
    };


    m.MapArea = u.subclass(m.MapArea, function () {
        //change the area tag data if needed
        this.base.init();
        if (this.owner.scaleInfo.scale) {
            this.resize();
        }
    });

    p.coords = function (percent, coordOffset) {
        var j, newCoords = [],
            pct = percent || this.owner.scaleInfo.scalePct,
            offset = coordOffset || 0;

        if (pct === 1 && coordOffset === 0) {
            return this.originalCoords;
        }

        for (j = 0; j < this.length; j++) {
            //amount = j % 2 === 0 ? xPct : yPct;
            newCoords.push(Math.round(this.originalCoords[j] * pct) + offset);
        }
        return newCoords;
    };
    p.resize = function () {
        this.area.coords = this.coords().join(',');
    };

    p.reset = function () {
        this.area.coords = this.coords(1).join(',');
    };

    m.impl.resize = function (width, height, duration, callback) {
        if (!width && !height) {
            return false;
        }
        var x = (new m.Method(this,
            function () {
                this.resize(width, height, duration, callback);
            },
            null,
            {
                name: 'resize',
                args: arguments
            }
        )).go();
        return x;
    };

    /*
        m.impl.zoom = function (key, opts) {
            var options = opts || {};
    
            function zoom(areaData) {
                // this will be MapData object returned by Method
    
                var scroll, corners, height, width, ratio,
                        diffX, diffY, ratioX, ratioY, offsetX, offsetY, newWidth, newHeight, scrollLeft, scrollTop,
                        padding = options.padding || 0,
                        scrollBarSize = areaData ? 20 : 0,
                        me = this,
                        zoomOut = false;
    
                if (areaData) {
                    // save original state on first zoom operation
                    if (!me.zoomed) {
                        me.zoomed = true;
                        me.preZoomWidth = me.scaleInfo.width;
                        me.preZoomHeight = me.scaleInfo.height;
                        me.zoomedArea = areaData;
                        if (options.scroll) {
                            me.wrapper.css({ overflow: 'auto' });
                        }
                    }
                    corners = $.mapster.utils.areaCorners(areaData.coords(1, 0));
                    width = me.wrapper.innerWidth() - scrollBarSize - padding * 2;
                    height = me.wrapper.innerHeight() - scrollBarSize - padding * 2;
                    diffX = corners.maxX - corners.minX;
                    diffY = corners.maxY - corners.minY;
                    ratioX = width / diffX;
                    ratioY = height / diffY;
                    ratio = Math.min(ratioX, ratioY);
                    offsetX = (width - diffX * ratio) / 2;
                    offsetY = (height - diffY * ratio) / 2;
    
                    newWidth = me.scaleInfo.realWidth * ratio;
                    newHeight = me.scaleInfo.realHeight * ratio;
                    scrollLeft = (corners.minX) * ratio - padding - offsetX;
                    scrollTop = (corners.minY) * ratio - padding - offsetY;
                } else {
                    if (!me.zoomed) {
                        return;
                    }
                    zoomOut = true;
                    newWidth = me.preZoomWidth;
                    newHeight = me.preZoomHeight;
                    scrollLeft = null;
                    scrollTop = null;
                }
    
                this.resize({
                    width: newWidth,
                    height: newHeight,
                    duration: options.duration,
                    scroll: scroll,
                    scrollLeft: scrollLeft,
                    scrollTop: scrollTop,
                    // closure so we can be sure values are correct
                    callback: (function () {
                        var isZoomOut = zoomOut,
                                scroll = options.scroll,
                                areaD = areaData;
                        return function () {
                            if (isZoomOut) {
                                me.preZoomWidth = null;
                                me.preZoomHeight = null;
                                me.zoomed = false;
                                me.zoomedArea = false;
                                if (scroll) {
                                    me.wrapper.css({ overflow: 'inherit' });
                                }
                            } else {
                                // just to be sure it wasn't canceled & restarted
                                me.zoomedArea = areaD;
                            }
                        };
                    } ())
                });
            }
            return (new m.Method(this,
                    function (opts) {
                        zoom.call(this);
                    },
                    function () {
                        zoom.call(this.owner, this);
                    },
                    {
                        name: 'zoom',
                        args: arguments,
                        first: true,
                        key: key
                    }
                    )).go();
    
    
        };
        */
}(jQuery));
/* tooltip.js - tooltip functionality
   requires areacorners.js
*/

(function ($) {

    var m = $.mapster, u = m.utils;

    $.extend(m.defaults, {
        toolTipContainer: '<div style="border: 2px solid black; background: #EEEEEE; width:160px; padding:4px; margin: 4px; -moz-box-shadow: 3px 3px 5px #535353; ' +
            '-webkit-box-shadow: 3px 3px 5px #535353; box-shadow: 3px 3px 5px #535353; -moz-border-radius: 6px 6px 6px 6px; -webkit-border-radius: 6px; ' +
            'border-radius: 6px 6px 6px 6px; opacity: 0.9;"></dteniv>',
        showToolTip: false,
        toolTipFade: true,
        toolTipClose: ['area-mouseout', 'image-mouseout'],
        onShowToolTip: null,
        onHideToolTip: null
    });

    $.extend(m.area_defaults, {
        toolTip: null,
        toolTipClose: null
    });


    /**
     * Show a tooltip positioned near this area.
     * 
     * @param {string|jquery} html A string of html or a jQuery object containing the tooltip content.
     * @param {string|jquery} [template] The html template in which to wrap the content
     * @param {string|object} [css] CSS to apply to the outermost element of the tooltip 
     * @return {jquery} The tooltip that was created
     */

    function createToolTip(html, template, css) {
        var tooltip;

        // wrap the template in a jQuery object, or clone the template if it's already one.
        // This assumes that anything other than a string is a jQuery object; if it's not jQuery will
        // probably throw an error.

        if (template) {
            tooltip = typeof template === 'string' ?
                $(template) :
                $(template).clone();

            tooltip.append(html);
        } else {
            tooltip = $(html);
        }

        // always set display to block, or the positioning css won't work if the end user happened to
        // use a non-block type element.

        tooltip.css($.extend((css || {}), {
            display: "block",
            position: "absolute"
        })).hide();

        $('body').append(tooltip);

        // we must actually add the tooltip to the DOM and "show" it in order to figure out how much space it
        // consumes, and then reposition it with that knowledge.
        // We also cache the actual opacity setting to restore finally.

        tooltip.attr("data-opacity", tooltip.css("opacity"))
            .css("opacity", 0);

        // doesn't really show it because opacity=0

        return tooltip.show();
    }


    /**
     * Show a tooltip positioned near this area.
     * 
     * @param {jquery} tooltip The tooltip
     * @param {object} [options] options for displaying the tooltip.
     *  @config {int} [left] The 0-based absolute x position for the tooltip
     *  @config {int} [top] The 0-based absolute y position for the tooltip
     *  @config {string|object} [css] CSS to apply to the outermost element of the tooltip 
     *  @config {bool} [fadeDuration] When non-zero, the duration in milliseconds of a fade-in effect for the tooltip.
     */

    function showToolTipImpl(tooltip, options) {
        var tooltipCss = {
            "left": options.left + "px",
            "top": options.top + "px"
        },
            actalOpacity = tooltip.attr("data-opacity") || 0,
            zindex = tooltip.css("z-index");

        if (parseInt(zindex, 10) === 0
            || zindex === "auto") {
            tooltipCss["z-index"] = 9999;
        }

        tooltip.css(tooltipCss)
            .addClass('mapster_tooltip');


        if (options.fadeDuration && options.fadeDuration > 0) {
            u.fader(tooltip[0], 0, actalOpacity, options.fadeDuration);
        } else {
            u.setOpacity(tooltip[0], actalOpacity);
        }
    }

    /**
     * Hide and remove active tooltips
     * 
     * @param  {MapData} this The mapdata object to which the tooltips belong
     */

    m.MapData.prototype.clearToolTip = function () {
        if (this.activeToolTip) {
            this.activeToolTip.stop().remove();
            this.activeToolTip = null;
            this.activeToolTipID = null;
            u.ifFunction(this.options.onHideToolTip, this);
        }
    };

    /**
     * Configure the binding between a named tooltip closing option, and a mouse event.
     *
     * If a callback is passed, it will be called when the activating event occurs, and the tooltip will
     * only closed if it returns true.
     *
     * @param  {MapData}  [this]     The MapData object to which this tooltip belongs.
     * @param  {String}   option     The name of the tooltip closing option
     * @param  {String}   event      UI event to bind to this option
     * @param  {Element}  target     The DOM element that is the target of the event
     * @param  {Function} [beforeClose] Callback when the tooltip is closed
     * @param  {Function} [onClose]  Callback when the tooltip is closed
     */
    function bindToolTipClose(options, bindOption, event, target, beforeClose, onClose) {
        var event_name = event + '.mapster-tooltip';

        if ($.inArray(bindOption, options) >= 0) {
            target.unbind(event_name)
                .bind(event_name, function (e) {
                    if (!beforeClose || beforeClose.call(this, e)) {
                        target.unbind('.mapster-tooltip');
                        if (onClose) {
                            onClose.call(this);
                        }
                    }
                });

            return {
                object: target,
                event: event_name
            };
        }
    }

    /**
     * Show a tooltip.
     *
     * @param {string|jquery}   [tooltip]       A string of html or a jQuery object containing the tooltip content.
     * 
     * @param {string|jquery}   [target]        The target of the tooltip, to be used to determine positioning. If null,
     *                                          absolute position values must be passed with left and top.
     *
     * @param {string|jquery}   [image]         If target is an [area] the image that owns it
     * 
     * @param {string|jquery}   [container]     An element within which the tooltip must be bounded
     *
     *
     * 
     * @param {object|string|jQuery} [options]  options to apply when creating this tooltip - OR -
     *                                          The markup, or a jquery object, containing the data for the tooltip 
     *                                         
     *  @config {string}        [closeEvents]   A string with one or more comma-separated values that determine when the tooltip
     *                                          closes: 'area-click','tooltip-click','image-mouseout' are valid values
     *                                          then no template will be used.
     *  @config {int}           [offsetx]       the horizontal amount to offset the tooltip 
     *  @config {int}           [offsety]       the vertical amount to offset the tooltip 
     *  @config {string|object} [css]           CSS to apply to the outermost element of the tooltip 
     */

    function showToolTip(tooltip, target, image, container, options) {
        var corners,
            ttopts = {};

        options = options || {};


        if (target) {

            corners = u.areaCorners(target, image, container,
                tooltip.outerWidth(true),
                tooltip.outerHeight(true));

            // Try to upper-left align it first, if that doesn't work, change the parameters

            ttopts.left = corners[0];
            ttopts.top = corners[1];

        } else {

            ttopts.left = options.left;
            ttopts.top = options.top;
        }

        ttopts.left += (options.offsetx || 0);
        ttopts.top += (options.offsety || 0);

        ttopts.css = options.css;
        ttopts.fadeDuration = options.fadeDuration;

        showToolTipImpl(tooltip, ttopts);

        return tooltip;
    }

    /**
     * Show a tooltip positioned near this area.
      *
     * @param {string|jquery}   [content]       A string of html or a jQuery object containing the tooltip content.
     
     * @param {object|string|jQuery} [options]  options to apply when creating this tooltip - OR -
     *                                          The markup, or a jquery object, containing the data for the tooltip 
     *  @config {string|jquery}   [container]     An element within which the tooltip must be bounded
     *  @config {bool}          [template]      a template to use instead of the default. If this property exists and is null,
     *                                          then no template will be used.
     *  @config {string}        [closeEvents]   A string with one or more comma-separated values that determine when the tooltip
     *                                          closes: 'area-click','tooltip-click','image-mouseout' are valid values
     *                                          then no template will be used.
     *  @config {int}           [offsetx]       the horizontal amount to offset the tooltip 
     *  @config {int}           [offsety]       the vertical amount to offset the tooltip 
     *  @config {string|object} [css]           CSS to apply to the outermost element of the tooltip 
     */
    m.AreaData.prototype.showToolTip = function (content, options) {
        var tooltip, closeOpts, target, tipClosed, template,
            ttopts = {},
            ad = this,
            md = ad.owner,
            areaOpts = ad.effectiveOptions();

        // copy the options object so we can update it
        options = options ? $.extend({}, options) : {};

        content = content || areaOpts.toolTip;
        closeOpts = options.closeEvents || areaOpts.toolTipClose || md.options.toolTipClose || 'tooltip-click';

        template = typeof options.template !== 'undefined' ?
            options.template :
            md.options.toolTipContainer;

        options.closeEvents = typeof closeOpts === 'string' ?
            closeOpts = u.split(closeOpts) :
            closeOpts;

        options.fadeDuration = options.fadeDuration ||
            (md.options.toolTipFade ?
                (md.options.fadeDuration || areaOpts.fadeDuration) : 0);

        target = ad.area ?
            ad.area :
            $.map(ad.areas(),
                function (e) {
                    return e.area;
                });

        if (md.activeToolTipID === ad.areaId) {
            return;
        }

        md.clearToolTip();

        md.activeToolTip = tooltip = createToolTip(content,
            template,
            options.css);

        md.activeToolTipID = ad.areaId;

        tipClosed = function () {
            md.clearToolTip();
        };

        bindToolTipClose(closeOpts, 'area-click', 'click', $(md.map), null, tipClosed);
        bindToolTipClose(closeOpts, 'tooltip-click', 'click', tooltip, null, tipClosed);
        bindToolTipClose(closeOpts, 'image-mouseout', 'mouseout', $(md.image), function (e) {
            return (e.relatedTarget && e.relatedTarget.nodeName !== 'AREA' && e.relatedTarget !== ad.area);
        }, tipClosed);


        showToolTip(tooltip,
            target,
            md.image,
            options.container,
            template,
            options);

        u.ifFunction(md.options.onShowToolTip, ad.area,
            {
                toolTip: tooltip,
                options: ttopts,
                areaOptions: areaOpts,
                key: ad.key,
                selected: ad.isSelected()
            });

        return tooltip;
    };


    /**
     * Parse an object that could be a string, a jquery object, or an object with a "contents" property
     * containing html or a jQuery object.
     * 
     * @param  {object|string|jQuery} options The parameter to parse
     * @return {string|jquery} A string or jquery object
     */
    function getHtmlFromOptions(options) {

        // see if any html was passed as either the options object itself, or the content property

        return (options ?
            ((typeof options === 'string' || options.jquery) ?
                options :
                options.content) :
            null);
    }

    /**
     * Activate or remove a tooltip for an area. When this method is called on an area, the
     * key parameter doesn't apply and "options" is the first parameter.
     *
     * When called with no parameters, or "key" is a falsy value, any active tooltip is cleared.
     * 
     * When only a key is provided, the default tooltip for the area is used. 
     * 
     * When html is provided, this is used instead of the default tooltip.
     * 
     * When "noTemplate" is true, the default tooltip template will not be used either, meaning only
     * the actual html passed will be used.
     *  
     * @param  {string|AreaElement} key The area for which to activate a tooltip, or a DOM element.
     * 
     * @param {object|string|jquery} [options] options to apply when creating this tooltip - OR -
     *                                         The markup, or a jquery object, containing the data for the tooltip 
     *  @config {string|jQuery} [content]   the inner content of the tooltip; the tooltip text or HTML
     *  @config {Element|jQuery} [container]   the inner content of the tooltip; the tooltip text or HTML
     *  @config {bool}          [template]  a template to use instead of the default. If this property exists and is null,
     *                                      then no template will be used.
     *  @config {int}           [offsetx]   the horizontal amount to offset the tooltip.
     *  @config {int}           [offsety]   the vertical amount to offset the tooltip.
     *  @config {string|object} [css]       CSS to apply to the outermost element of the tooltip 
     *  @config {string|object} [css] CSS to apply to the outermost element of the tooltip 
     *  @config {bool}          [fadeDuration] When non-zero, the duration in milliseconds of a fade-in effect for the tooltip.
     * @return {jQuery} The jQuery object
     */

    m.impl.tooltip = function (key, options) {
        return (new m.Method(this,
            function mapData() {
                var tooltip, target, md = this;
                if (!key) {
                    md.clearToolTip();
                } else {
                    target = $(key);
                    if (md.activeToolTipID === target[0]) {
                        return;
                    }
                    md.clearToolTip();

                    md.activeToolTip = tooltip = createToolTip(getHtmlFromOptions(options),
                        options.template || md.options.toolTipContainer,
                        options.css);
                    md.activeToolTipID = target[0];

                    bindToolTipClose(['tooltip-click'], 'tooltip-click', 'click', tooltip, null, function () {
                        md.clearToolTip();
                    });

                    md.activeToolTip = tooltip = showToolTip(tooltip,
                        target,
                        md.image,
                        options.container,
                        options);
                }
            },
            function areaData() {
                if ($.isPlainObject(key) && !options) {
                    options = key;
                }

                this.showToolTip(getHtmlFromOptions(options), options);
            },
            {
                name: 'tooltip',
                args: arguments,
                key: key
            }
        )).go();
    };
}(jQuery));



// ==================================================
// fancyBox v3.5.7
//
// Licensed GPLv3 for open source use
// or fancyBox Commercial License for commercial use
//
// http://fancyapps.com/fancybox/
// Copyright 2019 fancyApps
//
// ==================================================
!function (t, e, n, o) {
	"use strict"; function i(t, e) { var o, i, a, s = [], r = 0; t && t.isDefaultPrevented() || (t.preventDefault(), e = e || {}, t && t.data && (e = h(t.data.options, e)), o = e.$target || n(t.currentTarget).trigger("blur"), (a = n.fancybox.getInstance()) && a.$trigger && a.$trigger.is(o) || (e.selector ? s = n(e.selector) : (i = o.attr("data-fancybox") || "", i ? (s = t.data ? t.data.items : [], s = s.length ? s.filter('[data-fancybox="' + i + '"]') : n('[data-fancybox="' + i + '"]')) : s = [o]), r = n(s).index(o), r < 0 && (r = 0), a = n.fancybox.open(s, e, r), a.$trigger = o)) } if (t.console = t.console || { info: function (t) { } }, n) {
		if (n.fn.fancybox) return void console.info("fancyBox already initialized"); var a = { closeExisting: !1, loop: !1, gutter: 50, keyboard: !0, preventCaptionOverlap: !0, arrows: !0, infobar: !0, smallBtn: "auto", toolbar: "auto", buttons: ["zoom", "slideShow", "thumbs", "close"], idleTime: 3, protect: !1, modal: !1, image: { preload: !1 }, ajax: { settings: { data: { fancybox: !0 } } }, iframe: { tpl: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" allowfullscreen="allowfullscreen" allow="autoplay; fullscreen" src=""></iframe>', preload: !0, css: {}, attr: { scrolling: "auto" } }, video: { tpl: '<video class="fancybox-video" controls controlsList="nodownload" poster="{{poster}}"><source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos, <a href="{{src}}">download</a> and watch with your favorite video player!</video>', format: "", autoStart: !0 }, defaultType: "image", animationEffect: "zoom", animationDuration: 366, zoomOpacity: "auto", transitionEffect: "fade", transitionDuration: 366, slideClass: "", baseClass: "", baseTpl: '<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><div class="fancybox-toolbar">{{buttons}}</div><div class="fancybox-navigation">{{arrows}}</div><div class="fancybox-stage"></div><div class="fancybox-caption"><div class="fancybox-caption__body"></div></div></div></div>', spinnerTpl: '<div class="fancybox-loading"></div>', errorTpl: '<div class="fancybox-error"><p>{{ERROR}}</p></div>', btnTpl: { download: '<a download data-fancybox-download class="fancybox-button fancybox-button--download" title="{{DOWNLOAD}}" href="javascript:;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.62 17.09V19H5.38v-1.91zm-2.97-6.96L17 11.45l-5 4.87-5-4.87 1.36-1.32 2.68 2.64V5h1.92v7.77z"/></svg></a>', zoom: '<button data-fancybox-zoom class="fancybox-button fancybox-button--zoom" title="{{ZOOM}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.7 17.3l-3-3a5.9 5.9 0 0 0-.6-7.6 5.9 5.9 0 0 0-8.4 0 5.9 5.9 0 0 0 0 8.4 5.9 5.9 0 0 0 7.7.7l3 3a1 1 0 0 0 1.3 0c.4-.5.4-1 0-1.5zM8.1 13.8a4 4 0 0 1 0-5.7 4 4 0 0 1 5.7 0 4 4 0 0 1 0 5.7 4 4 0 0 1-5.7 0z"/></svg></button>', close: '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"/></svg></button>', arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.28 15.7l-1.34 1.37L5 12l4.94-5.07 1.34 1.38-2.68 2.72H19v1.94H8.6z"/></svg></div></button>', arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 12.97l-2.68 2.72 1.34 1.38L19 12l-4.94-5.07-1.34 1.38 2.68 2.72H5v1.94z"/></svg></div></button>', smallBtn: '<button type="button" data-fancybox-close class="fancybox-button fancybox-close-small" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"/></svg></button>' }, parentEl: "body", hideScrollbar: !0, autoFocus: !0, backFocus: !0, trapFocus: !0, fullScreen: { autoStart: !1 }, touch: { vertical: !0, momentum: !0 }, hash: null, media: {}, slideShow: { autoStart: !1, speed: 3e3 }, thumbs: { autoStart: !1, hideOnClose: !0, parentEl: ".fancybox-container", axis: "y" }, wheel: "auto", onInit: n.noop, beforeLoad: n.noop, afterLoad: n.noop, beforeShow: n.noop, afterShow: n.noop, beforeClose: n.noop, afterClose: n.noop, onActivate: n.noop, onDeactivate: n.noop, clickContent: function (t, e) { return "image" === t.type && "zoom" }, clickSlide: "close", clickOutside: "close", dblclickContent: !1, dblclickSlide: !1, dblclickOutside: !1, mobile: { preventCaptionOverlap: !1, idleTime: !1, clickContent: function (t, e) { return "image" === t.type && "toggleControls" }, clickSlide: function (t, e) { return "image" === t.type ? "toggleControls" : "close" }, dblclickContent: function (t, e) { return "image" === t.type && "zoom" }, dblclickSlide: function (t, e) { return "image" === t.type && "zoom" } }, lang: "en", i18n: { en: { CLOSE: "Close", NEXT: "Next", PREV: "Previous", ERROR: "The requested content cannot be loaded. <br/> Please try again later.", PLAY_START: "Start slideshow", PLAY_STOP: "Pause slideshow", FULL_SCREEN: "Full screen", THUMBS: "Thumbnails", DOWNLOAD: "Download", SHARE: "Share", ZOOM: "Zoom" }, de: { CLOSE: "Schlie&szlig;en", NEXT: "Weiter", PREV: "Zur&uuml;ck", ERROR: "Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es sp&auml;ter nochmal.", PLAY_START: "Diaschau starten", PLAY_STOP: "Diaschau beenden", FULL_SCREEN: "Vollbild", THUMBS: "Vorschaubilder", DOWNLOAD: "Herunterladen", SHARE: "Teilen", ZOOM: "Vergr&ouml;&szlig;ern" } } }, s = n(t), r = n(e), c = 0, l = function (t) { return t && t.hasOwnProperty && t instanceof n }, d = function () { return t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || function (e) { return t.setTimeout(e, 1e3 / 60) } }(), u = function () { return t.cancelAnimationFrame || t.webkitCancelAnimationFrame || t.mozCancelAnimationFrame || t.oCancelAnimationFrame || function (e) { t.clearTimeout(e) } }(), f = function () { var t, n = e.createElement("fakeelement"), o = { transition: "transitionend", OTransition: "oTransitionEnd", MozTransition: "transitionend", WebkitTransition: "webkitTransitionEnd" }; for (t in o) if (void 0 !== n.style[t]) return o[t]; return "transitionend" }(), p = function (t) { return t && t.length && t[0].offsetHeight }, h = function (t, e) { var o = n.extend(!0, {}, t, e); return n.each(e, function (t, e) { n.isArray(e) && (o[t] = e) }), o }, g = function (t) { var o, i; return !(!t || t.ownerDocument !== e) && (n(".fancybox-container").css("pointer-events", "none"), o = { x: t.getBoundingClientRect().left + t.offsetWidth / 2, y: t.getBoundingClientRect().top + t.offsetHeight / 2 }, i = e.elementFromPoint(o.x, o.y) === t, n(".fancybox-container").css("pointer-events", ""), i) }, b = function (t, e, o) { var i = this; i.opts = h({ index: o }, n.fancybox.defaults), n.isPlainObject(e) && (i.opts = h(i.opts, e)), n.fancybox.isMobile && (i.opts = h(i.opts, i.opts.mobile)), i.id = i.opts.id || ++c, i.currIndex = parseInt(i.opts.index, 10) || 0, i.prevIndex = null, i.prevPos = null, i.currPos = 0, i.firstRun = !0, i.group = [], i.slides = {}, i.addContent(t), i.group.length && i.init() }; n.extend(b.prototype, {
			init: function () { var o, i, a = this, s = a.group[a.currIndex], r = s.opts; r.closeExisting && n.fancybox.close(!0), n("body").addClass("fancybox-active"), !n.fancybox.getInstance() && !1 !== r.hideScrollbar && !n.fancybox.isMobile && e.body.scrollHeight > t.innerHeight && (n("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar{margin-right:' + (t.innerWidth - e.documentElement.clientWidth) + "px;}</style>"), n("body").addClass("compensate-for-scrollbar")), i = "", n.each(r.buttons, function (t, e) { i += r.btnTpl[e] || "" }), o = n(a.translate(a, r.baseTpl.replace("{{buttons}}", i).replace("{{arrows}}", r.btnTpl.arrowLeft + r.btnTpl.arrowRight))).attr("id", "fancybox-container-" + a.id).addClass(r.baseClass).data("FancyBox", a).appendTo(r.parentEl), a.$refs = { container: o }, ["bg", "inner", "infobar", "toolbar", "stage", "caption", "navigation"].forEach(function (t) { a.$refs[t] = o.find(".fancybox-" + t) }), a.trigger("onInit"), a.activate(), a.jumpTo(a.currIndex) }, translate: function (t, e) { var n = t.opts.i18n[t.opts.lang] || t.opts.i18n.en; return e.replace(/\{\{(\w+)\}\}/g, function (t, e) { return void 0 === n[e] ? t : n[e] }) }, addContent: function (t) { var e, o = this, i = n.makeArray(t); n.each(i, function (t, e) { var i, a, s, r, c, l = {}, d = {}; n.isPlainObject(e) ? (l = e, d = e.opts || e) : "object" === n.type(e) && n(e).length ? (i = n(e), d = i.data() || {}, d = n.extend(!0, {}, d, d.options), d.$orig = i, l.src = o.opts.src || d.src || i.attr("href"), l.type || l.src || (l.type = "inline", l.src = e)) : l = { type: "html", src: e + "" }, l.opts = n.extend(!0, {}, o.opts, d), n.isArray(d.buttons) && (l.opts.buttons = d.buttons), n.fancybox.isMobile && l.opts.mobile && (l.opts = h(l.opts, l.opts.mobile)), a = l.type || l.opts.type, r = l.src || "", !a && r && ((s = r.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (a = "video", l.opts.video.format || (l.opts.video.format = "video/" + ("ogv" === s[1] ? "ogg" : s[1]))) : r.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? a = "image" : r.match(/\.(pdf)((\?|#).*)?$/i) ? (a = "iframe", l = n.extend(!0, l, { contentType: "pdf", opts: { iframe: { preload: !1 } } })) : "#" === r.charAt(0) && (a = "inline")), a ? l.type = a : o.trigger("objectNeedsType", l), l.contentType || (l.contentType = n.inArray(l.type, ["html", "inline", "ajax"]) > -1 ? "html" : l.type), l.index = o.group.length, "auto" == l.opts.smallBtn && (l.opts.smallBtn = n.inArray(l.type, ["html", "inline", "ajax"]) > -1), "auto" === l.opts.toolbar && (l.opts.toolbar = !l.opts.smallBtn), l.$thumb = l.opts.$thumb || null, l.opts.$trigger && l.index === o.opts.index && (l.$thumb = l.opts.$trigger.find("img:first"), l.$thumb.length && (l.opts.$orig = l.opts.$trigger)), l.$thumb && l.$thumb.length || !l.opts.$orig || (l.$thumb = l.opts.$orig.find("img:first")), l.$thumb && !l.$thumb.length && (l.$thumb = null), l.thumb = l.opts.thumb || (l.$thumb ? l.$thumb[0].src : null), "function" === n.type(l.opts.caption) && (l.opts.caption = l.opts.caption.apply(e, [o, l])), "function" === n.type(o.opts.caption) && (l.opts.caption = o.opts.caption.apply(e, [o, l])), l.opts.caption instanceof n || (l.opts.caption = void 0 === l.opts.caption ? "" : l.opts.caption + ""), "ajax" === l.type && (c = r.split(/\s+/, 2), c.length > 1 && (l.src = c.shift(), l.opts.filter = c.shift())), l.opts.modal && (l.opts = n.extend(!0, l.opts, { trapFocus: !0, infobar: 0, toolbar: 0, smallBtn: 0, keyboard: 0, slideShow: 0, fullScreen: 0, thumbs: 0, touch: 0, clickContent: !1, clickSlide: !1, clickOutside: !1, dblclickContent: !1, dblclickSlide: !1, dblclickOutside: !1 })), o.group.push(l) }), Object.keys(o.slides).length && (o.updateControls(), (e = o.Thumbs) && e.isActive && (e.create(), e.focus())) }, addEvents: function () { var e = this; e.removeEvents(), e.$refs.container.on("click.fb-close", "[data-fancybox-close]", function (t) { t.stopPropagation(), t.preventDefault(), e.close(t) }).on("touchstart.fb-prev click.fb-prev", "[data-fancybox-prev]", function (t) { t.stopPropagation(), t.preventDefault(), e.previous() }).on("touchstart.fb-next click.fb-next", "[data-fancybox-next]", function (t) { t.stopPropagation(), t.preventDefault(), e.next() }).on("click.fb", "[data-fancybox-zoom]", function (t) { e[e.isScaledDown() ? "scaleToActual" : "scaleToFit"]() }), s.on("orientationchange.fb resize.fb", function (t) { t && t.originalEvent && "resize" === t.originalEvent.type ? (e.requestId && u(e.requestId), e.requestId = d(function () { e.update(t) })) : (e.current && "iframe" === e.current.type && e.$refs.stage.hide(), setTimeout(function () { e.$refs.stage.show(), e.update(t) }, n.fancybox.isMobile ? 600 : 250)) }), r.on("keydown.fb", function (t) { var o = n.fancybox ? n.fancybox.getInstance() : null, i = o.current, a = t.keyCode || t.which; if (9 == a) return void (i.opts.trapFocus && e.focus(t)); if (!(!i.opts.keyboard || t.ctrlKey || t.altKey || t.shiftKey || n(t.target).is("input,textarea,video,audio,select"))) return 8 === a || 27 === a ? (t.preventDefault(), void e.close(t)) : 37 === a || 38 === a ? (t.preventDefault(), void e.previous()) : 39 === a || 40 === a ? (t.preventDefault(), void e.next()) : void e.trigger("afterKeydown", t, a) }), e.group[e.currIndex].opts.idleTime && (e.idleSecondsCounter = 0, r.on("mousemove.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle", function (t) { e.idleSecondsCounter = 0, e.isIdle && e.showControls(), e.isIdle = !1 }), e.idleInterval = t.setInterval(function () { ++e.idleSecondsCounter >= e.group[e.currIndex].opts.idleTime && !e.isDragging && (e.isIdle = !0, e.idleSecondsCounter = 0, e.hideControls()) }, 1e3)) }, removeEvents: function () { var e = this; s.off("orientationchange.fb resize.fb"), r.off("keydown.fb .fb-idle"), this.$refs.container.off(".fb-close .fb-prev .fb-next"), e.idleInterval && (t.clearInterval(e.idleInterval), e.idleInterval = null) }, previous: function (t) { return this.jumpTo(this.currPos - 1, t) }, next: function (t) { return this.jumpTo(this.currPos + 1, t) }, jumpTo: function (t, e) { var o, i, a, s, r, c, l, d, u, f = this, h = f.group.length; if (!(f.isDragging || f.isClosing || f.isAnimating && f.firstRun)) { if (t = parseInt(t, 10), !(a = f.current ? f.current.opts.loop : f.opts.loop) && (t < 0 || t >= h)) return !1; if (o = f.firstRun = !Object.keys(f.slides).length, r = f.current, f.prevIndex = f.currIndex, f.prevPos = f.currPos, s = f.createSlide(t), h > 1 && ((a || s.index < h - 1) && f.createSlide(t + 1), (a || s.index > 0) && f.createSlide(t - 1)), f.current = s, f.currIndex = s.index, f.currPos = s.pos, f.trigger("beforeShow", o), f.updateControls(), s.forcedDuration = void 0, n.isNumeric(e) ? s.forcedDuration = e : e = s.opts[o ? "animationDuration" : "transitionDuration"], e = parseInt(e, 10), i = f.isMoved(s), s.$slide.addClass("fancybox-slide--current"), o) return s.opts.animationEffect && e && f.$refs.container.css("transition-duration", e + "ms"), f.$refs.container.addClass("fancybox-is-open").trigger("focus"), f.loadSlide(s), void f.preload("image"); c = n.fancybox.getTranslate(r.$slide), l = n.fancybox.getTranslate(f.$refs.stage), n.each(f.slides, function (t, e) { n.fancybox.stop(e.$slide, !0) }), r.pos !== s.pos && (r.isComplete = !1), r.$slide.removeClass("fancybox-slide--complete fancybox-slide--current"), i ? (u = c.left - (r.pos * c.width + r.pos * r.opts.gutter), n.each(f.slides, function (t, o) { o.$slide.removeClass("fancybox-animated").removeClass(function (t, e) { return (e.match(/(^|\s)fancybox-fx-\S+/g) || []).join(" ") }); var i = o.pos * c.width + o.pos * o.opts.gutter; n.fancybox.setTranslate(o.$slide, { top: 0, left: i - l.left + u }), o.pos !== s.pos && o.$slide.addClass("fancybox-slide--" + (o.pos > s.pos ? "next" : "previous")), p(o.$slide), n.fancybox.animate(o.$slide, { top: 0, left: (o.pos - s.pos) * c.width + (o.pos - s.pos) * o.opts.gutter }, e, function () { o.$slide.css({ transform: "", opacity: "" }).removeClass("fancybox-slide--next fancybox-slide--previous"), o.pos === f.currPos && f.complete() }) })) : e && s.opts.transitionEffect && (d = "fancybox-animated fancybox-fx-" + s.opts.transitionEffect, r.$slide.addClass("fancybox-slide--" + (r.pos > s.pos ? "next" : "previous")), n.fancybox.animate(r.$slide, d, e, function () { r.$slide.removeClass(d).removeClass("fancybox-slide--next fancybox-slide--previous") }, !1)), s.isLoaded ? f.revealContent(s) : f.loadSlide(s), f.preload("image") } }, createSlide: function (t) { var e, o, i = this; return o = t % i.group.length, o = o < 0 ? i.group.length + o : o, !i.slides[t] && i.group[o] && (e = n('<div class="fancybox-slide"></div>').appendTo(i.$refs.stage), i.slides[t] = n.extend(!0, {}, i.group[o], { pos: t, $slide: e, isLoaded: !1 }), i.updateSlide(i.slides[t])), i.slides[t] }, scaleToActual: function (t, e, o) { var i, a, s, r, c, l = this, d = l.current, u = d.$content, f = n.fancybox.getTranslate(d.$slide).width, p = n.fancybox.getTranslate(d.$slide).height, h = d.width, g = d.height; l.isAnimating || l.isMoved() || !u || "image" != d.type || !d.isLoaded || d.hasError || (l.isAnimating = !0, n.fancybox.stop(u), t = void 0 === t ? .5 * f : t, e = void 0 === e ? .5 * p : e, i = n.fancybox.getTranslate(u), i.top -= n.fancybox.getTranslate(d.$slide).top, i.left -= n.fancybox.getTranslate(d.$slide).left, r = h / i.width, c = g / i.height, a = .5 * f - .5 * h, s = .5 * p - .5 * g, h > f && (a = i.left * r - (t * r - t), a > 0 && (a = 0), a < f - h && (a = f - h)), g > p && (s = i.top * c - (e * c - e), s > 0 && (s = 0), s < p - g && (s = p - g)), l.updateCursor(h, g), n.fancybox.animate(u, { top: s, left: a, scaleX: r, scaleY: c }, o || 366, function () { l.isAnimating = !1 }), l.SlideShow && l.SlideShow.isActive && l.SlideShow.stop()) }, scaleToFit: function (t) { var e, o = this, i = o.current, a = i.$content; o.isAnimating || o.isMoved() || !a || "image" != i.type || !i.isLoaded || i.hasError || (o.isAnimating = !0, n.fancybox.stop(a), e = o.getFitPos(i), o.updateCursor(e.width, e.height), n.fancybox.animate(a, { top: e.top, left: e.left, scaleX: e.width / a.width(), scaleY: e.height / a.height() }, t || 366, function () { o.isAnimating = !1 })) }, getFitPos: function (t) { var e, o, i, a, s = this, r = t.$content, c = t.$slide, l = t.width || t.opts.width, d = t.height || t.opts.height, u = {}; return !!(t.isLoaded && r && r.length) && (e = n.fancybox.getTranslate(s.$refs.stage).width, o = n.fancybox.getTranslate(s.$refs.stage).height, e -= parseFloat(c.css("paddingLeft")) + parseFloat(c.css("paddingRight")) + parseFloat(r.css("marginLeft")) + parseFloat(r.css("marginRight")), o -= parseFloat(c.css("paddingTop")) + parseFloat(c.css("paddingBottom")) + parseFloat(r.css("marginTop")) + parseFloat(r.css("marginBottom")), l && d || (l = e, d = o), i = Math.min(1, e / l, o / d), l *= i, d *= i, l > e - .5 && (l = e), d > o - .5 && (d = o), "image" === t.type ? (u.top = Math.floor(.5 * (o - d)) + parseFloat(c.css("paddingTop")), u.left = Math.floor(.5 * (e - l)) + parseFloat(c.css("paddingLeft"))) : "video" === t.contentType && (a = t.opts.width && t.opts.height ? l / d : t.opts.ratio || 16 / 9, d > l / a ? d = l / a : l > d * a && (l = d * a)), u.width = l, u.height = d, u) }, update: function (t) { var e = this; n.each(e.slides, function (n, o) { e.updateSlide(o, t) }) }, updateSlide: function (t, e) { var o = this, i = t && t.$content, a = t.width || t.opts.width, s = t.height || t.opts.height, r = t.$slide; o.adjustCaption(t), i && (a || s || "video" === t.contentType) && !t.hasError && (n.fancybox.stop(i), n.fancybox.setTranslate(i, o.getFitPos(t)), t.pos === o.currPos && (o.isAnimating = !1, o.updateCursor())), o.adjustLayout(t), r.length && (r.trigger("refresh"), t.pos === o.currPos && o.$refs.toolbar.add(o.$refs.navigation.find(".fancybox-button--arrow_right")).toggleClass("compensate-for-scrollbar", r.get(0).scrollHeight > r.get(0).clientHeight)), o.trigger("onUpdate", t, e) }, centerSlide: function (t) { var e = this, o = e.current, i = o.$slide; !e.isClosing && o && (i.siblings().css({ transform: "", opacity: "" }), i.parent().children().removeClass("fancybox-slide--previous fancybox-slide--next"), n.fancybox.animate(i, { top: 0, left: 0, opacity: 1 }, void 0 === t ? 0 : t, function () { i.css({ transform: "", opacity: "" }), o.isComplete || e.complete() }, !1)) }, isMoved: function (t) { var e, o, i = t || this.current; return !!i && (o = n.fancybox.getTranslate(this.$refs.stage), e = n.fancybox.getTranslate(i.$slide), !i.$slide.hasClass("fancybox-animated") && (Math.abs(e.top - o.top) > .5 || Math.abs(e.left - o.left) > .5)) }, updateCursor: function (t, e) { var o, i, a = this, s = a.current, r = a.$refs.container; s && !a.isClosing && a.Guestures && (r.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-zoomOut fancybox-can-swipe fancybox-can-pan"), o = a.canPan(t, e), i = !!o || a.isZoomable(), r.toggleClass("fancybox-is-zoomable", i), n("[data-fancybox-zoom]").prop("disabled", !i), o ? r.addClass("fancybox-can-pan") : i && ("zoom" === s.opts.clickContent || n.isFunction(s.opts.clickContent) && "zoom" == s.opts.clickContent(s)) ? r.addClass("fancybox-can-zoomIn") : s.opts.touch && (s.opts.touch.vertical || a.group.length > 1) && "video" !== s.contentType && r.addClass("fancybox-can-swipe")) }, isZoomable: function () { var t, e = this, n = e.current; if (n && !e.isClosing && "image" === n.type && !n.hasError) { if (!n.isLoaded) return !0; if ((t = e.getFitPos(n)) && (n.width > t.width || n.height > t.height)) return !0 } return !1 }, isScaledDown: function (t, e) { var o = this, i = !1, a = o.current, s = a.$content; return void 0 !== t && void 0 !== e ? i = t < a.width && e < a.height : s && (i = n.fancybox.getTranslate(s), i = i.width < a.width && i.height < a.height), i }, canPan: function (t, e) { var o = this, i = o.current, a = null, s = !1; return "image" === i.type && (i.isComplete || t && e) && !i.hasError && (s = o.getFitPos(i), void 0 !== t && void 0 !== e ? a = { width: t, height: e } : i.isComplete && (a = n.fancybox.getTranslate(i.$content)), a && s && (s = Math.abs(a.width - s.width) > 1.5 || Math.abs(a.height - s.height) > 1.5)), s }, loadSlide: function (t) { var e, o, i, a = this; if (!t.isLoading && !t.isLoaded) { if (t.isLoading = !0, !1 === a.trigger("beforeLoad", t)) return t.isLoading = !1, !1; switch (e = t.type, o = t.$slide, o.off("refresh").trigger("onReset").addClass(t.opts.slideClass), e) { case "image": a.setImage(t); break; case "iframe": a.setIframe(t); break; case "html": a.setContent(t, t.src || t.content); break; case "video": a.setContent(t, t.opts.video.tpl.replace(/\{\{src\}\}/gi, t.src).replace("{{format}}", t.opts.videoFormat || t.opts.video.format || "").replace("{{poster}}", t.thumb || "")); break; case "inline": n(t.src).length ? a.setContent(t, n(t.src)) : a.setError(t); break; case "ajax": a.showLoading(t), i = n.ajax(n.extend({}, t.opts.ajax.settings, { url: t.src, success: function (e, n) { "success" === n && a.setContent(t, e) }, error: function (e, n) { e && "abort" !== n && a.setError(t) } })), o.one("onReset", function () { i.abort() }); break; default: a.setError(t) }return !0 } }, setImage: function (t) { var o, i = this; setTimeout(function () { var e = t.$image; i.isClosing || !t.isLoading || e && e.length && e[0].complete || t.hasError || i.showLoading(t) }, 50), i.checkSrcset(t), t.$content = n('<div class="fancybox-content"></div>').addClass("fancybox-is-hidden").appendTo(t.$slide.addClass("fancybox-slide--image")), !1 !== t.opts.preload && t.opts.width && t.opts.height && t.thumb && (t.width = t.opts.width, t.height = t.opts.height, o = e.createElement("img"), o.onerror = function () { n(this).remove(), t.$ghost = null }, o.onload = function () { i.afterLoad(t) }, t.$ghost = n(o).addClass("fancybox-image").appendTo(t.$content).attr("src", t.thumb)), i.setBigImage(t) }, checkSrcset: function (e) { var n, o, i, a, s = e.opts.srcset || e.opts.image.srcset; if (s) { i = t.devicePixelRatio || 1, a = t.innerWidth * i, o = s.split(",").map(function (t) { var e = {}; return t.trim().split(/\s+/).forEach(function (t, n) { var o = parseInt(t.substring(0, t.length - 1), 10); if (0 === n) return e.url = t; o && (e.value = o, e.postfix = t[t.length - 1]) }), e }), o.sort(function (t, e) { return t.value - e.value }); for (var r = 0; r < o.length; r++) { var c = o[r]; if ("w" === c.postfix && c.value >= a || "x" === c.postfix && c.value >= i) { n = c; break } } !n && o.length && (n = o[o.length - 1]), n && (e.src = n.url, e.width && e.height && "w" == n.postfix && (e.height = e.width / e.height * n.value, e.width = n.value), e.opts.srcset = s) } }, setBigImage: function (t) { var o = this, i = e.createElement("img"), a = n(i); t.$image = a.one("error", function () { o.setError(t) }).one("load", function () { var e; t.$ghost || (o.resolveImageSlideSize(t, this.naturalWidth, this.naturalHeight), o.afterLoad(t)), o.isClosing || (t.opts.srcset && (e = t.opts.sizes, e && "auto" !== e || (e = (t.width / t.height > 1 && s.width() / s.height() > 1 ? "100" : Math.round(t.width / t.height * 100)) + "vw"), a.attr("sizes", e).attr("srcset", t.opts.srcset)), t.$ghost && setTimeout(function () { t.$ghost && !o.isClosing && t.$ghost.hide() }, Math.min(300, Math.max(1e3, t.height / 1600))), o.hideLoading(t)) }).addClass("fancybox-image").attr("src", t.src).appendTo(t.$content), (i.complete || "complete" == i.readyState) && a.naturalWidth && a.naturalHeight ? a.trigger("load") : i.error && a.trigger("error") }, resolveImageSlideSize: function (t, e, n) { var o = parseInt(t.opts.width, 10), i = parseInt(t.opts.height, 10); t.width = e, t.height = n, o > 0 && (t.width = o, t.height = Math.floor(o * n / e)), i > 0 && (t.width = Math.floor(i * e / n), t.height = i) }, setIframe: function (t) { var e, o = this, i = t.opts.iframe, a = t.$slide; t.$content = n('<div class="fancybox-content' + (i.preload ? " fancybox-is-hidden" : "") + '"></div>').css(i.css).appendTo(a), a.addClass("fancybox-slide--" + t.contentType), t.$iframe = e = n(i.tpl.replace(/\{rnd\}/g, (new Date).getTime())).attr(i.attr).appendTo(t.$content), i.preload ? (o.showLoading(t), e.on("load.fb error.fb", function (e) { this.isReady = 1, t.$slide.trigger("refresh"), o.afterLoad(t) }), a.on("refresh.fb", function () { var n, o, s = t.$content, r = i.css.width, c = i.css.height; if (1 === e[0].isReady) { try { n = e.contents(), o = n.find("body") } catch (t) { } o && o.length && o.children().length && (a.css("overflow", "visible"), s.css({ width: "100%", "max-width": "100%", height: "9999px" }), void 0 === r && (r = Math.ceil(Math.max(o[0].clientWidth, o.outerWidth(!0)))), s.css("width", r || "").css("max-width", ""), void 0 === c && (c = Math.ceil(Math.max(o[0].clientHeight, o.outerHeight(!0)))), s.css("height", c || ""), a.css("overflow", "auto")), s.removeClass("fancybox-is-hidden") } })) : o.afterLoad(t), e.attr("src", t.src), a.one("onReset", function () { try { n(this).find("iframe").hide().unbind().attr("src", "//about:blank") } catch (t) { } n(this).off("refresh.fb").empty(), t.isLoaded = !1, t.isRevealed = !1 }) }, setContent: function (t, e) { var o = this; o.isClosing || (o.hideLoading(t), t.$content && n.fancybox.stop(t.$content), t.$slide.empty(), l(e) && e.parent().length ? ((e.hasClass("fancybox-content") || e.parent().hasClass("fancybox-content")) && e.parents(".fancybox-slide").trigger("onReset"), t.$placeholder = n("<div>").hide().insertAfter(e), e.css("display", "inline-block")) : t.hasError || ("string" === n.type(e) && (e = n("<div>").append(n.trim(e)).contents()), t.opts.filter && (e = n("<div>").html(e).find(t.opts.filter))), t.$slide.one("onReset", function () { n(this).find("video,audio").trigger("pause"), t.$placeholder && (t.$placeholder.after(e.removeClass("fancybox-content").hide()).remove(), t.$placeholder = null), t.$smallBtn && (t.$smallBtn.remove(), t.$smallBtn = null), t.hasError || (n(this).empty(), t.isLoaded = !1, t.isRevealed = !1) }), n(e).appendTo(t.$slide), n(e).is("video,audio") && (n(e).addClass("fancybox-video"), n(e).wrap("<div></div>"), t.contentType = "video", t.opts.width = t.opts.width || n(e).attr("width"), t.opts.height = t.opts.height || n(e).attr("height")), t.$content = t.$slide.children().filter("div,form,main,video,audio,article,.fancybox-content").first(), t.$content.siblings().hide(), t.$content.length || (t.$content = t.$slide.wrapInner("<div></div>").children().first()), t.$content.addClass("fancybox-content"), t.$slide.addClass("fancybox-slide--" + t.contentType), o.afterLoad(t)) }, setError: function (t) { t.hasError = !0, t.$slide.trigger("onReset").removeClass("fancybox-slide--" + t.contentType).addClass("fancybox-slide--error"), t.contentType = "html", this.setContent(t, this.translate(t, t.opts.errorTpl)), t.pos === this.currPos && (this.isAnimating = !1) }, showLoading: function (t) { var e = this; (t = t || e.current) && !t.$spinner && (t.$spinner = n(e.translate(e, e.opts.spinnerTpl)).appendTo(t.$slide).hide().fadeIn("fast")) }, hideLoading: function (t) { var e = this; (t = t || e.current) && t.$spinner && (t.$spinner.stop().remove(), delete t.$spinner) }, afterLoad: function (t) { var e = this; e.isClosing || (t.isLoading = !1, t.isLoaded = !0, e.trigger("afterLoad", t), e.hideLoading(t), !t.opts.smallBtn || t.$smallBtn && t.$smallBtn.length || (t.$smallBtn = n(e.translate(t, t.opts.btnTpl.smallBtn)).appendTo(t.$content)), t.opts.protect && t.$content && !t.hasError && (t.$content.on("contextmenu.fb", function (t) { return 2 == t.button && t.preventDefault(), !0 }), "image" === t.type && n('<div class="fancybox-spaceball"></div>').appendTo(t.$content)), e.adjustCaption(t), e.adjustLayout(t), t.pos === e.currPos && e.updateCursor(), e.revealContent(t)) }, adjustCaption: function (t) { var e, n = this, o = t || n.current, i = o.opts.caption, a = o.opts.preventCaptionOverlap, s = n.$refs.caption, r = !1; s.toggleClass("fancybox-caption--separate", a), a && i && i.length && (o.pos !== n.currPos ? (e = s.clone().appendTo(s.parent()), e.children().eq(0).empty().html(i), r = e.outerHeight(!0), e.empty().remove()) : n.$caption && (r = n.$caption.outerHeight(!0)), o.$slide.css("padding-bottom", r || "")) }, adjustLayout: function (t) { var e, n, o, i, a = this, s = t || a.current; s.isLoaded && !0 !== s.opts.disableLayoutFix && (s.$content.css("margin-bottom", ""), s.$content.outerHeight() > s.$slide.height() + .5 && (o = s.$slide[0].style["padding-bottom"], i = s.$slide.css("padding-bottom"), parseFloat(i) > 0 && (e = s.$slide[0].scrollHeight, s.$slide.css("padding-bottom", 0), Math.abs(e - s.$slide[0].scrollHeight) < 1 && (n = i), s.$slide.css("padding-bottom", o))), s.$content.css("margin-bottom", n)) }, revealContent: function (t) { var e, o, i, a, s = this, r = t.$slide, c = !1, l = !1, d = s.isMoved(t), u = t.isRevealed; return t.isRevealed = !0, e = t.opts[s.firstRun ? "animationEffect" : "transitionEffect"], i = t.opts[s.firstRun ? "animationDuration" : "transitionDuration"], i = parseInt(void 0 === t.forcedDuration ? i : t.forcedDuration, 10), !d && t.pos === s.currPos && i || (e = !1), "zoom" === e && (t.pos === s.currPos && i && "image" === t.type && !t.hasError && (l = s.getThumbPos(t)) ? c = s.getFitPos(t) : e = "fade"), "zoom" === e ? (s.isAnimating = !0, c.scaleX = c.width / l.width, c.scaleY = c.height / l.height, a = t.opts.zoomOpacity, "auto" == a && (a = Math.abs(t.width / t.height - l.width / l.height) > .1), a && (l.opacity = .1, c.opacity = 1), n.fancybox.setTranslate(t.$content.removeClass("fancybox-is-hidden"), l), p(t.$content), void n.fancybox.animate(t.$content, c, i, function () { s.isAnimating = !1, s.complete() })) : (s.updateSlide(t), e ? (n.fancybox.stop(r), o = "fancybox-slide--" + (t.pos >= s.prevPos ? "next" : "previous") + " fancybox-animated fancybox-fx-" + e, r.addClass(o).removeClass("fancybox-slide--current"), t.$content.removeClass("fancybox-is-hidden"), p(r), "image" !== t.type && t.$content.hide().show(0), void n.fancybox.animate(r, "fancybox-slide--current", i, function () { r.removeClass(o).css({ transform: "", opacity: "" }), t.pos === s.currPos && s.complete() }, !0)) : (t.$content.removeClass("fancybox-is-hidden"), u || !d || "image" !== t.type || t.hasError || t.$content.hide().fadeIn("fast"), void (t.pos === s.currPos && s.complete()))) }, getThumbPos: function (t) { var e, o, i, a, s, r = !1, c = t.$thumb; return !(!c || !g(c[0])) && (e = n.fancybox.getTranslate(c), o = parseFloat(c.css("border-top-width") || 0), i = parseFloat(c.css("border-right-width") || 0), a = parseFloat(c.css("border-bottom-width") || 0), s = parseFloat(c.css("border-left-width") || 0), r = { top: e.top + o, left: e.left + s, width: e.width - i - s, height: e.height - o - a, scaleX: 1, scaleY: 1 }, e.width > 0 && e.height > 0 && r) }, complete: function () { var t, e = this, o = e.current, i = {}; !e.isMoved() && o.isLoaded && (o.isComplete || (o.isComplete = !0, o.$slide.siblings().trigger("onReset"), e.preload("inline"), p(o.$slide), o.$slide.addClass("fancybox-slide--complete"), n.each(e.slides, function (t, o) { o.pos >= e.currPos - 1 && o.pos <= e.currPos + 1 ? i[o.pos] = o : o && (n.fancybox.stop(o.$slide), o.$slide.off().remove()) }), e.slides = i), e.isAnimating = !1, e.updateCursor(), e.trigger("afterShow"), o.opts.video.autoStart && o.$slide.find("video,audio").filter(":visible:first").trigger("play").one("ended", function () { Document.exitFullscreen ? Document.exitFullscreen() : this.webkitExitFullscreen && this.webkitExitFullscreen(), e.next() }), o.opts.autoFocus && "html" === o.contentType && (t = o.$content.find("input[autofocus]:enabled:visible:first"), t.length ? t.trigger("focus") : e.focus(null, !0)), o.$slide.scrollTop(0).scrollLeft(0)) }, preload: function (t) { var e, n, o = this; o.group.length < 2 || (n = o.slides[o.currPos + 1], e = o.slides[o.currPos - 1], e && e.type === t && o.loadSlide(e), n && n.type === t && o.loadSlide(n)) }, focus: function (t, o) { var i, a, s = this, r = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden])", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"])'].join(","); s.isClosing || (i = !t && s.current && s.current.isComplete ? s.current.$slide.find("*:visible" + (o ? ":not(.fancybox-close-small)" : "")) : s.$refs.container.find("*:visible"), i = i.filter(r).filter(function () { return "hidden" !== n(this).css("visibility") && !n(this).hasClass("disabled") }), i.length ? (a = i.index(e.activeElement), t && t.shiftKey ? (a < 0 || 0 == a) && (t.preventDefault(), i.eq(i.length - 1).trigger("focus")) : (a < 0 || a == i.length - 1) && (t && t.preventDefault(), i.eq(0).trigger("focus"))) : s.$refs.container.trigger("focus")) }, activate: function () { var t = this; n(".fancybox-container").each(function () { var e = n(this).data("FancyBox"); e && e.id !== t.id && !e.isClosing && (e.trigger("onDeactivate"), e.removeEvents(), e.isVisible = !1) }), t.isVisible = !0, (t.current || t.isIdle) && (t.update(), t.updateControls()), t.trigger("onActivate"), t.addEvents() }, close: function (t, e) {
				var o, i, a, s, r, c, l, u = this, f = u.current, h = function () { u.cleanUp(t) }; return !u.isClosing && (u.isClosing = !0, !1 === u.trigger("beforeClose", t) ? (u.isClosing = !1, d(function () { u.update() }), !1) : (u.removeEvents(), a = f.$content, o = f.opts.animationEffect, i = n.isNumeric(e) ? e : o ? f.opts.animationDuration : 0, f.$slide.removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"), !0 !== t ? n.fancybox.stop(f.$slide) : o = !1, f.$slide.siblings().trigger("onReset").remove(), i && u.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing").css("transition-duration", i + "ms"), u.hideLoading(f), u.hideControls(!0), u.updateCursor(), "zoom" !== o || a && i && "image" === f.type && !u.isMoved() && !f.hasError && (l = u.getThumbPos(f)) || (o = "fade"), "zoom" === o ? (n.fancybox.stop(a), s = n.fancybox.getTranslate(a), c = { top: s.top, left: s.left, scaleX: s.width / l.width, scaleY: s.height / l.height, width: l.width, height: l.height }, r = f.opts.zoomOpacity,
					"auto" == r && (r = Math.abs(f.width / f.height - l.width / l.height) > .1), r && (l.opacity = 0), n.fancybox.setTranslate(a, c), p(a), n.fancybox.animate(a, l, i, h), !0) : (o && i ? n.fancybox.animate(f.$slide.addClass("fancybox-slide--previous").removeClass("fancybox-slide--current"), "fancybox-animated fancybox-fx-" + o, i, h) : !0 === t ? setTimeout(h, i) : h(), !0)))
			}, cleanUp: function (e) { var o, i, a, s = this, r = s.current.opts.$orig; s.current.$slide.trigger("onReset"), s.$refs.container.empty().remove(), s.trigger("afterClose", e), s.current.opts.backFocus && (r && r.length && r.is(":visible") || (r = s.$trigger), r && r.length && (i = t.scrollX, a = t.scrollY, r.trigger("focus"), n("html, body").scrollTop(a).scrollLeft(i))), s.current = null, o = n.fancybox.getInstance(), o ? o.activate() : (n("body").removeClass("fancybox-active compensate-for-scrollbar"), n("#fancybox-style-noscroll").remove()) }, trigger: function (t, e) { var o, i = Array.prototype.slice.call(arguments, 1), a = this, s = e && e.opts ? e : a.current; if (s ? i.unshift(s) : s = a, i.unshift(a), n.isFunction(s.opts[t]) && (o = s.opts[t].apply(s, i)), !1 === o) return o; "afterClose" !== t && a.$refs ? a.$refs.container.trigger(t + ".fb", i) : r.trigger(t + ".fb", i) }, updateControls: function () { var t = this, o = t.current, i = o.index, a = t.$refs.container, s = t.$refs.caption, r = o.opts.caption; o.$slide.trigger("refresh"), r && r.length ? (t.$caption = s, s.children().eq(0).html(r)) : t.$caption = null, t.hasHiddenControls || t.isIdle || t.showControls(), a.find("[data-fancybox-count]").html(t.group.length), a.find("[data-fancybox-index]").html(i + 1), a.find("[data-fancybox-prev]").prop("disabled", !o.opts.loop && i <= 0), a.find("[data-fancybox-next]").prop("disabled", !o.opts.loop && i >= t.group.length - 1), "image" === o.type ? a.find("[data-fancybox-zoom]").show().end().find("[data-fancybox-download]").attr("href", o.opts.image.src || o.src).show() : o.opts.toolbar && a.find("[data-fancybox-download],[data-fancybox-zoom]").hide(), n(e.activeElement).is(":hidden,[disabled]") && t.$refs.container.trigger("focus") }, hideControls: function (t) { var e = this, n = ["infobar", "toolbar", "nav"]; !t && e.current.opts.preventCaptionOverlap || n.push("caption"), this.$refs.container.removeClass(n.map(function (t) { return "fancybox-show-" + t }).join(" ")), this.hasHiddenControls = !0 }, showControls: function () { var t = this, e = t.current ? t.current.opts : t.opts, n = t.$refs.container; t.hasHiddenControls = !1, t.idleSecondsCounter = 0, n.toggleClass("fancybox-show-toolbar", !(!e.toolbar || !e.buttons)).toggleClass("fancybox-show-infobar", !!(e.infobar && t.group.length > 1)).toggleClass("fancybox-show-caption", !!t.$caption).toggleClass("fancybox-show-nav", !!(e.arrows && t.group.length > 1)).toggleClass("fancybox-is-modal", !!e.modal) }, toggleControls: function () { this.hasHiddenControls ? this.showControls() : this.hideControls() }
		}), n.fancybox = { version: "3.5.7", defaults: a, getInstance: function (t) { var e = n('.fancybox-container:not(".fancybox-is-closing"):last').data("FancyBox"), o = Array.prototype.slice.call(arguments, 1); return e instanceof b && ("string" === n.type(t) ? e[t].apply(e, o) : "function" === n.type(t) && t.apply(e, o), e) }, open: function (t, e, n) { return new b(t, e, n) }, close: function (t) { var e = this.getInstance(); e && (e.close(), !0 === t && this.close(t)) }, destroy: function () { this.close(!0), r.add("body").off("click.fb-start", "**") }, isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), use3d: function () { var n = e.createElement("div"); return t.getComputedStyle && t.getComputedStyle(n) && t.getComputedStyle(n).getPropertyValue("transform") && !(e.documentMode && e.documentMode < 11) }(), getTranslate: function (t) { var e; return !(!t || !t.length) && (e = t[0].getBoundingClientRect(), { top: e.top || 0, left: e.left || 0, width: e.width, height: e.height, opacity: parseFloat(t.css("opacity")) }) }, setTranslate: function (t, e) { var n = "", o = {}; if (t && e) return void 0 === e.left && void 0 === e.top || (n = (void 0 === e.left ? t.position().left : e.left) + "px, " + (void 0 === e.top ? t.position().top : e.top) + "px", n = this.use3d ? "translate3d(" + n + ", 0px)" : "translate(" + n + ")"), void 0 !== e.scaleX && void 0 !== e.scaleY ? n += " scale(" + e.scaleX + ", " + e.scaleY + ")" : void 0 !== e.scaleX && (n += " scaleX(" + e.scaleX + ")"), n.length && (o.transform = n), void 0 !== e.opacity && (o.opacity = e.opacity), void 0 !== e.width && (o.width = e.width), void 0 !== e.height && (o.height = e.height), t.css(o) }, animate: function (t, e, o, i, a) { var s, r = this; n.isFunction(o) && (i = o, o = null), r.stop(t), s = r.getTranslate(t), t.on(f, function (c) { (!c || !c.originalEvent || t.is(c.originalEvent.target) && "z-index" != c.originalEvent.propertyName) && (r.stop(t), n.isNumeric(o) && t.css("transition-duration", ""), n.isPlainObject(e) ? void 0 !== e.scaleX && void 0 !== e.scaleY && r.setTranslate(t, { top: e.top, left: e.left, width: s.width * e.scaleX, height: s.height * e.scaleY, scaleX: 1, scaleY: 1 }) : !0 !== a && t.removeClass(e), n.isFunction(i) && i(c)) }), n.isNumeric(o) && t.css("transition-duration", o + "ms"), n.isPlainObject(e) ? (void 0 !== e.scaleX && void 0 !== e.scaleY && (delete e.width, delete e.height, t.parent().hasClass("fancybox-slide--image") && t.parent().addClass("fancybox-is-scaling")), n.fancybox.setTranslate(t, e)) : t.addClass(e), t.data("timer", setTimeout(function () { t.trigger(f) }, o + 33)) }, stop: function (t, e) { t && t.length && (clearTimeout(t.data("timer")), e && t.trigger(f), t.off(f).css("transition-duration", ""), t.parent().removeClass("fancybox-is-scaling")) } }, n.fn.fancybox = function (t) { var e; return t = t || {}, e = t.selector || !1, e ? n("body").off("click.fb-start", e).on("click.fb-start", e, { options: t }, i) : this.off("click.fb-start").on("click.fb-start", { items: this, options: t }, i), this }, r.on("click.fb-start", "[data-fancybox]", i), r.on("click.fb-start", "[data-fancybox-trigger]", function (t) { n('[data-fancybox="' + n(this).attr("data-fancybox-trigger") + '"]').eq(n(this).attr("data-fancybox-index") || 0).trigger("click.fb-start", { $trigger: n(this) }) }), function () { var t = null; r.on("mousedown mouseup focus blur", ".fancybox-button", function (e) { switch (e.type) { case "mousedown": t = n(this); break; case "mouseup": t = null; break; case "focusin": n(".fancybox-button").removeClass("fancybox-focus"), n(this).is(t) || n(this).is("[disabled]") || n(this).addClass("fancybox-focus"); break; case "focusout": n(".fancybox-button").removeClass("fancybox-focus") } }) }()
	}
}(window, document, jQuery), function (t) { "use strict"; var e = { youtube: { matcher: /(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i, params: { autoplay: 1, autohide: 1, fs: 1, rel: 0, hd: 1, wmode: "transparent", enablejsapi: 1, html5: 1 }, paramPlace: 8, type: "iframe", url: "https://www.youtube-nocookie.com/embed/$4", thumb: "https://img.youtube.com/vi/$4/hqdefault.jpg" }, vimeo: { matcher: /^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/, params: { autoplay: 1, hd: 1, show_title: 1, show_byline: 1, show_portrait: 0, fullscreen: 1 }, paramPlace: 3, type: "iframe", url: "//player.vimeo.com/video/$2" }, instagram: { matcher: /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i, type: "image", url: "//$1/p/$2/media/?size=l" }, gmap_place: { matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i, type: "iframe", url: function (t) { return "//maps.google." + t[2] + "/?ll=" + (t[9] ? t[9] + "&z=" + Math.floor(t[10]) + (t[12] ? t[12].replace(/^\//, "&") : "") : t[12] + "").replace(/\?/, "&") + "&output=" + (t[12] && t[12].indexOf("layer=c") > 0 ? "svembed" : "embed") } }, gmap_search: { matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(maps\/search\/)(.*)/i, type: "iframe", url: function (t) { return "//maps.google." + t[2] + "/maps?q=" + t[5].replace("query=", "q=").replace("api=1", "") + "&output=embed" } } }, n = function (e, n, o) { if (e) return o = o || "", "object" === t.type(o) && (o = t.param(o, !0)), t.each(n, function (t, n) { e = e.replace("$" + t, n || "") }), o.length && (e += (e.indexOf("?") > 0 ? "&" : "?") + o), e }; t(document).on("objectNeedsType.fb", function (o, i, a) { var s, r, c, l, d, u, f, p = a.src || "", h = !1; s = t.extend(!0, {}, e, a.opts.media), t.each(s, function (e, o) { if (c = p.match(o.matcher)) { if (h = o.type, f = e, u = {}, o.paramPlace && c[o.paramPlace]) { d = c[o.paramPlace], "?" == d[0] && (d = d.substring(1)), d = d.split("&"); for (var i = 0; i < d.length; ++i) { var s = d[i].split("=", 2); 2 == s.length && (u[s[0]] = decodeURIComponent(s[1].replace(/\+/g, " "))) } } return l = t.extend(!0, {}, o.params, a.opts[e], u), p = "function" === t.type(o.url) ? o.url.call(this, c, l, a) : n(o.url, c, l), r = "function" === t.type(o.thumb) ? o.thumb.call(this, c, l, a) : n(o.thumb, c), "youtube" === e ? p = p.replace(/&t=((\d+)m)?(\d+)s/, function (t, e, n, o) { return "&start=" + ((n ? 60 * parseInt(n, 10) : 0) + parseInt(o, 10)) }) : "vimeo" === e && (p = p.replace("&%23", "#")), !1 } }), h ? (a.opts.thumb || a.opts.$thumb && a.opts.$thumb.length || (a.opts.thumb = r), "iframe" === h && (a.opts = t.extend(!0, a.opts, { iframe: { preload: !1, attr: { scrolling: "no" } } })), t.extend(a, { type: h, src: p, origSrc: a.src, contentSource: f, contentType: "image" === h ? "image" : "gmap_place" == f || "gmap_search" == f ? "map" : "video" })) : p && (a.type = a.opts.defaultType) }); var o = { youtube: { src: "https://www.youtube.com/iframe_api", class: "YT", loading: !1, loaded: !1 }, vimeo: { src: "https://player.vimeo.com/api/player.js", class: "Vimeo", loading: !1, loaded: !1 }, load: function (t) { var e, n = this; if (this[t].loaded) return void setTimeout(function () { n.done(t) }); this[t].loading || (this[t].loading = !0, e = document.createElement("script"), e.type = "text/javascript", e.src = this[t].src, "youtube" === t ? window.onYouTubeIframeAPIReady = function () { n[t].loaded = !0, n.done(t) } : e.onload = function () { n[t].loaded = !0, n.done(t) }, document.body.appendChild(e)) }, done: function (e) { var n, o, i; "youtube" === e && delete window.onYouTubeIframeAPIReady, (n = t.fancybox.getInstance()) && (o = n.current.$content.find("iframe"), "youtube" === e && void 0 !== YT && YT ? i = new YT.Player(o.attr("id"), { events: { onStateChange: function (t) { 0 == t.data && n.next() } } }) : "vimeo" === e && void 0 !== Vimeo && Vimeo && (i = new Vimeo.Player(o), i.on("ended", function () { n.next() }))) } }; t(document).on({ "afterShow.fb": function (t, e, n) { e.group.length > 1 && ("youtube" === n.contentSource || "vimeo" === n.contentSource) && o.load(n.contentSource) } }) }(jQuery), function (t, e, n) { "use strict"; var o = function () { return t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || function (e) { return t.setTimeout(e, 1e3 / 60) } }(), i = function () { return t.cancelAnimationFrame || t.webkitCancelAnimationFrame || t.mozCancelAnimationFrame || t.oCancelAnimationFrame || function (e) { t.clearTimeout(e) } }(), a = function (e) { var n = []; e = e.originalEvent || e || t.e, e = e.touches && e.touches.length ? e.touches : e.changedTouches && e.changedTouches.length ? e.changedTouches : [e]; for (var o in e) e[o].pageX ? n.push({ x: e[o].pageX, y: e[o].pageY }) : e[o].clientX && n.push({ x: e[o].clientX, y: e[o].clientY }); return n }, s = function (t, e, n) { return e && t ? "x" === n ? t.x - e.x : "y" === n ? t.y - e.y : Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)) : 0 }, r = function (t) { if (t.is('a,area,button,[role="button"],input,label,select,summary,textarea,video,audio,iframe') || n.isFunction(t.get(0).onclick) || t.data("selectable")) return !0; for (var e = 0, o = t[0].attributes, i = o.length; e < i; e++)if ("data-fancybox-" === o[e].nodeName.substr(0, 14)) return !0; return !1 }, c = function (e) { var n = t.getComputedStyle(e)["overflow-y"], o = t.getComputedStyle(e)["overflow-x"], i = ("scroll" === n || "auto" === n) && e.scrollHeight > e.clientHeight, a = ("scroll" === o || "auto" === o) && e.scrollWidth > e.clientWidth; return i || a }, l = function (t) { for (var e = !1; ;) { if (e = c(t.get(0))) break; if (t = t.parent(), !t.length || t.hasClass("fancybox-stage") || t.is("body")) break } return e }, d = function (t) { var e = this; e.instance = t, e.$bg = t.$refs.bg, e.$stage = t.$refs.stage, e.$container = t.$refs.container, e.destroy(), e.$container.on("touchstart.fb.touch mousedown.fb.touch", n.proxy(e, "ontouchstart")) }; d.prototype.destroy = function () { var t = this; t.$container.off(".fb.touch"), n(e).off(".fb.touch"), t.requestId && (i(t.requestId), t.requestId = null), t.tapped && (clearTimeout(t.tapped), t.tapped = null) }, d.prototype.ontouchstart = function (o) { var i = this, c = n(o.target), d = i.instance, u = d.current, f = u.$slide, p = u.$content, h = "touchstart" == o.type; if (h && i.$container.off("mousedown.fb.touch"), (!o.originalEvent || 2 != o.originalEvent.button) && f.length && c.length && !r(c) && !r(c.parent()) && (c.is("img") || !(o.originalEvent.clientX > c[0].clientWidth + c.offset().left))) { if (!u || d.isAnimating || u.$slide.hasClass("fancybox-animated")) return o.stopPropagation(), void o.preventDefault(); i.realPoints = i.startPoints = a(o), i.startPoints.length && (u.touch && o.stopPropagation(), i.startEvent = o, i.canTap = !0, i.$target = c, i.$content = p, i.opts = u.opts.touch, i.isPanning = !1, i.isSwiping = !1, i.isZooming = !1, i.isScrolling = !1, i.canPan = d.canPan(), i.startTime = (new Date).getTime(), i.distanceX = i.distanceY = i.distance = 0, i.canvasWidth = Math.round(f[0].clientWidth), i.canvasHeight = Math.round(f[0].clientHeight), i.contentLastPos = null, i.contentStartPos = n.fancybox.getTranslate(i.$content) || { top: 0, left: 0 }, i.sliderStartPos = n.fancybox.getTranslate(f), i.stagePos = n.fancybox.getTranslate(d.$refs.stage), i.sliderStartPos.top -= i.stagePos.top, i.sliderStartPos.left -= i.stagePos.left, i.contentStartPos.top -= i.stagePos.top, i.contentStartPos.left -= i.stagePos.left, n(e).off(".fb.touch").on(h ? "touchend.fb.touch touchcancel.fb.touch" : "mouseup.fb.touch mouseleave.fb.touch", n.proxy(i, "ontouchend")).on(h ? "touchmove.fb.touch" : "mousemove.fb.touch", n.proxy(i, "ontouchmove")), n.fancybox.isMobile && e.addEventListener("scroll", i.onscroll, !0), ((i.opts || i.canPan) && (c.is(i.$stage) || i.$stage.find(c).length) || (c.is(".fancybox-image") && o.preventDefault(), n.fancybox.isMobile && c.parents(".fancybox-caption").length)) && (i.isScrollable = l(c) || l(c.parent()), n.fancybox.isMobile && i.isScrollable || o.preventDefault(), (1 === i.startPoints.length || u.hasError) && (i.canPan ? (n.fancybox.stop(i.$content), i.isPanning = !0) : i.isSwiping = !0, i.$container.addClass("fancybox-is-grabbing")), 2 === i.startPoints.length && "image" === u.type && (u.isLoaded || u.$ghost) && (i.canTap = !1, i.isSwiping = !1, i.isPanning = !1, i.isZooming = !0, n.fancybox.stop(i.$content), i.centerPointStartX = .5 * (i.startPoints[0].x + i.startPoints[1].x) - n(t).scrollLeft(), i.centerPointStartY = .5 * (i.startPoints[0].y + i.startPoints[1].y) - n(t).scrollTop(), i.percentageOfImageAtPinchPointX = (i.centerPointStartX - i.contentStartPos.left) / i.contentStartPos.width, i.percentageOfImageAtPinchPointY = (i.centerPointStartY - i.contentStartPos.top) / i.contentStartPos.height, i.startDistanceBetweenFingers = s(i.startPoints[0], i.startPoints[1])))) } }, d.prototype.onscroll = function (t) { var n = this; n.isScrolling = !0, e.removeEventListener("scroll", n.onscroll, !0) }, d.prototype.ontouchmove = function (t) { var e = this; return void 0 !== t.originalEvent.buttons && 0 === t.originalEvent.buttons ? void e.ontouchend(t) : e.isScrolling ? void (e.canTap = !1) : (e.newPoints = a(t), void ((e.opts || e.canPan) && e.newPoints.length && e.newPoints.length && (e.isSwiping && !0 === e.isSwiping || t.preventDefault(), e.distanceX = s(e.newPoints[0], e.startPoints[0], "x"), e.distanceY = s(e.newPoints[0], e.startPoints[0], "y"), e.distance = s(e.newPoints[0], e.startPoints[0]), e.distance > 0 && (e.isSwiping ? e.onSwipe(t) : e.isPanning ? e.onPan() : e.isZooming && e.onZoom())))) }, d.prototype.onSwipe = function (e) { var a, s = this, r = s.instance, c = s.isSwiping, l = s.sliderStartPos.left || 0; if (!0 !== c) "x" == c && (s.distanceX > 0 && (s.instance.group.length < 2 || 0 === s.instance.current.index && !s.instance.current.opts.loop) ? l += Math.pow(s.distanceX, .8) : s.distanceX < 0 && (s.instance.group.length < 2 || s.instance.current.index === s.instance.group.length - 1 && !s.instance.current.opts.loop) ? l -= Math.pow(-s.distanceX, .8) : l += s.distanceX), s.sliderLastPos = { top: "x" == c ? 0 : s.sliderStartPos.top + s.distanceY, left: l }, s.requestId && (i(s.requestId), s.requestId = null), s.requestId = o(function () { s.sliderLastPos && (n.each(s.instance.slides, function (t, e) { var o = e.pos - s.instance.currPos; n.fancybox.setTranslate(e.$slide, { top: s.sliderLastPos.top, left: s.sliderLastPos.left + o * s.canvasWidth + o * e.opts.gutter }) }), s.$container.addClass("fancybox-is-sliding")) }); else if (Math.abs(s.distance) > 10) { if (s.canTap = !1, r.group.length < 2 && s.opts.vertical ? s.isSwiping = "y" : r.isDragging || !1 === s.opts.vertical || "auto" === s.opts.vertical && n(t).width() > 800 ? s.isSwiping = "x" : (a = Math.abs(180 * Math.atan2(s.distanceY, s.distanceX) / Math.PI), s.isSwiping = a > 45 && a < 135 ? "y" : "x"), "y" === s.isSwiping && n.fancybox.isMobile && s.isScrollable) return void (s.isScrolling = !0); r.isDragging = s.isSwiping, s.startPoints = s.newPoints, n.each(r.slides, function (t, e) { var o, i; n.fancybox.stop(e.$slide), o = n.fancybox.getTranslate(e.$slide), i = n.fancybox.getTranslate(r.$refs.stage), e.$slide.css({ transform: "", opacity: "", "transition-duration": "" }).removeClass("fancybox-animated").removeClass(function (t, e) { return (e.match(/(^|\s)fancybox-fx-\S+/g) || []).join(" ") }), e.pos === r.current.pos && (s.sliderStartPos.top = o.top - i.top, s.sliderStartPos.left = o.left - i.left), n.fancybox.setTranslate(e.$slide, { top: o.top - i.top, left: o.left - i.left }) }), r.SlideShow && r.SlideShow.isActive && r.SlideShow.stop() } }, d.prototype.onPan = function () { var t = this; if (s(t.newPoints[0], t.realPoints[0]) < (n.fancybox.isMobile ? 10 : 5)) return void (t.startPoints = t.newPoints); t.canTap = !1, t.contentLastPos = t.limitMovement(), t.requestId && i(t.requestId), t.requestId = o(function () { n.fancybox.setTranslate(t.$content, t.contentLastPos) }) }, d.prototype.limitMovement = function () { var t, e, n, o, i, a, s = this, r = s.canvasWidth, c = s.canvasHeight, l = s.distanceX, d = s.distanceY, u = s.contentStartPos, f = u.left, p = u.top, h = u.width, g = u.height; return i = h > r ? f + l : f, a = p + d, t = Math.max(0, .5 * r - .5 * h), e = Math.max(0, .5 * c - .5 * g), n = Math.min(r - h, .5 * r - .5 * h), o = Math.min(c - g, .5 * c - .5 * g), l > 0 && i > t && (i = t - 1 + Math.pow(-t + f + l, .8) || 0), l < 0 && i < n && (i = n + 1 - Math.pow(n - f - l, .8) || 0), d > 0 && a > e && (a = e - 1 + Math.pow(-e + p + d, .8) || 0), d < 0 && a < o && (a = o + 1 - Math.pow(o - p - d, .8) || 0), { top: a, left: i } }, d.prototype.limitPosition = function (t, e, n, o) { var i = this, a = i.canvasWidth, s = i.canvasHeight; return n > a ? (t = t > 0 ? 0 : t, t = t < a - n ? a - n : t) : t = Math.max(0, a / 2 - n / 2), o > s ? (e = e > 0 ? 0 : e, e = e < s - o ? s - o : e) : e = Math.max(0, s / 2 - o / 2), { top: e, left: t } }, d.prototype.onZoom = function () { var e = this, a = e.contentStartPos, r = a.width, c = a.height, l = a.left, d = a.top, u = s(e.newPoints[0], e.newPoints[1]), f = u / e.startDistanceBetweenFingers, p = Math.floor(r * f), h = Math.floor(c * f), g = (r - p) * e.percentageOfImageAtPinchPointX, b = (c - h) * e.percentageOfImageAtPinchPointY, m = (e.newPoints[0].x + e.newPoints[1].x) / 2 - n(t).scrollLeft(), v = (e.newPoints[0].y + e.newPoints[1].y) / 2 - n(t).scrollTop(), y = m - e.centerPointStartX, x = v - e.centerPointStartY, w = l + (g + y), $ = d + (b + x), S = { top: $, left: w, scaleX: f, scaleY: f }; e.canTap = !1, e.newWidth = p, e.newHeight = h, e.contentLastPos = S, e.requestId && i(e.requestId), e.requestId = o(function () { n.fancybox.setTranslate(e.$content, e.contentLastPos) }) }, d.prototype.ontouchend = function (t) { var o = this, s = o.isSwiping, r = o.isPanning, c = o.isZooming, l = o.isScrolling; if (o.endPoints = a(t), o.dMs = Math.max((new Date).getTime() - o.startTime, 1), o.$container.removeClass("fancybox-is-grabbing"), n(e).off(".fb.touch"), e.removeEventListener("scroll", o.onscroll, !0), o.requestId && (i(o.requestId), o.requestId = null), o.isSwiping = !1, o.isPanning = !1, o.isZooming = !1, o.isScrolling = !1, o.instance.isDragging = !1, o.canTap) return o.onTap(t); o.speed = 100, o.velocityX = o.distanceX / o.dMs * .5, o.velocityY = o.distanceY / o.dMs * .5, r ? o.endPanning() : c ? o.endZooming() : o.endSwiping(s, l) }, d.prototype.endSwiping = function (t, e) { var o = this, i = !1, a = o.instance.group.length, s = Math.abs(o.distanceX), r = "x" == t && a > 1 && (o.dMs > 130 && s > 10 || s > 50); o.sliderLastPos = null, "y" == t && !e && Math.abs(o.distanceY) > 50 ? (n.fancybox.animate(o.instance.current.$slide, { top: o.sliderStartPos.top + o.distanceY + 150 * o.velocityY, opacity: 0 }, 200), i = o.instance.close(!0, 250)) : r && o.distanceX > 0 ? i = o.instance.previous(300) : r && o.distanceX < 0 && (i = o.instance.next(300)), !1 !== i || "x" != t && "y" != t || o.instance.centerSlide(200), o.$container.removeClass("fancybox-is-sliding") }, d.prototype.endPanning = function () { var t, e, o, i = this; i.contentLastPos && (!1 === i.opts.momentum || i.dMs > 350 ? (t = i.contentLastPos.left, e = i.contentLastPos.top) : (t = i.contentLastPos.left + 500 * i.velocityX, e = i.contentLastPos.top + 500 * i.velocityY), o = i.limitPosition(t, e, i.contentStartPos.width, i.contentStartPos.height), o.width = i.contentStartPos.width, o.height = i.contentStartPos.height, n.fancybox.animate(i.$content, o, 366)) }, d.prototype.endZooming = function () { var t, e, o, i, a = this, s = a.instance.current, r = a.newWidth, c = a.newHeight; a.contentLastPos && (t = a.contentLastPos.left, e = a.contentLastPos.top, i = { top: e, left: t, width: r, height: c, scaleX: 1, scaleY: 1 }, n.fancybox.setTranslate(a.$content, i), r < a.canvasWidth && c < a.canvasHeight ? a.instance.scaleToFit(150) : r > s.width || c > s.height ? a.instance.scaleToActual(a.centerPointStartX, a.centerPointStartY, 150) : (o = a.limitPosition(t, e, r, c), n.fancybox.animate(a.$content, o, 150))) }, d.prototype.onTap = function (e) { var o, i = this, s = n(e.target), r = i.instance, c = r.current, l = e && a(e) || i.startPoints, d = l[0] ? l[0].x - n(t).scrollLeft() - i.stagePos.left : 0, u = l[0] ? l[0].y - n(t).scrollTop() - i.stagePos.top : 0, f = function (t) { var o = c.opts[t]; if (n.isFunction(o) && (o = o.apply(r, [c, e])), o) switch (o) { case "close": r.close(i.startEvent); break; case "toggleControls": r.toggleControls(); break; case "next": r.next(); break; case "nextOrClose": r.group.length > 1 ? r.next() : r.close(i.startEvent); break; case "zoom": "image" == c.type && (c.isLoaded || c.$ghost) && (r.canPan() ? r.scaleToFit() : r.isScaledDown() ? r.scaleToActual(d, u) : r.group.length < 2 && r.close(i.startEvent)) } }; if ((!e.originalEvent || 2 != e.originalEvent.button) && (s.is("img") || !(d > s[0].clientWidth + s.offset().left))) { if (s.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container")) o = "Outside"; else if (s.is(".fancybox-slide")) o = "Slide"; else { if (!r.current.$content || !r.current.$content.find(s).addBack().filter(s).length) return; o = "Content" } if (i.tapped) { if (clearTimeout(i.tapped), i.tapped = null, Math.abs(d - i.tapX) > 50 || Math.abs(u - i.tapY) > 50) return this; f("dblclick" + o) } else i.tapX = d, i.tapY = u, c.opts["dblclick" + o] && c.opts["dblclick" + o] !== c.opts["click" + o] ? i.tapped = setTimeout(function () { i.tapped = null, r.isAnimating || f("click" + o) }, 500) : f("click" + o); return this } }, n(e).on("onActivate.fb", function (t, e) { e && !e.Guestures && (e.Guestures = new d(e)) }).on("beforeClose.fb", function (t, e) { e && e.Guestures && e.Guestures.destroy() }) }(window, document, jQuery), function (t, e) { "use strict"; e.extend(!0, e.fancybox.defaults, { btnTpl: { slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.5 5.4v13.2l11-6.6z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.33 5.75h2.2v12.5h-2.2V5.75zm5.15 0h2.2v12.5h-2.2V5.75z"/></svg></button>' }, slideShow: { autoStart: !1, speed: 3e3, progress: !0 } }); var n = function (t) { this.instance = t, this.init() }; e.extend(n.prototype, { timer: null, isActive: !1, $button: null, init: function () { var t = this, n = t.instance, o = n.group[n.currIndex].opts.slideShow; t.$button = n.$refs.toolbar.find("[data-fancybox-play]").on("click", function () { t.toggle() }), n.group.length < 2 || !o ? t.$button.hide() : o.progress && (t.$progress = e('<div class="fancybox-progress"></div>').appendTo(n.$refs.inner)) }, set: function (t) { var n = this, o = n.instance, i = o.current; i && (!0 === t || i.opts.loop || o.currIndex < o.group.length - 1) ? n.isActive && "video" !== i.contentType && (n.$progress && e.fancybox.animate(n.$progress.show(), { scaleX: 1 }, i.opts.slideShow.speed), n.timer = setTimeout(function () { o.current.opts.loop || o.current.index != o.group.length - 1 ? o.next() : o.jumpTo(0) }, i.opts.slideShow.speed)) : (n.stop(), o.idleSecondsCounter = 0, o.showControls()) }, clear: function () { var t = this; clearTimeout(t.timer), t.timer = null, t.$progress && t.$progress.removeAttr("style").hide() }, start: function () { var t = this, e = t.instance.current; e && (t.$button.attr("title", (e.opts.i18n[e.opts.lang] || e.opts.i18n.en).PLAY_STOP).removeClass("fancybox-button--play").addClass("fancybox-button--pause"), t.isActive = !0, e.isComplete && t.set(!0), t.instance.trigger("onSlideShowChange", !0)) }, stop: function () { var t = this, e = t.instance.current; t.clear(), t.$button.attr("title", (e.opts.i18n[e.opts.lang] || e.opts.i18n.en).PLAY_START).removeClass("fancybox-button--pause").addClass("fancybox-button--play"), t.isActive = !1, t.instance.trigger("onSlideShowChange", !1), t.$progress && t.$progress.removeAttr("style").hide() }, toggle: function () { var t = this; t.isActive ? t.stop() : t.start() } }), e(t).on({ "onInit.fb": function (t, e) { e && !e.SlideShow && (e.SlideShow = new n(e)) }, "beforeShow.fb": function (t, e, n, o) { var i = e && e.SlideShow; o ? i && n.opts.slideShow.autoStart && i.start() : i && i.isActive && i.clear() }, "afterShow.fb": function (t, e, n) { var o = e && e.SlideShow; o && o.isActive && o.set() }, "afterKeydown.fb": function (n, o, i, a, s) { var r = o && o.SlideShow; !r || !i.opts.slideShow || 80 !== s && 32 !== s || e(t.activeElement).is("button,a,input") || (a.preventDefault(), r.toggle()) }, "beforeClose.fb onDeactivate.fb": function (t, e) { var n = e && e.SlideShow; n && n.stop() } }), e(t).on("visibilitychange", function () { var n = e.fancybox.getInstance(), o = n && n.SlideShow; o && o.isActive && (t.hidden ? o.clear() : o.set()) }) }(document, jQuery), function (t, e) { "use strict"; var n = function () { for (var e = [["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"], ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"], ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"], ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"], ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]], n = {}, o = 0; o < e.length; o++) { var i = e[o]; if (i && i[1] in t) { for (var a = 0; a < i.length; a++)n[e[0][a]] = i[a]; return n } } return !1 }(); if (n) { var o = { request: function (e) { e = e || t.documentElement, e[n.requestFullscreen](e.ALLOW_KEYBOARD_INPUT) }, exit: function () { t[n.exitFullscreen]() }, toggle: function (e) { e = e || t.documentElement, this.isFullscreen() ? this.exit() : this.request(e) }, isFullscreen: function () { return Boolean(t[n.fullscreenElement]) }, enabled: function () { return Boolean(t[n.fullscreenEnabled]) } }; e.extend(!0, e.fancybox.defaults, { btnTpl: { fullScreen: '<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fsenter" title="{{FULL_SCREEN}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/></svg></button>' }, fullScreen: { autoStart: !1 } }), e(t).on(n.fullscreenchange, function () { var t = o.isFullscreen(), n = e.fancybox.getInstance(); n && (n.current && "image" === n.current.type && n.isAnimating && (n.isAnimating = !1, n.update(!0, !0, 0), n.isComplete || n.complete()), n.trigger("onFullscreenChange", t), n.$refs.container.toggleClass("fancybox-is-fullscreen", t), n.$refs.toolbar.find("[data-fancybox-fullscreen]").toggleClass("fancybox-button--fsenter", !t).toggleClass("fancybox-button--fsexit", t)) }) } e(t).on({ "onInit.fb": function (t, e) { var i; if (!n) return void e.$refs.toolbar.find("[data-fancybox-fullscreen]").remove(); e && e.group[e.currIndex].opts.fullScreen ? (i = e.$refs.container, i.on("click.fb-fullscreen", "[data-fancybox-fullscreen]", function (t) { t.stopPropagation(), t.preventDefault(), o.toggle() }), e.opts.fullScreen && !0 === e.opts.fullScreen.autoStart && o.request(), e.FullScreen = o) : e && e.$refs.toolbar.find("[data-fancybox-fullscreen]").hide() }, "afterKeydown.fb": function (t, e, n, o, i) { e && e.FullScreen && 70 === i && (o.preventDefault(), e.FullScreen.toggle()) }, "beforeClose.fb": function (t, e) { e && e.FullScreen && e.$refs.container.hasClass("fancybox-is-fullscreen") && o.exit() } }) }(document, jQuery), function (t, e) { "use strict"; var n = "fancybox-thumbs"; e.fancybox.defaults = e.extend(!0, { btnTpl: { thumbs: '<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.59 14.59h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76H5.65V5.65z"/></svg></button>' }, thumbs: { autoStart: !1, hideOnClose: !0, parentEl: ".fancybox-container", axis: "y" } }, e.fancybox.defaults); var o = function (t) { this.init(t) }; e.extend(o.prototype, { $button: null, $grid: null, $list: null, isVisible: !1, isActive: !1, init: function (t) { var e = this, n = t.group, o = 0; e.instance = t, e.opts = n[t.currIndex].opts.thumbs, t.Thumbs = e, e.$button = t.$refs.toolbar.find("[data-fancybox-thumbs]"); for (var i = 0, a = n.length; i < a && (n[i].thumb && o++ , !(o > 1)); i++); o > 1 && e.opts ? (e.$button.removeAttr("style").on("click", function () { e.toggle() }), e.isActive = !0) : e.$button.hide() }, create: function () { var t, o = this, i = o.instance, a = o.opts.parentEl, s = []; o.$grid || (o.$grid = e('<div class="' + n + " " + n + "-" + o.opts.axis + '"></div>').appendTo(i.$refs.container.find(a).addBack().filter(a)), o.$grid.on("click", "a", function () { i.jumpTo(e(this).attr("data-index")) })), o.$list || (o.$list = e('<div class="' + n + '__list">').appendTo(o.$grid)), e.each(i.group, function (e, n) { t = n.thumb, t || "image" !== n.type || (t = n.src), s.push('<a href="javascript:;" tabindex="0" data-index="' + e + '"' + (t && t.length ? ' style="background-image:url(' + t + ')"' : 'class="fancybox-thumbs-missing"') + "></a>") }), o.$list[0].innerHTML = s.join(""), "x" === o.opts.axis && o.$list.width(parseInt(o.$grid.css("padding-right"), 10) + i.group.length * o.$list.children().eq(0).outerWidth(!0)) }, focus: function (t) { var e, n, o = this, i = o.$list, a = o.$grid; o.instance.current && (e = i.children().removeClass("fancybox-thumbs-active").filter('[data-index="' + o.instance.current.index + '"]').addClass("fancybox-thumbs-active"), n = e.position(), "y" === o.opts.axis && (n.top < 0 || n.top > i.height() - e.outerHeight()) ? i.stop().animate({ scrollTop: i.scrollTop() + n.top }, t) : "x" === o.opts.axis && (n.left < a.scrollLeft() || n.left > a.scrollLeft() + (a.width() - e.outerWidth())) && i.parent().stop().animate({ scrollLeft: n.left }, t)) }, update: function () { var t = this; t.instance.$refs.container.toggleClass("fancybox-show-thumbs", this.isVisible), t.isVisible ? (t.$grid || t.create(), t.instance.trigger("onThumbsShow"), t.focus(0)) : t.$grid && t.instance.trigger("onThumbsHide"), t.instance.update() }, hide: function () { this.isVisible = !1, this.update() }, show: function () { this.isVisible = !0, this.update() }, toggle: function () { this.isVisible = !this.isVisible, this.update() } }), e(t).on({ "onInit.fb": function (t, e) { var n; e && !e.Thumbs && (n = new o(e), n.isActive && !0 === n.opts.autoStart && n.show()) }, "beforeShow.fb": function (t, e, n, o) { var i = e && e.Thumbs; i && i.isVisible && i.focus(o ? 0 : 250) }, "afterKeydown.fb": function (t, e, n, o, i) { var a = e && e.Thumbs; a && a.isActive && 71 === i && (o.preventDefault(), a.toggle()) }, "beforeClose.fb": function (t, e) { var n = e && e.Thumbs; n && n.isVisible && !1 !== n.opts.hideOnClose && n.$grid.hide() } }) }(document, jQuery), function (t, e) {
	"use strict"; function n(t) { var e = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;" }; return String(t).replace(/[&<>"'`=\/]/g, function (t) { return e[t] }) } e.extend(!0, e.fancybox.defaults, {
		btnTpl: { share: '<button data-fancybox-share class="fancybox-button fancybox-button--share" title="{{SHARE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.55 19c1.4-8.4 9.1-9.8 11.9-9.8V5l7 7-7 6.3v-3.5c-2.8 0-10.5 2.1-11.9 4.2z"/></svg></button>' }, share: {
			url: function (t, e) { return !t.currentHash && "inline" !== e.type && "html" !== e.type && (e.origSrc || e.src) || window.location },
			tpl: '<div class="fancybox-share"><h1>{{SHARE}}</h1><p><a class="fancybox-share__button fancybox-share__button--fb" href="https://www.facebook.com/sharer/sharer.php?u={{url}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m287 456v-299c0-21 6-35 35-35h38v-63c-7-1-29-3-55-3-54 0-91 33-91 94v306m143-254h-205v72h196" /></svg><span>Facebook</span></a><a class="fancybox-share__button fancybox-share__button--tw" href="https://twitter.com/intent/tweet?url={{url}}&text={{descr}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m456 133c-14 7-31 11-47 13 17-10 30-27 37-46-15 10-34 16-52 20-61-62-157-7-141 75-68-3-129-35-169-85-22 37-11 86 26 109-13 0-26-4-37-9 0 39 28 72 65 80-12 3-25 4-37 2 10 33 41 57 77 57-42 30-77 38-122 34 170 111 378-32 359-208 16-11 30-25 41-42z" /></svg><span>Twitter</span></a><a class="fancybox-share__button fancybox-share__button--pt" href="https://www.pinterest.com/pin/create/button/?url={{url}}&description={{descr}}&media={{media}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m265 56c-109 0-164 78-164 144 0 39 15 74 47 87 5 2 10 0 12-5l4-19c2-6 1-8-3-13-9-11-15-25-15-45 0-58 43-110 113-110 62 0 96 38 96 88 0 67-30 122-73 122-24 0-42-19-36-44 6-29 20-60 20-81 0-19-10-35-31-35-25 0-44 26-44 60 0 21 7 36 7 36l-30 125c-8 37-1 83 0 87 0 3 4 4 5 2 2-3 32-39 42-75l16-64c8 16 31 29 56 29 74 0 124-67 124-157 0-69-58-132-146-132z" fill="#fff"/></svg><span>Pinterest</span></a></p><p><input class="fancybox-share__input" type="text" value="{{url_raw}}" onclick="select()" /></p></div>'
		}
	}), e(t).on("click", "[data-fancybox-share]", function () { var t, o, i = e.fancybox.getInstance(), a = i.current || null; a && ("function" === e.type(a.opts.share.url) && (t = a.opts.share.url.apply(a, [i, a])), o = a.opts.share.tpl.replace(/\{\{media\}\}/g, "image" === a.type ? encodeURIComponent(a.src) : "").replace(/\{\{url\}\}/g, encodeURIComponent(t)).replace(/\{\{url_raw\}\}/g, n(t)).replace(/\{\{descr\}\}/g, i.$caption ? encodeURIComponent(i.$caption.text()) : ""), e.fancybox.open({ src: i.translate(i, o), type: "html", opts: { touch: !1, animationEffect: !1, afterLoad: function (t, e) { i.$refs.container.one("beforeClose.fb", function () { t.close(null, 0) }), e.$content.find(".fancybox-share__button").click(function () { return window.open(this.href, "Share", "width=550, height=450"), !1 }) }, mobile: { autoFocus: !1 } } })) })
}(document, jQuery), function (t, e, n) { "use strict"; function o() { var e = t.location.hash.substr(1), n = e.split("-"), o = n.length > 1 && /^\+?\d+$/.test(n[n.length - 1]) ? parseInt(n.pop(-1), 10) || 1 : 1, i = n.join("-"); return { hash: e, index: o < 1 ? 1 : o, gallery: i } } function i(t) { "" !== t.gallery && n("[data-fancybox='" + n.escapeSelector(t.gallery) + "']").eq(t.index - 1).focus().trigger("click.fb-start") } function a(t) { var e, n; return !!t && (e = t.current ? t.current.opts : t.opts, "" !== (n = e.hash || (e.$orig ? e.$orig.data("fancybox") || e.$orig.data("fancybox-trigger") : "")) && n) } n.escapeSelector || (n.escapeSelector = function (t) { return (t + "").replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, function (t, e) { return e ? "\0" === t ? "�" : t.slice(0, -1) + "\\" + t.charCodeAt(t.length - 1).toString(16) + " " : "\\" + t }) }), n(function () { !1 !== n.fancybox.defaults.hash && (n(e).on({ "onInit.fb": function (t, e) { var n, i; !1 !== e.group[e.currIndex].opts.hash && (n = o(), (i = a(e)) && n.gallery && i == n.gallery && (e.currIndex = n.index - 1)) }, "beforeShow.fb": function (n, o, i, s) { var r; i && !1 !== i.opts.hash && (r = a(o)) && (o.currentHash = r + (o.group.length > 1 ? "-" + (i.index + 1) : ""), t.location.hash !== "#" + o.currentHash && (s && !o.origHash && (o.origHash = t.location.hash), o.hashTimer && clearTimeout(o.hashTimer), o.hashTimer = setTimeout(function () { "replaceState" in t.history ? (t.history[s ? "pushState" : "replaceState"]({}, e.title, t.location.pathname + t.location.search + "#" + o.currentHash), s && (o.hasCreatedHistory = !0)) : t.location.hash = o.currentHash, o.hashTimer = null }, 300))) }, "beforeClose.fb": function (n, o, i) { i && !1 !== i.opts.hash && (clearTimeout(o.hashTimer), o.currentHash && o.hasCreatedHistory ? t.history.back() : o.currentHash && ("replaceState" in t.history ? t.history.replaceState({}, e.title, t.location.pathname + t.location.search + (o.origHash || "")) : t.location.hash = o.origHash), o.currentHash = null) } }), n(t).on("hashchange.fb", function () { var t = o(), e = null; n.each(n(".fancybox-container").get().reverse(), function (t, o) { var i = n(o).data("FancyBox"); if (i && i.currentHash) return e = i, !1 }), e ? e.currentHash === t.gallery + "-" + t.index || 1 === t.index && e.currentHash == t.gallery || (e.currentHash = null, e.close()) : "" !== t.gallery && i(t) }), setTimeout(function () { n.fancybox.getInstance() || i(o()) }, 50)) }) }(window, document, jQuery), function (t, e) { "use strict"; var n = (new Date).getTime(); e(t).on({ "onInit.fb": function (t, e, o) { e.$refs.stage.on("mousewheel DOMMouseScroll wheel MozMousePixelScroll", function (t) { var o = e.current, i = (new Date).getTime(); e.group.length < 2 || !1 === o.opts.wheel || "auto" === o.opts.wheel && "image" !== o.type || (t.preventDefault(), t.stopPropagation(), o.$slide.hasClass("fancybox-animated") || (t = t.originalEvent || t, i - n < 250 || (n = i, e[(-t.deltaY || -t.deltaX || t.wheelDelta || -t.detail) < 0 ? "next" : "previous"]()))) }) } }) }(document, jQuery);
