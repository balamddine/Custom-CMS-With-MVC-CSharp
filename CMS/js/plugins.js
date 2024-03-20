/* jquery.nicescroll v3.7.6 InuYaksa - MIT - https://nicescroll.areaaperta.com */
!function (e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery) }(function (e) { "use strict"; var o = !1, t = !1, r = 0, i = 2e3, s = 0, n = e, l = document, a = window, c = n(a), d = [], u = a.requestAnimationFrame || a.webkitRequestAnimationFrame || a.mozRequestAnimationFrame || !1, h = a.cancelAnimationFrame || a.webkitCancelAnimationFrame || a.mozCancelAnimationFrame || !1; if (u) a.cancelAnimationFrame || (h = function (e) { }); else { var p = 0; u = function (e, o) { var t = (new Date).getTime(), r = Math.max(0, 16 - (t - p)), i = a.setTimeout(function () { e(t + r) }, r); return p = t + r, i }, h = function (e) { a.clearTimeout(e) } } var m = a.MutationObserver || a.WebKitMutationObserver || !1, f = Date.now || function () { return (new Date).getTime() }, g = { zindex: "auto", cursoropacitymin: 0, cursoropacitymax: 1, cursorcolor: "#424242", cursorwidth: "6px", cursorborder: "1px solid #fff", cursorborderradius: "5px", scrollspeed: 40, mousescrollstep: 27, touchbehavior: !1, emulatetouch: !1, hwacceleration: !0, usetransition: !0, boxzoom: !1, dblclickzoom: !0, gesturezoom: !0, grabcursorenabled: !0, autohidemode: !0, background: "", iframeautoresize: !0, cursorminheight: 32, preservenativescrolling: !0, railoffset: !1, railhoffset: !1, bouncescroll: !0, spacebarenabled: !0, railpadding: { top: 0, right: 0, left: 0, bottom: 0 }, disableoutline: !0, horizrailenabled: !0, railalign: "right", railvalign: "bottom", enabletranslate3d: !0, enablemousewheel: !0, enablekeyboard: !0, smoothscroll: !0, sensitiverail: !0, enablemouselockapi: !0, cursorfixedheight: !1, directionlockdeadzone: 6, hidecursordelay: 400, nativeparentscrolling: !0, enablescrollonselection: !0, overflowx: !0, overflowy: !0, cursordragspeed: .3, rtlmode: "auto", cursordragontouch: !1, oneaxismousemode: "auto", scriptpath: function () { var e = l.currentScript || function () { var e = l.getElementsByTagName("script"); return !!e.length && e[e.length - 1] }(), o = e ? e.src.split("?")[0] : ""; return o.split("/").length > 0 ? o.split("/").slice(0, -1).join("/") + "/" : "" }(), preventmultitouchscrolling: !0, disablemutationobserver: !1, enableobserver: !0, scrollbarid: !1 }, v = !1, w = function () { if (v) return v; var e = l.createElement("DIV"), o = e.style, t = navigator.userAgent, r = navigator.platform, i = {}; return i.haspointerlock = "pointerLockElement" in l || "webkitPointerLockElement" in l || "mozPointerLockElement" in l, i.isopera = "opera" in a, i.isopera12 = i.isopera && "getUserMedia" in navigator, i.isoperamini = "[object OperaMini]" === Object.prototype.toString.call(a.operamini), i.isie = "all" in l && "attachEvent" in e && !i.isopera, i.isieold = i.isie && !("msInterpolationMode" in o), i.isie7 = i.isie && !i.isieold && (!("documentMode" in l) || 7 === l.documentMode), i.isie8 = i.isie && "documentMode" in l && 8 === l.documentMode, i.isie9 = i.isie && "performance" in a && 9 === l.documentMode, i.isie10 = i.isie && "performance" in a && 10 === l.documentMode, i.isie11 = "msRequestFullscreen" in e && l.documentMode >= 11, i.ismsedge = "msCredentials" in a, i.ismozilla = "MozAppearance" in o, i.iswebkit = !i.ismsedge && "WebkitAppearance" in o, i.ischrome = i.iswebkit && "chrome" in a, i.ischrome38 = i.ischrome && "touchAction" in o, i.ischrome22 = !i.ischrome38 && i.ischrome && i.haspointerlock, i.ischrome26 = !i.ischrome38 && i.ischrome && "transition" in o, i.cantouch = "ontouchstart" in l.documentElement || "ontouchstart" in a, i.hasw3ctouch = (a.PointerEvent || !1) && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0), i.hasmstouch = !i.hasw3ctouch && (a.MSPointerEvent || !1), i.ismac = /^mac$/i.test(r), i.isios = i.cantouch && /iphone|ipad|ipod/i.test(r), i.isios4 = i.isios && !("seal" in Object), i.isios7 = i.isios && "webkitHidden" in l, i.isios8 = i.isios && "hidden" in l, i.isios10 = i.isios && a.Proxy, i.isandroid = /android/i.test(t), i.haseventlistener = "addEventListener" in e, i.trstyle = !1, i.hastransform = !1, i.hastranslate3d = !1, i.transitionstyle = !1, i.hastransition = !1, i.transitionend = !1, i.trstyle = "transform", i.hastransform = "transform" in o || function () { for (var e = ["msTransform", "webkitTransform", "MozTransform", "OTransform"], t = 0, r = e.length; t < r; t++)if (void 0 !== o[e[t]]) { i.trstyle = e[t]; break } i.hastransform = !!i.trstyle }(), i.hastransform && (o[i.trstyle] = "translate3d(1px,2px,3px)", i.hastranslate3d = /translate3d/.test(o[i.trstyle])), i.transitionstyle = "transition", i.prefixstyle = "", i.transitionend = "transitionend", i.hastransition = "transition" in o || function () { i.transitionend = !1; for (var e = ["webkitTransition", "msTransition", "MozTransition", "OTransition", "OTransition", "KhtmlTransition"], t = ["-webkit-", "-ms-", "-moz-", "-o-", "-o", "-khtml-"], r = ["webkitTransitionEnd", "msTransitionEnd", "transitionend", "otransitionend", "oTransitionEnd", "KhtmlTransitionEnd"], s = 0, n = e.length; s < n; s++)if (e[s] in o) { i.transitionstyle = e[s], i.prefixstyle = t[s], i.transitionend = r[s]; break } i.ischrome26 && (i.prefixstyle = t[1]), i.hastransition = i.transitionstyle }(), i.cursorgrabvalue = function () { var e = ["grab", "-webkit-grab", "-moz-grab"]; (i.ischrome && !i.ischrome38 || i.isie) && (e = []); for (var t = 0, r = e.length; t < r; t++) { var s = e[t]; if (o.cursor = s, o.cursor == s) return s } return "url(https://cdnjs.cloudflare.com/ajax/libs/slider-pro/1.3.0/css/images/openhand.cur),n-resize" }(), i.hasmousecapture = "setCapture" in e, i.hasMutationObserver = !1 !== m, e = null, v = i, i }, b = function (e, p) { function v() { var e = T.doc.css(P.trstyle); return !(!e || "matrix" != e.substr(0, 6)) && e.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, "").split(/, +/) } function b() { var e = T.win; if ("zIndex" in e) return e.zIndex(); for (; e.length > 0;) { if (9 == e[0].nodeType) return !1; var o = e.css("zIndex"); if (!isNaN(o) && 0 !== o) return parseInt(o); e = e.parent() } return !1 } function x(e, o, t) { var r = e.css(o), i = parseFloat(r); if (isNaN(i)) { var s = 3 == (i = I[r] || 0) ? t ? T.win.outerHeight() - T.win.innerHeight() : T.win.outerWidth() - T.win.innerWidth() : 1; return T.isie8 && i && (i += 1), s ? i : 0 } return i } function S(e, o, t, r) { T._bind(e, o, function (r) { var i = { original: r = r || a.event, target: r.target || r.srcElement, type: "wheel", deltaMode: "MozMousePixelScroll" == r.type ? 0 : 1, deltaX: 0, deltaZ: 0, preventDefault: function () { return r.preventDefault ? r.preventDefault() : r.returnValue = !1, !1 }, stopImmediatePropagation: function () { r.stopImmediatePropagation ? r.stopImmediatePropagation() : r.cancelBubble = !0 } }; return "mousewheel" == o ? (r.wheelDeltaX && (i.deltaX = -.025 * r.wheelDeltaX), r.wheelDeltaY && (i.deltaY = -.025 * r.wheelDeltaY), !i.deltaY && !i.deltaX && (i.deltaY = -.025 * r.wheelDelta)) : i.deltaY = r.detail, t.call(e, i) }, r) } function z(e, o, t, r) { T.scrollrunning || (T.newscrolly = T.getScrollTop(), T.newscrollx = T.getScrollLeft(), D = f()); var i = f() - D; if (D = f(), i > 350 ? A = 1 : A += (2 - A) / 10, e = e * A | 0, o = o * A | 0, e) { if (r) if (e < 0) { if (T.getScrollLeft() >= T.page.maxw) return !0 } else if (T.getScrollLeft() <= 0) return !0; var s = e > 0 ? 1 : -1; X !== s && (T.scrollmom && T.scrollmom.stop(), T.newscrollx = T.getScrollLeft(), X = s), T.lastdeltax -= e } if (o) { if (function () { var e = T.getScrollTop(); if (o < 0) { if (e >= T.page.maxh) return !0 } else if (e <= 0) return !0 }()) { if (M.nativeparentscrolling && t && !T.ispage && !T.zoomactive) return !0; var n = T.view.h >> 1; T.newscrolly < -n ? (T.newscrolly = -n, o = -1) : T.newscrolly > T.page.maxh + n ? (T.newscrolly = T.page.maxh + n, o = 1) : o = 0 } var l = o > 0 ? 1 : -1; B !== l && (T.scrollmom && T.scrollmom.stop(), T.newscrolly = T.getScrollTop(), B = l), T.lastdeltay -= o } (o || e) && T.synched("relativexy", function () { var e = T.lastdeltay + T.newscrolly; T.lastdeltay = 0; var o = T.lastdeltax + T.newscrollx; T.lastdeltax = 0, T.rail.drag || T.doScrollPos(o, e) }) } function k(e, o, t) { var r, i; return !(t || !q) || (0 === e.deltaMode ? (r = -e.deltaX * (M.mousescrollstep / 54) | 0, i = -e.deltaY * (M.mousescrollstep / 54) | 0) : 1 === e.deltaMode && (r = -e.deltaX * M.mousescrollstep * 50 / 80 | 0, i = -e.deltaY * M.mousescrollstep * 50 / 80 | 0), o && M.oneaxismousemode && 0 === r && i && (r = i, i = 0, t && (r < 0 ? T.getScrollLeft() >= T.page.maxw : T.getScrollLeft() <= 0) && (i = r, r = 0)), T.isrtlmode && (r = -r), z(r, i, t, !0) ? void (t && (q = !0)) : (q = !1, e.stopImmediatePropagation(), e.preventDefault())) } var T = this; this.version = "3.7.6", this.name = "nicescroll", this.me = p; var E = n("body"), M = this.opt = { doc: E, win: !1 }; if (n.extend(M, g), M.snapbackspeed = 80, e) for (var L in M) void 0 !== e[L] && (M[L] = e[L]); if (M.disablemutationobserver && (m = !1), this.doc = M.doc, this.iddoc = this.doc && this.doc[0] ? this.doc[0].id || "" : "", this.ispage = /^BODY|HTML/.test(M.win ? M.win[0].nodeName : this.doc[0].nodeName), this.haswrapper = !1 !== M.win, this.win = M.win || (this.ispage ? c : this.doc), this.docscroll = this.ispage && !this.haswrapper ? c : this.win, this.body = E, this.viewport = !1, this.isfixed = !1, this.iframe = !1, this.isiframe = "IFRAME" == this.doc[0].nodeName && "IFRAME" == this.win[0].nodeName, this.istextarea = "TEXTAREA" == this.win[0].nodeName, this.forcescreen = !1, this.canshowonmouseevent = "scroll" != M.autohidemode, this.onmousedown = !1, this.onmouseup = !1, this.onmousemove = !1, this.onmousewheel = !1, this.onkeypress = !1, this.ongesturezoom = !1, this.onclick = !1, this.onscrollstart = !1, this.onscrollend = !1, this.onscrollcancel = !1, this.onzoomin = !1, this.onzoomout = !1, this.view = !1, this.page = !1, this.scroll = { x: 0, y: 0 }, this.scrollratio = { x: 0, y: 0 }, this.cursorheight = 20, this.scrollvaluemax = 0, "auto" == M.rtlmode) { var C = this.win[0] == a ? this.body : this.win, N = C.css("writing-mode") || C.css("-webkit-writing-mode") || C.css("-ms-writing-mode") || C.css("-moz-writing-mode"); "horizontal-tb" == N || "lr-tb" == N || "" === N ? (this.isrtlmode = "rtl" == C.css("direction"), this.isvertical = !1) : (this.isrtlmode = "vertical-rl" == N || "tb" == N || "tb-rl" == N || "rl-tb" == N, this.isvertical = "vertical-rl" == N || "tb" == N || "tb-rl" == N) } else this.isrtlmode = !0 === M.rtlmode, this.isvertical = !1; if (this.scrollrunning = !1, this.scrollmom = !1, this.observer = !1, this.observerremover = !1, this.observerbody = !1, !1 !== M.scrollbarid) this.id = M.scrollbarid; else do { this.id = "ascrail" + i++ } while (l.getElementById(this.id)); this.rail = !1, this.cursor = !1, this.cursorfreezed = !1, this.selectiondrag = !1, this.zoom = !1, this.zoomactive = !1, this.hasfocus = !1, this.hasmousefocus = !1, this.railslocked = !1, this.locked = !1, this.hidden = !1, this.cursoractive = !0, this.wheelprevented = !1, this.overflowx = M.overflowx, this.overflowy = M.overflowy, this.nativescrollingarea = !1, this.checkarea = 0, this.events = [], this.saved = {}, this.delaylist = {}, this.synclist = {}, this.lastdeltax = 0, this.lastdeltay = 0, this.detected = w(); var P = n.extend({}, this.detected); this.canhwscroll = P.hastransform && M.hwacceleration, this.ishwscroll = this.canhwscroll && T.haswrapper, this.isrtlmode ? this.isvertical ? this.hasreversehr = !(P.iswebkit || P.isie || P.isie11) : this.hasreversehr = !(P.iswebkit || P.isie && !P.isie10 && !P.isie11) : this.hasreversehr = !1, this.istouchcapable = !1, P.cantouch || !P.hasw3ctouch && !P.hasmstouch ? !P.cantouch || P.isios || P.isandroid || !P.iswebkit && !P.ismozilla || (this.istouchcapable = !0) : this.istouchcapable = !0, M.enablemouselockapi || (P.hasmousecapture = !1, P.haspointerlock = !1), this.debounced = function (e, o, t) { T && (T.delaylist[e] || !1 || (T.delaylist[e] = { h: u(function () { T.delaylist[e].fn.call(T), T.delaylist[e] = !1 }, t) }, o.call(T)), T.delaylist[e].fn = o) }, this.synched = function (e, o) { T.synclist[e] ? T.synclist[e] = o : (T.synclist[e] = o, u(function () { T && (T.synclist[e] && T.synclist[e].call(T), T.synclist[e] = null) })) }, this.unsynched = function (e) { T.synclist[e] && (T.synclist[e] = !1) }, this.css = function (e, o) { for (var t in o) T.saved.css.push([e, t, e.css(t)]), e.css(t, o[t]) }, this.scrollTop = function (e) { return void 0 === e ? T.getScrollTop() : T.setScrollTop(e) }, this.scrollLeft = function (e) { return void 0 === e ? T.getScrollLeft() : T.setScrollLeft(e) }; var R = function (e, o, t, r, i, s, n) { this.st = e, this.ed = o, this.spd = t, this.p1 = r || 0, this.p2 = i || 1, this.p3 = s || 0, this.p4 = n || 1, this.ts = f(), this.df = o - e }; if (R.prototype = { B2: function (e) { return 3 * (1 - e) * (1 - e) * e }, B3: function (e) { return 3 * (1 - e) * e * e }, B4: function (e) { return e * e * e }, getPos: function () { return (f() - this.ts) / this.spd }, getNow: function () { var e = (f() - this.ts) / this.spd, o = this.B2(e) + this.B3(e) + this.B4(e); return e >= 1 ? this.ed : this.st + this.df * o | 0 }, update: function (e, o) { return this.st = this.getNow(), this.ed = e, this.spd = o, this.ts = f(), this.df = this.ed - this.st, this } }, this.ishwscroll) { this.doc.translate = { x: 0, y: 0, tx: "0px", ty: "0px" }, P.hastranslate3d && P.isios && this.doc.css("-webkit-backface-visibility", "hidden"), this.getScrollTop = function (e) { if (!e) { var o = v(); if (o) return 16 == o.length ? -o[13] : -o[5]; if (T.timerscroll && T.timerscroll.bz) return T.timerscroll.bz.getNow() } return T.doc.translate.y }, this.getScrollLeft = function (e) { if (!e) { var o = v(); if (o) return 16 == o.length ? -o[12] : -o[4]; if (T.timerscroll && T.timerscroll.bh) return T.timerscroll.bh.getNow() } return T.doc.translate.x }, this.notifyScrollEvent = function (e) { var o = l.createEvent("UIEvents"); o.initUIEvent("scroll", !1, !1, a, 1), o.niceevent = !0, e.dispatchEvent(o) }; var _ = this.isrtlmode ? 1 : -1; P.hastranslate3d && M.enabletranslate3d ? (this.setScrollTop = function (e, o) { T.doc.translate.y = e, T.doc.translate.ty = -1 * e + "px", T.doc.css(P.trstyle, "translate3d(" + T.doc.translate.tx + "," + T.doc.translate.ty + ",0)"), o || T.notifyScrollEvent(T.win[0]) }, this.setScrollLeft = function (e, o) { T.doc.translate.x = e, T.doc.translate.tx = e * _ + "px", T.doc.css(P.trstyle, "translate3d(" + T.doc.translate.tx + "," + T.doc.translate.ty + ",0)"), o || T.notifyScrollEvent(T.win[0]) }) : (this.setScrollTop = function (e, o) { T.doc.translate.y = e, T.doc.translate.ty = -1 * e + "px", T.doc.css(P.trstyle, "translate(" + T.doc.translate.tx + "," + T.doc.translate.ty + ")"), o || T.notifyScrollEvent(T.win[0]) }, this.setScrollLeft = function (e, o) { T.doc.translate.x = e, T.doc.translate.tx = e * _ + "px", T.doc.css(P.trstyle, "translate(" + T.doc.translate.tx + "," + T.doc.translate.ty + ")"), o || T.notifyScrollEvent(T.win[0]) }) } else this.getScrollTop = function () { return T.docscroll.scrollTop() }, this.setScrollTop = function (e) { T.docscroll.scrollTop(e) }, this.getScrollLeft = function () { return T.hasreversehr ? T.detected.ismozilla ? T.page.maxw - Math.abs(T.docscroll.scrollLeft()) : T.page.maxw - T.docscroll.scrollLeft() : T.docscroll.scrollLeft() }, this.setScrollLeft = function (e) { return setTimeout(function () { if (T) return T.hasreversehr && (e = T.detected.ismozilla ? -(T.page.maxw - e) : T.page.maxw - e), T.docscroll.scrollLeft(e) }, 1) }; this.getTarget = function (e) { return !!e && (e.target ? e.target : !!e.srcElement && e.srcElement) }, this.hasParent = function (e, o) { if (!e) return !1; for (var t = e.target || e.srcElement || e || !1; t && t.id != o;)t = t.parentNode || !1; return !1 !== t }; var I = { thin: 1, medium: 3, thick: 5 }; this.getDocumentScrollOffset = function () { return { top: a.pageYOffset || l.documentElement.scrollTop, left: a.pageXOffset || l.documentElement.scrollLeft } }, this.getOffset = function () { if (T.isfixed) { var e = T.win.offset(), o = T.getDocumentScrollOffset(); return e.top -= o.top, e.left -= o.left, e } var t = T.win.offset(); if (!T.viewport) return t; var r = T.viewport.offset(); return { top: t.top - r.top, left: t.left - r.left } }, this.updateScrollBar = function (e) { var o, t; if (T.ishwscroll) T.rail.css({ height: T.win.innerHeight() - (M.railpadding.top + M.railpadding.bottom) }), T.railh && T.railh.css({ width: T.win.innerWidth() - (M.railpadding.left + M.railpadding.right) }); else { var r = T.getOffset(); if (o = { top: r.top, left: r.left - (M.railpadding.left + M.railpadding.right) }, o.top += x(T.win, "border-top-width", !0), o.left += T.rail.align ? T.win.outerWidth() - x(T.win, "border-right-width") - T.rail.width : x(T.win, "border-left-width"), (t = M.railoffset) && (t.top && (o.top += t.top), t.left && (o.left += t.left)), T.railslocked || T.rail.css({ top: o.top, left: o.left, height: (e ? e.h : T.win.innerHeight()) - (M.railpadding.top + M.railpadding.bottom) }), T.zoom && T.zoom.css({ top: o.top + 1, left: 1 == T.rail.align ? o.left - 20 : o.left + T.rail.width + 4 }), T.railh && !T.railslocked) { o = { top: r.top, left: r.left }, (t = M.railhoffset) && (t.top && (o.top += t.top), t.left && (o.left += t.left)); var i = T.railh.align ? o.top + x(T.win, "border-top-width", !0) + T.win.innerHeight() - T.railh.height : o.top + x(T.win, "border-top-width", !0), s = o.left + x(T.win, "border-left-width"); T.railh.css({ top: i - (M.railpadding.top + M.railpadding.bottom), left: s, width: T.railh.width }) } } }, this.doRailClick = function (e, o, t) { var r, i, s, n; T.railslocked || (T.cancelEvent(e), "pageY" in e || (e.pageX = e.clientX + l.documentElement.scrollLeft, e.pageY = e.clientY + l.documentElement.scrollTop), o ? (r = t ? T.doScrollLeft : T.doScrollTop, s = t ? (e.pageX - T.railh.offset().left - T.cursorwidth / 2) * T.scrollratio.x : (e.pageY - T.rail.offset().top - T.cursorheight / 2) * T.scrollratio.y, T.unsynched("relativexy"), r(0 | s)) : (r = t ? T.doScrollLeftBy : T.doScrollBy, s = t ? T.scroll.x : T.scroll.y, n = t ? e.pageX - T.railh.offset().left : e.pageY - T.rail.offset().top, i = t ? T.view.w : T.view.h, r(s >= n ? i : -i))) }, T.newscrolly = T.newscrollx = 0, T.hasanimationframe = "requestAnimationFrame" in a, T.hascancelanimationframe = "cancelAnimationFrame" in a, T.hasborderbox = !1, this.init = function () { if (T.saved.css = [], P.isoperamini) return !0; if (P.isandroid && !("hidden" in l)) return !0; M.emulatetouch = M.emulatetouch || M.touchbehavior, T.hasborderbox = a.getComputedStyle && "border-box" === a.getComputedStyle(l.body)["box-sizing"]; var e = { "overflow-y": "hidden" }; if ((P.isie11 || P.isie10) && (e["-ms-overflow-style"] = "none"), T.ishwscroll && (this.doc.css(P.transitionstyle, P.prefixstyle + "transform 0ms ease-out"), P.transitionend && T.bind(T.doc, P.transitionend, T.onScrollTransitionEnd, !1)), T.zindex = "auto", T.ispage || "auto" != M.zindex ? T.zindex = M.zindex : T.zindex = b() || "auto", !T.ispage && "auto" != T.zindex && T.zindex > s && (s = T.zindex), T.isie && 0 === T.zindex && "auto" == M.zindex && (T.zindex = "auto"), !T.ispage || !P.isieold) { var i = T.docscroll; T.ispage && (i = T.haswrapper ? T.win : T.doc), T.css(i, e), T.ispage && (P.isie11 || P.isie) && T.css(n("html"), e), !P.isios || T.ispage || T.haswrapper || T.css(E, { "-webkit-overflow-scrolling": "touch" }); var d = n(l.createElement("div")); d.css({ position: "relative", top: 0, float: "right", width: M.cursorwidth, height: 0, "background-color": M.cursorcolor, border: M.cursorborder, "background-clip": "padding-box", "-webkit-border-radius": M.cursorborderradius, "-moz-border-radius": M.cursorborderradius, "border-radius": M.cursorborderradius }), d.addClass("nicescroll-cursors"), T.cursor = d; var u = n(l.createElement("div")); u.attr("id", T.id), u.addClass("nicescroll-rails nicescroll-rails-vr"); var h, p, f = ["left", "right", "top", "bottom"]; for (var g in f) p = f[g], (h = M.railpadding[p] || 0) && u.css("padding-" + p, h + "px"); u.append(d), u.width = Math.max(parseFloat(M.cursorwidth), d.outerWidth()), u.css({ width: u.width + "px", zIndex: T.zindex, background: M.background, cursor: "default" }), u.visibility = !0, u.scrollable = !0, u.align = "left" == M.railalign ? 0 : 1, T.rail = u, T.rail.drag = !1; var v = !1; !M.boxzoom || T.ispage || P.isieold || (v = l.createElement("div"), T.bind(v, "click", T.doZoom), T.bind(v, "mouseenter", function () { T.zoom.css("opacity", M.cursoropacitymax) }), T.bind(v, "mouseleave", function () { T.zoom.css("opacity", M.cursoropacitymin) }), T.zoom = n(v), T.zoom.css({ cursor: "pointer", zIndex: T.zindex, backgroundImage: "url(" + M.scriptpath + "zoomico.png)", height: 18, width: 18, backgroundPosition: "0 0" }), M.dblclickzoom && T.bind(T.win, "dblclick", T.doZoom), P.cantouch && M.gesturezoom && (T.ongesturezoom = function (e) { return e.scale > 1.5 && T.doZoomIn(e), e.scale < .8 && T.doZoomOut(e), T.cancelEvent(e) }, T.bind(T.win, "gestureend", T.ongesturezoom))), T.railh = !1; var w; if (M.horizrailenabled && (T.css(i, { overflowX: "hidden" }), (d = n(l.createElement("div"))).css({ position: "absolute", top: 0, height: M.cursorwidth, width: 0, backgroundColor: M.cursorcolor, border: M.cursorborder, backgroundClip: "padding-box", "-webkit-border-radius": M.cursorborderradius, "-moz-border-radius": M.cursorborderradius, "border-radius": M.cursorborderradius }), P.isieold && d.css("overflow", "hidden"), d.addClass("nicescroll-cursors"), T.cursorh = d, (w = n(l.createElement("div"))).attr("id", T.id + "-hr"), w.addClass("nicescroll-rails nicescroll-rails-hr"), w.height = Math.max(parseFloat(M.cursorwidth), d.outerHeight()), w.css({ height: w.height + "px", zIndex: T.zindex, background: M.background }), w.append(d), w.visibility = !0, w.scrollable = !0, w.align = "top" == M.railvalign ? 0 : 1, T.railh = w, T.railh.drag = !1), T.ispage) u.css({ position: "fixed", top: 0, height: "100%" }), u.css(u.align ? { right: 0 } : { left: 0 }), T.body.append(u), T.railh && (w.css({ position: "fixed", left: 0, width: "100%" }), w.css(w.align ? { bottom: 0 } : { top: 0 }), T.body.append(w)); else { if (T.ishwscroll) { "static" == T.win.css("position") && T.css(T.win, { position: "relative" }); var x = "HTML" == T.win[0].nodeName ? T.body : T.win; n(x).scrollTop(0).scrollLeft(0), T.zoom && (T.zoom.css({ position: "absolute", top: 1, right: 0, "margin-right": u.width + 4 }), x.append(T.zoom)), u.css({ position: "absolute", top: 0 }), u.css(u.align ? { right: 0 } : { left: 0 }), x.append(u), w && (w.css({ position: "absolute", left: 0, bottom: 0 }), w.css(w.align ? { bottom: 0 } : { top: 0 }), x.append(w)) } else { T.isfixed = "fixed" == T.win.css("position"); var S = T.isfixed ? "fixed" : "absolute"; T.isfixed || (T.viewport = T.getViewport(T.win[0])), T.viewport && (T.body = T.viewport, /fixed|absolute/.test(T.viewport.css("position")) || T.css(T.viewport, { position: "relative" })), u.css({ position: S }), T.zoom && T.zoom.css({ position: S }), T.updateScrollBar(), T.body.append(u), T.zoom && T.body.append(T.zoom), T.railh && (w.css({ position: S }), T.body.append(w)) } P.isios && T.css(T.win, { "-webkit-tap-highlight-color": "rgba(0,0,0,0)", "-webkit-touch-callout": "none" }), M.disableoutline && (P.isie && T.win.attr("hideFocus", "true"), P.iswebkit && T.win.css("outline", "none")) } if (!1 === M.autohidemode ? (T.autohidedom = !1, T.rail.css({ opacity: M.cursoropacitymax }), T.railh && T.railh.css({ opacity: M.cursoropacitymax })) : !0 === M.autohidemode || "leave" === M.autohidemode ? (T.autohidedom = n().add(T.rail), P.isie8 && (T.autohidedom = T.autohidedom.add(T.cursor)), T.railh && (T.autohidedom = T.autohidedom.add(T.railh)), T.railh && P.isie8 && (T.autohidedom = T.autohidedom.add(T.cursorh))) : "scroll" == M.autohidemode ? (T.autohidedom = n().add(T.rail), T.railh && (T.autohidedom = T.autohidedom.add(T.railh))) : "cursor" == M.autohidemode ? (T.autohidedom = n().add(T.cursor), T.railh && (T.autohidedom = T.autohidedom.add(T.cursorh))) : "hidden" == M.autohidemode && (T.autohidedom = !1, T.hide(), T.railslocked = !1), P.cantouch || T.istouchcapable || M.emulatetouch || P.hasmstouch) { T.scrollmom = new y(T); T.ontouchstart = function (e) { if (T.locked) return !1; if (e.pointerType && ("mouse" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return !1; if (T.hasmoving = !1, T.scrollmom.timer && (T.triggerScrollEnd(), T.scrollmom.stop()), !T.railslocked) { var o = T.getTarget(e); if (o && /INPUT/i.test(o.nodeName) && /range/i.test(o.type)) return T.stopPropagation(e); var t = "mousedown" === e.type; if (!("clientX" in e) && "changedTouches" in e && (e.clientX = e.changedTouches[0].clientX, e.clientY = e.changedTouches[0].clientY), T.forcescreen) { var r = e; (e = { original: e.original ? e.original : e }).clientX = r.screenX, e.clientY = r.screenY } if (T.rail.drag = { x: e.clientX, y: e.clientY, sx: T.scroll.x, sy: T.scroll.y, st: T.getScrollTop(), sl: T.getScrollLeft(), pt: 2, dl: !1, tg: o }, T.ispage || !M.directionlockdeadzone) T.rail.drag.dl = "f"; else { var i = { w: c.width(), h: c.height() }, s = T.getContentSize(), l = s.h - i.h, a = s.w - i.w; T.rail.scrollable && !T.railh.scrollable ? T.rail.drag.ck = l > 0 && "v" : !T.rail.scrollable && T.railh.scrollable ? T.rail.drag.ck = a > 0 && "h" : T.rail.drag.ck = !1 } if (M.emulatetouch && T.isiframe && P.isie) { var d = T.win.position(); T.rail.drag.x += d.left, T.rail.drag.y += d.top } if (T.hasmoving = !1, T.lastmouseup = !1, T.scrollmom.reset(e.clientX, e.clientY), o && t) { if (!/INPUT|SELECT|BUTTON|TEXTAREA/i.test(o.nodeName)) return P.hasmousecapture && o.setCapture(), M.emulatetouch ? (o.onclick && !o._onclick && (o._onclick = o.onclick, o.onclick = function (e) { if (T.hasmoving) return !1; o._onclick.call(this, e) }), T.cancelEvent(e)) : T.stopPropagation(e); /SUBMIT|CANCEL|BUTTON/i.test(n(o).attr("type")) && (T.preventclick = { tg: o, click: !1 }) } } }, T.ontouchend = function (e) { if (!T.rail.drag) return !0; if (2 == T.rail.drag.pt) { if (e.pointerType && ("mouse" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return !1; T.rail.drag = !1; var o = "mouseup" === e.type; if (T.hasmoving && (T.scrollmom.doMomentum(), T.lastmouseup = !0, T.hideCursor(), P.hasmousecapture && l.releaseCapture(), o)) return T.cancelEvent(e) } else if (1 == T.rail.drag.pt) return T.onmouseup(e) }; var z = M.emulatetouch && T.isiframe && !P.hasmousecapture, k = .3 * M.directionlockdeadzone | 0; T.ontouchmove = function (e, o) { if (!T.rail.drag) return !0; if (e.targetTouches && M.preventmultitouchscrolling && e.targetTouches.length > 1) return !0; if (e.pointerType && ("mouse" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return !0; if (2 == T.rail.drag.pt) { "changedTouches" in e && (e.clientX = e.changedTouches[0].clientX, e.clientY = e.changedTouches[0].clientY); var t, r; if (r = t = 0, z && !o) { var i = T.win.position(); r = -i.left, t = -i.top } var s = e.clientY + t, n = s - T.rail.drag.y, a = e.clientX + r, c = a - T.rail.drag.x, d = T.rail.drag.st - n; if (T.ishwscroll && M.bouncescroll) d < 0 ? d = Math.round(d / 2) : d > T.page.maxh && (d = T.page.maxh + Math.round((d - T.page.maxh) / 2)); else if (d < 0 ? (d = 0, s = 0) : d > T.page.maxh && (d = T.page.maxh, s = 0), 0 === s && !T.hasmoving) return T.ispage || (T.rail.drag = !1), !0; var u = T.getScrollLeft(); if (T.railh && T.railh.scrollable && (u = T.isrtlmode ? c - T.rail.drag.sl : T.rail.drag.sl - c, T.ishwscroll && M.bouncescroll ? u < 0 ? u = Math.round(u / 2) : u > T.page.maxw && (u = T.page.maxw + Math.round((u - T.page.maxw) / 2)) : (u < 0 && (u = 0, a = 0), u > T.page.maxw && (u = T.page.maxw, a = 0))), !T.hasmoving) { if (T.rail.drag.y === e.clientY && T.rail.drag.x === e.clientX) return T.cancelEvent(e); var h = Math.abs(n), p = Math.abs(c), m = M.directionlockdeadzone; if (T.rail.drag.ck ? "v" == T.rail.drag.ck ? p > m && h <= k ? T.rail.drag = !1 : h > m && (T.rail.drag.dl = "v") : "h" == T.rail.drag.ck && (h > m && p <= k ? T.rail.drag = !1 : p > m && (T.rail.drag.dl = "h")) : h > m && p > m ? T.rail.drag.dl = "f" : h > m ? T.rail.drag.dl = p > k ? "f" : "v" : p > m && (T.rail.drag.dl = h > k ? "f" : "h"), !T.rail.drag.dl) return T.cancelEvent(e); T.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0), T.hasmoving = !0 } return T.preventclick && !T.preventclick.click && (T.preventclick.click = T.preventclick.tg.onclick || !1, T.preventclick.tg.onclick = T.onpreventclick), T.rail.drag.dl && ("v" == T.rail.drag.dl ? u = T.rail.drag.sl : "h" == T.rail.drag.dl && (d = T.rail.drag.st)), T.synched("touchmove", function () { T.rail.drag && 2 == T.rail.drag.pt && (T.prepareTransition && T.resetTransition(), T.rail.scrollable && T.setScrollTop(d), T.scrollmom.update(a, s), T.railh && T.railh.scrollable ? (T.setScrollLeft(u), T.showCursor(d, u)) : T.showCursor(d), P.isie10 && l.selection.clear()) }), T.cancelEvent(e) } return 1 == T.rail.drag.pt ? T.onmousemove(e) : void 0 }, T.ontouchstartCursor = function (e, o) { if (!T.rail.drag || 3 == T.rail.drag.pt) { if (T.locked) return T.cancelEvent(e); T.cancelScroll(), T.rail.drag = { x: e.touches[0].clientX, y: e.touches[0].clientY, sx: T.scroll.x, sy: T.scroll.y, pt: 3, hr: !!o }; var t = T.getTarget(e); return !T.ispage && P.hasmousecapture && t.setCapture(), T.isiframe && !P.hasmousecapture && (T.saved.csspointerevents = T.doc.css("pointer-events"), T.css(T.doc, { "pointer-events": "none" })), T.cancelEvent(e) } }, T.ontouchendCursor = function (e) { if (T.rail.drag) { if (P.hasmousecapture && l.releaseCapture(), T.isiframe && !P.hasmousecapture && T.doc.css("pointer-events", T.saved.csspointerevents), 3 != T.rail.drag.pt) return; return T.rail.drag = !1, T.cancelEvent(e) } }, T.ontouchmoveCursor = function (e) { if (T.rail.drag) { if (3 != T.rail.drag.pt) return; if (T.cursorfreezed = !0, T.rail.drag.hr) { T.scroll.x = T.rail.drag.sx + (e.touches[0].clientX - T.rail.drag.x), T.scroll.x < 0 && (T.scroll.x = 0); var o = T.scrollvaluemaxw; T.scroll.x > o && (T.scroll.x = o) } else { T.scroll.y = T.rail.drag.sy + (e.touches[0].clientY - T.rail.drag.y), T.scroll.y < 0 && (T.scroll.y = 0); var t = T.scrollvaluemax; T.scroll.y > t && (T.scroll.y = t) } return T.synched("touchmove", function () { T.rail.drag && 3 == T.rail.drag.pt && (T.showCursor(), T.rail.drag.hr ? T.doScrollLeft(Math.round(T.scroll.x * T.scrollratio.x), M.cursordragspeed) : T.doScrollTop(Math.round(T.scroll.y * T.scrollratio.y), M.cursordragspeed)) }), T.cancelEvent(e) } } } if (T.onmousedown = function (e, o) { if (!T.rail.drag || 1 == T.rail.drag.pt) { if (T.railslocked) return T.cancelEvent(e); T.cancelScroll(), T.rail.drag = { x: e.clientX, y: e.clientY, sx: T.scroll.x, sy: T.scroll.y, pt: 1, hr: o || !1 }; var t = T.getTarget(e); return P.hasmousecapture && t.setCapture(), T.isiframe && !P.hasmousecapture && (T.saved.csspointerevents = T.doc.css("pointer-events"), T.css(T.doc, { "pointer-events": "none" })), T.hasmoving = !1, T.cancelEvent(e) } }, T.onmouseup = function (e) { if (T.rail.drag) return 1 != T.rail.drag.pt || (P.hasmousecapture && l.releaseCapture(), T.isiframe && !P.hasmousecapture && T.doc.css("pointer-events", T.saved.csspointerevents), T.rail.drag = !1, T.cursorfreezed = !1, T.hasmoving && T.triggerScrollEnd(), T.cancelEvent(e)) }, T.onmousemove = function (e) { if (T.rail.drag) { if (1 !== T.rail.drag.pt) return; if (P.ischrome && 0 === e.which) return T.onmouseup(e); if (T.cursorfreezed = !0, T.hasmoving || T.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0), T.hasmoving = !0, T.rail.drag.hr) { T.scroll.x = T.rail.drag.sx + (e.clientX - T.rail.drag.x), T.scroll.x < 0 && (T.scroll.x = 0); var o = T.scrollvaluemaxw; T.scroll.x > o && (T.scroll.x = o) } else { T.scroll.y = T.rail.drag.sy + (e.clientY - T.rail.drag.y), T.scroll.y < 0 && (T.scroll.y = 0); var t = T.scrollvaluemax; T.scroll.y > t && (T.scroll.y = t) } return T.synched("mousemove", function () { T.cursorfreezed && (T.showCursor(), T.rail.drag.hr ? T.scrollLeft(Math.round(T.scroll.x * T.scrollratio.x)) : T.scrollTop(Math.round(T.scroll.y * T.scrollratio.y))) }), T.cancelEvent(e) } T.checkarea = 0 }, P.cantouch || M.emulatetouch) T.onpreventclick = function (e) { if (T.preventclick) return T.preventclick.tg.onclick = T.preventclick.click, T.preventclick = !1, T.cancelEvent(e) }, T.onclick = !P.isios && function (e) { return !T.lastmouseup || (T.lastmouseup = !1, T.cancelEvent(e)) }, M.grabcursorenabled && P.cursorgrabvalue && (T.css(T.ispage ? T.doc : T.win, { cursor: P.cursorgrabvalue }), T.css(T.rail, { cursor: P.cursorgrabvalue })); else { var L = function (e) { if (T.selectiondrag) { if (e) { var o = T.win.outerHeight(), t = e.pageY - T.selectiondrag.top; t > 0 && t < o && (t = 0), t >= o && (t -= o), T.selectiondrag.df = t } if (0 !== T.selectiondrag.df) { var r = -2 * T.selectiondrag.df / 6 | 0; T.doScrollBy(r), T.debounced("doselectionscroll", function () { L() }, 50) } } }; T.hasTextSelected = "getSelection" in l ? function () { return l.getSelection().rangeCount > 0 } : "selection" in l ? function () { return "None" != l.selection.type } : function () { return !1 }, T.onselectionstart = function (e) { T.ispage || (T.selectiondrag = T.win.offset()) }, T.onselectionend = function (e) { T.selectiondrag = !1 }, T.onselectiondrag = function (e) { T.selectiondrag && T.hasTextSelected() && T.debounced("selectionscroll", function () { L(e) }, 250) } } if (P.hasw3ctouch ? (T.css(T.ispage ? n("html") : T.win, { "touch-action": "none" }), T.css(T.rail, { "touch-action": "none" }), T.css(T.cursor, { "touch-action": "none" }), T.bind(T.win, "pointerdown", T.ontouchstart), T.bind(l, "pointerup", T.ontouchend), T.delegate(l, "pointermove", T.ontouchmove)) : P.hasmstouch ? (T.css(T.ispage ? n("html") : T.win, { "-ms-touch-action": "none" }), T.css(T.rail, { "-ms-touch-action": "none" }), T.css(T.cursor, { "-ms-touch-action": "none" }), T.bind(T.win, "MSPointerDown", T.ontouchstart), T.bind(l, "MSPointerUp", T.ontouchend), T.delegate(l, "MSPointerMove", T.ontouchmove), T.bind(T.cursor, "MSGestureHold", function (e) { e.preventDefault() }), T.bind(T.cursor, "contextmenu", function (e) { e.preventDefault() })) : P.cantouch && (T.bind(T.win, "touchstart", T.ontouchstart, !1, !0), T.bind(l, "touchend", T.ontouchend, !1, !0), T.bind(l, "touchcancel", T.ontouchend, !1, !0), T.delegate(l, "touchmove", T.ontouchmove, !1, !0)), M.emulatetouch && (T.bind(T.win, "mousedown", T.ontouchstart, !1, !0), T.bind(l, "mouseup", T.ontouchend, !1, !0), T.bind(l, "mousemove", T.ontouchmove, !1, !0)), (M.cursordragontouch || !P.cantouch && !M.emulatetouch) && (T.rail.css({ cursor: "default" }), T.railh && T.railh.css({ cursor: "default" }), T.jqbind(T.rail, "mouseenter", function () { if (!T.ispage && !T.win.is(":visible")) return !1; T.canshowonmouseevent && T.showCursor(), T.rail.active = !0 }), T.jqbind(T.rail, "mouseleave", function () { T.rail.active = !1, T.rail.drag || T.hideCursor() }), M.sensitiverail && (T.bind(T.rail, "click", function (e) { T.doRailClick(e, !1, !1) }), T.bind(T.rail, "dblclick", function (e) { T.doRailClick(e, !0, !1) }), T.bind(T.cursor, "click", function (e) { T.cancelEvent(e) }), T.bind(T.cursor, "dblclick", function (e) { T.cancelEvent(e) })), T.railh && (T.jqbind(T.railh, "mouseenter", function () { if (!T.ispage && !T.win.is(":visible")) return !1; T.canshowonmouseevent && T.showCursor(), T.rail.active = !0 }), T.jqbind(T.railh, "mouseleave", function () { T.rail.active = !1, T.rail.drag || T.hideCursor() }), M.sensitiverail && (T.bind(T.railh, "click", function (e) { T.doRailClick(e, !1, !0) }), T.bind(T.railh, "dblclick", function (e) { T.doRailClick(e, !0, !0) }), T.bind(T.cursorh, "click", function (e) { T.cancelEvent(e) }), T.bind(T.cursorh, "dblclick", function (e) { T.cancelEvent(e) })))), M.cursordragontouch && (this.istouchcapable || P.cantouch) && (T.bind(T.cursor, "touchstart", T.ontouchstartCursor), T.bind(T.cursor, "touchmove", T.ontouchmoveCursor), T.bind(T.cursor, "touchend", T.ontouchendCursor), T.cursorh && T.bind(T.cursorh, "touchstart", function (e) { T.ontouchstartCursor(e, !0) }), T.cursorh && T.bind(T.cursorh, "touchmove", T.ontouchmoveCursor), T.cursorh && T.bind(T.cursorh, "touchend", T.ontouchendCursor)), M.emulatetouch || P.isandroid || P.isios ? (T.bind(P.hasmousecapture ? T.win : l, "mouseup", T.ontouchend), T.onclick && T.bind(l, "click", T.onclick), M.cursordragontouch ? (T.bind(T.cursor, "mousedown", T.onmousedown), T.bind(T.cursor, "mouseup", T.onmouseup), T.cursorh && T.bind(T.cursorh, "mousedown", function (e) { T.onmousedown(e, !0) }), T.cursorh && T.bind(T.cursorh, "mouseup", T.onmouseup)) : (T.bind(T.rail, "mousedown", function (e) { e.preventDefault() }), T.railh && T.bind(T.railh, "mousedown", function (e) { e.preventDefault() }))) : (T.bind(P.hasmousecapture ? T.win : l, "mouseup", T.onmouseup), T.bind(l, "mousemove", T.onmousemove), T.onclick && T.bind(l, "click", T.onclick), T.bind(T.cursor, "mousedown", T.onmousedown), T.bind(T.cursor, "mouseup", T.onmouseup), T.railh && (T.bind(T.cursorh, "mousedown", function (e) { T.onmousedown(e, !0) }), T.bind(T.cursorh, "mouseup", T.onmouseup)), !T.ispage && M.enablescrollonselection && (T.bind(T.win[0], "mousedown", T.onselectionstart), T.bind(l, "mouseup", T.onselectionend), T.bind(T.cursor, "mouseup", T.onselectionend), T.cursorh && T.bind(T.cursorh, "mouseup", T.onselectionend), T.bind(l, "mousemove", T.onselectiondrag)), T.zoom && (T.jqbind(T.zoom, "mouseenter", function () { T.canshowonmouseevent && T.showCursor(), T.rail.active = !0 }), T.jqbind(T.zoom, "mouseleave", function () { T.rail.active = !1, T.rail.drag || T.hideCursor() }))), M.enablemousewheel && (T.isiframe || T.mousewheel(P.isie && T.ispage ? l : T.win, T.onmousewheel), T.mousewheel(T.rail, T.onmousewheel), T.railh && T.mousewheel(T.railh, T.onmousewheelhr)), T.ispage || P.cantouch || /HTML|^BODY/.test(T.win[0].nodeName) || (T.win.attr("tabindex") || T.win.attr({ tabindex: ++r }), T.bind(T.win, "focus", function (e) { o = T.getTarget(e).id || T.getTarget(e) || !1, T.hasfocus = !0, T.canshowonmouseevent && T.noticeCursor() }), T.bind(T.win, "blur", function (e) { o = !1, T.hasfocus = !1 }), T.bind(T.win, "mouseenter", function (e) { t = T.getTarget(e).id || T.getTarget(e) || !1, T.hasmousefocus = !0, T.canshowonmouseevent && T.noticeCursor() }), T.bind(T.win, "mouseleave", function (e) { t = !1, T.hasmousefocus = !1, T.rail.drag || T.hideCursor() })), T.onkeypress = function (e) { if (T.railslocked && 0 === T.page.maxh) return !0; e = e || a.event; var r = T.getTarget(e); if (r && /INPUT|TEXTAREA|SELECT|OPTION/.test(r.nodeName) && (!(r.getAttribute("type") || r.type || !1) || !/submit|button|cancel/i.tp)) return !0; if (n(r).attr("contenteditable")) return !0; if (T.hasfocus || T.hasmousefocus && !o || T.ispage && !o && !t) { var i = e.keyCode; if (T.railslocked && 27 != i) return T.cancelEvent(e); var s = e.ctrlKey || !1, l = e.shiftKey || !1, c = !1; switch (i) { case 38: case 63233: T.doScrollBy(72), c = !0; break; case 40: case 63235: T.doScrollBy(-72), c = !0; break; case 37: case 63232: T.railh && (s ? T.doScrollLeft(0) : T.doScrollLeftBy(72), c = !0); break; case 39: case 63234: T.railh && (s ? T.doScrollLeft(T.page.maxw) : T.doScrollLeftBy(-72), c = !0); break; case 33: case 63276: T.doScrollBy(T.view.h), c = !0; break; case 34: case 63277: T.doScrollBy(-T.view.h), c = !0; break; case 36: case 63273: T.railh && s ? T.doScrollPos(0, 0) : T.doScrollTo(0), c = !0; break; case 35: case 63275: T.railh && s ? T.doScrollPos(T.page.maxw, T.page.maxh) : T.doScrollTo(T.page.maxh), c = !0; break; case 32: M.spacebarenabled && (l ? T.doScrollBy(T.view.h) : T.doScrollBy(-T.view.h), c = !0); break; case 27: T.zoomactive && (T.doZoom(), c = !0) }if (c) return T.cancelEvent(e) } }, M.enablekeyboard && T.bind(l, P.isopera && !P.isopera12 ? "keypress" : "keydown", T.onkeypress), T.bind(l, "keydown", function (e) { (e.ctrlKey || !1) && (T.wheelprevented = !0) }), T.bind(l, "keyup", function (e) { e.ctrlKey || !1 || (T.wheelprevented = !1) }), T.bind(a, "blur", function (e) { T.wheelprevented = !1 }), T.bind(a, "resize", T.onscreenresize), T.bind(a, "orientationchange", T.onscreenresize), T.bind(a, "load", T.lazyResize), P.ischrome && !T.ispage && !T.haswrapper) { var C = T.win.attr("style"), N = parseFloat(T.win.css("width")) + 1; T.win.css("width", N), T.synched("chromefix", function () { T.win.attr("style", C) }) } if (T.onAttributeChange = function (e) { T.lazyResize(T.isieold ? 250 : 30) }, M.enableobserver && (T.isie11 || !1 === m || (T.observerbody = new m(function (e) { if (e.forEach(function (e) { if ("attributes" == e.type) return E.hasClass("modal-open") && E.hasClass("modal-dialog") && !n.contains(n(".modal-dialog")[0], T.doc[0]) ? T.hide() : T.show() }), T.me.clientWidth != T.page.width || T.me.clientHeight != T.page.height) return T.lazyResize(30) }), T.observerbody.observe(l.body, { childList: !0, subtree: !0, characterData: !1, attributes: !0, attributeFilter: ["class"] })), !T.ispage && !T.haswrapper)) { var R = T.win[0]; !1 !== m ? (T.observer = new m(function (e) { e.forEach(T.onAttributeChange) }), T.observer.observe(R, { childList: !0, characterData: !1, attributes: !0, subtree: !1 }), T.observerremover = new m(function (e) { e.forEach(function (e) { if (e.removedNodes.length > 0) for (var o in e.removedNodes) if (T && e.removedNodes[o] === R) return T.remove() }) }), T.observerremover.observe(R.parentNode, { childList: !0, characterData: !1, attributes: !1, subtree: !1 })) : (T.bind(R, P.isie && !P.isie9 ? "propertychange" : "DOMAttrModified", T.onAttributeChange), P.isie9 && R.attachEvent("onpropertychange", T.onAttributeChange), T.bind(R, "DOMNodeRemoved", function (e) { e.target === R && T.remove() })) } !T.ispage && M.boxzoom && T.bind(a, "resize", T.resizeZoom), T.istextarea && (T.bind(T.win, "keydown", T.lazyResize), T.bind(T.win, "mouseup", T.lazyResize)), T.lazyResize(30) } if ("IFRAME" == this.doc[0].nodeName) { var _ = function () { T.iframexd = !1; var o; try { (o = "contentDocument" in this ? this.contentDocument : this.contentWindow._doc).domain } catch (e) { T.iframexd = !0, o = !1 } if (T.iframexd) return "console" in a && console.log("NiceScroll error: policy restriced iframe"), !0; if (T.forcescreen = !0, T.isiframe && (T.iframe = { doc: n(o), html: T.doc.contents().find("html")[0], body: T.doc.contents().find("body")[0] }, T.getContentSize = function () { return { w: Math.max(T.iframe.html.scrollWidth, T.iframe.body.scrollWidth), h: Math.max(T.iframe.html.scrollHeight, T.iframe.body.scrollHeight) } }, T.docscroll = n(T.iframe.body)), !P.isios && M.iframeautoresize && !T.isiframe) { T.win.scrollTop(0), T.doc.height(""); var t = Math.max(o.getElementsByTagName("html")[0].scrollHeight, o.body.scrollHeight); T.doc.height(t) } T.lazyResize(30), T.css(n(T.iframe.body), e), P.isios && T.haswrapper && T.css(n(o.body), { "-webkit-transform": "translate3d(0,0,0)" }), "contentWindow" in this ? T.bind(this.contentWindow, "scroll", T.onscroll) : T.bind(o, "scroll", T.onscroll), M.enablemousewheel && T.mousewheel(o, T.onmousewheel), M.enablekeyboard && T.bind(o, P.isopera ? "keypress" : "keydown", T.onkeypress), P.cantouch ? (T.bind(o, "touchstart", T.ontouchstart), T.bind(o, "touchmove", T.ontouchmove)) : M.emulatetouch && (T.bind(o, "mousedown", T.ontouchstart), T.bind(o, "mousemove", function (e) { return T.ontouchmove(e, !0) }), M.grabcursorenabled && P.cursorgrabvalue && T.css(n(o.body), { cursor: P.cursorgrabvalue })), T.bind(o, "mouseup", T.ontouchend), T.zoom && (M.dblclickzoom && T.bind(o, "dblclick", T.doZoom), T.ongesturezoom && T.bind(o, "gestureend", T.ongesturezoom)) }; this.doc[0].readyState && "complete" === this.doc[0].readyState && setTimeout(function () { _.call(T.doc[0], !1) }, 500), T.bind(this.doc, "load", _) } }, this.showCursor = function (e, o) { if (T.cursortimeout && (clearTimeout(T.cursortimeout), T.cursortimeout = 0), T.rail) { if (T.autohidedom && (T.autohidedom.stop().css({ opacity: M.cursoropacitymax }), T.cursoractive = !0), T.rail.drag && 1 == T.rail.drag.pt || (void 0 !== e && !1 !== e && (T.scroll.y = e / T.scrollratio.y | 0), void 0 !== o && (T.scroll.x = o / T.scrollratio.x | 0)), T.cursor.css({ height: T.cursorheight, top: T.scroll.y }), T.cursorh) { var t = T.hasreversehr ? T.scrollvaluemaxw - T.scroll.x : T.scroll.x; T.cursorh.css({ width: T.cursorwidth, left: !T.rail.align && T.rail.visibility ? t + T.rail.width : t }), T.cursoractive = !0 } T.zoom && T.zoom.stop().css({ opacity: M.cursoropacitymax }) } }, this.hideCursor = function (e) { T.cursortimeout || T.rail && T.autohidedom && (T.hasmousefocus && "leave" === M.autohidemode || (T.cursortimeout = setTimeout(function () { T.rail.active && T.showonmouseevent || (T.autohidedom.stop().animate({ opacity: M.cursoropacitymin }), T.zoom && T.zoom.stop().animate({ opacity: M.cursoropacitymin }), T.cursoractive = !1), T.cursortimeout = 0 }, e || M.hidecursordelay))) }, this.noticeCursor = function (e, o, t) { T.showCursor(o, t), T.rail.active || T.hideCursor(e) }, this.getContentSize = T.ispage ? function () { return { w: Math.max(l.body.scrollWidth, l.documentElement.scrollWidth), h: Math.max(l.body.scrollHeight, l.documentElement.scrollHeight) } } : T.haswrapper ? function () { return { w: T.doc[0].offsetWidth, h: T.doc[0].offsetHeight } } : function () { return { w: T.docscroll[0].scrollWidth, h: T.docscroll[0].scrollHeight } }, this.onResize = function (e, o) { if (!T || !T.win) return !1; var t = T.page.maxh, r = T.page.maxw, i = T.view.h, s = T.view.w; if (T.view = { w: T.ispage ? T.win.width() : T.win[0].clientWidth, h: T.ispage ? T.win.height() : T.win[0].clientHeight }, T.page = o || T.getContentSize(), T.page.maxh = Math.max(0, T.page.h - T.view.h), T.page.maxw = Math.max(0, T.page.w - T.view.w), T.page.maxh == t && T.page.maxw == r && T.view.w == s && T.view.h == i) { if (T.ispage) return T; var n = T.win.offset(); if (T.lastposition) { var l = T.lastposition; if (l.top == n.top && l.left == n.left) return T } T.lastposition = n } return 0 === T.page.maxh ? (T.hideRail(), T.scrollvaluemax = 0, T.scroll.y = 0, T.scrollratio.y = 0, T.cursorheight = 0, T.setScrollTop(0), T.rail && (T.rail.scrollable = !1)) : (T.page.maxh -= M.railpadding.top + M.railpadding.bottom, T.rail.scrollable = !0), 0 === T.page.maxw ? (T.hideRailHr(), T.scrollvaluemaxw = 0, T.scroll.x = 0, T.scrollratio.x = 0, T.cursorwidth = 0, T.setScrollLeft(0), T.railh && (T.railh.scrollable = !1)) : (T.page.maxw -= M.railpadding.left + M.railpadding.right, T.railh && (T.railh.scrollable = M.horizrailenabled)), T.railslocked = T.locked || 0 === T.page.maxh && 0 === T.page.maxw, T.railslocked ? (T.ispage || T.updateScrollBar(T.view), !1) : (T.hidden || (T.rail.visibility || T.showRail(), T.railh && !T.railh.visibility && T.showRailHr()), T.istextarea && T.win.css("resize") && "none" != T.win.css("resize") && (T.view.h -= 20), T.cursorheight = Math.min(T.view.h, Math.round(T.view.h * (T.view.h / T.page.h))), T.cursorheight = M.cursorfixedheight ? M.cursorfixedheight : Math.max(M.cursorminheight, T.cursorheight), T.cursorwidth = Math.min(T.view.w, Math.round(T.view.w * (T.view.w / T.page.w))), T.cursorwidth = M.cursorfixedheight ? M.cursorfixedheight : Math.max(M.cursorminheight, T.cursorwidth), T.scrollvaluemax = T.view.h - T.cursorheight - (M.railpadding.top + M.railpadding.bottom), T.hasborderbox || (T.scrollvaluemax -= T.cursor[0].offsetHeight - T.cursor[0].clientHeight), T.railh && (T.railh.width = T.page.maxh > 0 ? T.view.w - T.rail.width : T.view.w, T.scrollvaluemaxw = T.railh.width - T.cursorwidth - (M.railpadding.left + M.railpadding.right)), T.ispage || T.updateScrollBar(T.view), T.scrollratio = { x: T.page.maxw / T.scrollvaluemaxw, y: T.page.maxh / T.scrollvaluemax }, T.getScrollTop() > T.page.maxh ? T.doScrollTop(T.page.maxh) : (T.scroll.y = T.getScrollTop() / T.scrollratio.y | 0, T.scroll.x = T.getScrollLeft() / T.scrollratio.x | 0, T.cursoractive && T.noticeCursor()), T.scroll.y && 0 === T.getScrollTop() && T.doScrollTo(T.scroll.y * T.scrollratio.y | 0), T) }, this.resize = T.onResize; var O = 0; this.onscreenresize = function (e) { clearTimeout(O); var o = !T.ispage && !T.haswrapper; o && T.hideRails(), O = setTimeout(function () { T && (o && T.showRails(), T.resize()), O = 0 }, 120) }, this.lazyResize = function (e) { return clearTimeout(O), e = isNaN(e) ? 240 : e, O = setTimeout(function () { T && T.resize(), O = 0 }, e), T }, this.jqbind = function (e, o, t) { T.events.push({ e: e, n: o, f: t, q: !0 }), n(e).on(o, t) }, this.mousewheel = function (e, o, t) { var r = "jquery" in e ? e[0] : e; if ("onwheel" in l.createElement("div")) T._bind(r, "wheel", o, t || !1); else { var i = void 0 !== l.onmousewheel ? "mousewheel" : "DOMMouseScroll"; S(r, i, o, t || !1), "DOMMouseScroll" == i && S(r, "MozMousePixelScroll", o, t || !1) } }; var Y = !1; if (P.haseventlistener) { try { var H = Object.defineProperty({}, "passive", { get: function () { Y = !0 } }); a.addEventListener("test", null, H) } catch (e) { } this.stopPropagation = function (e) { return !!e && ((e = e.original ? e.original : e).stopPropagation(), !1) }, this.cancelEvent = function (e) { return e.cancelable && e.preventDefault(), e.stopImmediatePropagation(), e.preventManipulation && e.preventManipulation(), !1 } } else Event.prototype.preventDefault = function () { this.returnValue = !1 }, Event.prototype.stopPropagation = function () { this.cancelBubble = !0 }, a.constructor.prototype.addEventListener = l.constructor.prototype.addEventListener = Element.prototype.addEventListener = function (e, o, t) { this.attachEvent("on" + e, o) }, a.constructor.prototype.removeEventListener = l.constructor.prototype.removeEventListener = Element.prototype.removeEventListener = function (e, o, t) { this.detachEvent("on" + e, o) }, this.cancelEvent = function (e) { return (e = e || a.event) && (e.cancelBubble = !0, e.cancel = !0, e.returnValue = !1), !1 }, this.stopPropagation = function (e) { return (e = e || a.event) && (e.cancelBubble = !0), !1 }; this.delegate = function (e, o, t, r, i) { var s = d[o] || !1; s || (s = { a: [], l: [], f: function (e) { for (var o = s.l, t = !1, r = o.length - 1; r >= 0; r--)if (!1 === (t = o[r].call(e.target, e))) return !1; return t } }, T.bind(e, o, s.f, r, i), d[o] = s), T.ispage ? (s.a = [T.id].concat(s.a), s.l = [t].concat(s.l)) : (s.a.push(T.id), s.l.push(t)) }, this.undelegate = function (e, o, t, r, i) { var s = d[o] || !1; if (s && s.l) for (var n = 0, l = s.l.length; n < l; n++)s.a[n] === T.id && (s.a.splice(n), s.l.splice(n), 0 === s.a.length && (T._unbind(e, o, s.l.f), d[o] = null)) }, this.bind = function (e, o, t, r, i) { var s = "jquery" in e ? e[0] : e; T._bind(s, o, t, r || !1, i || !1) }, this._bind = function (e, o, t, r, i) { T.events.push({ e: e, n: o, f: t, b: r, q: !1 }), Y && i ? e.addEventListener(o, t, { passive: !1, capture: r }) : e.addEventListener(o, t, r || !1) }, this._unbind = function (e, o, t, r) { d[o] ? T.undelegate(e, o, t, r) : e.removeEventListener(o, t, r) }, this.unbindAll = function () { for (var e = 0; e < T.events.length; e++) { var o = T.events[e]; o.q ? o.e.unbind(o.n, o.f) : T._unbind(o.e, o.n, o.f, o.b) } }, this.showRails = function () { return T.showRail().showRailHr() }, this.showRail = function () { return 0 === T.page.maxh || !T.ispage && "none" == T.win.css("display") || (T.rail.visibility = !0, T.rail.css("display", "block")), T }, this.showRailHr = function () { return T.railh && (0 === T.page.maxw || !T.ispage && "none" == T.win.css("display") || (T.railh.visibility = !0, T.railh.css("display", "block"))), T }, this.hideRails = function () { return T.hideRail().hideRailHr() }, this.hideRail = function () { return T.rail.visibility = !1, T.rail.css("display", "none"), T }, this.hideRailHr = function () { return T.railh && (T.railh.visibility = !1, T.railh.css("display", "none")), T }, this.show = function () { return T.hidden = !1, T.railslocked = !1, T.showRails() }, this.hide = function () { return T.hidden = !0, T.railslocked = !0, T.hideRails() }, this.toggle = function () { return T.hidden ? T.show() : T.hide() }, this.remove = function () { T.stop(), T.cursortimeout && clearTimeout(T.cursortimeout); for (var e in T.delaylist) T.delaylist[e] && h(T.delaylist[e].h); T.doZoomOut(), T.unbindAll(), P.isie9 && T.win[0].detachEvent("onpropertychange", T.onAttributeChange), !1 !== T.observer && T.observer.disconnect(), !1 !== T.observerremover && T.observerremover.disconnect(), !1 !== T.observerbody && T.observerbody.disconnect(), T.events = null, T.cursor && T.cursor.remove(), T.cursorh && T.cursorh.remove(), T.rail && T.rail.remove(), T.railh && T.railh.remove(), T.zoom && T.zoom.remove(); for (var o = 0; o < T.saved.css.length; o++) { var t = T.saved.css[o]; t[0].css(t[1], void 0 === t[2] ? "" : t[2]) } T.saved = !1, T.me.data("__nicescroll", ""); var r = n.nicescroll; r.each(function (e) { if (this && this.id === T.id) { delete r[e]; for (var o = ++e; o < r.length; o++ , e++)r[e] = r[o]; --r.length && delete r[r.length] } }); for (var i in T) T[i] = null, delete T[i]; T = null }, this.scrollstart = function (e) { return this.onscrollstart = e, T }, this.scrollend = function (e) { return this.onscrollend = e, T }, this.scrollcancel = function (e) { return this.onscrollcancel = e, T }, this.zoomin = function (e) { return this.onzoomin = e, T }, this.zoomout = function (e) { return this.onzoomout = e, T }, this.isScrollable = function (e) { var o = e.target ? e.target : e; if ("OPTION" == o.nodeName) return !0; for (; o && 1 == o.nodeType && o !== this.me[0] && !/^BODY|HTML/.test(o.nodeName);) { var t = n(o), r = t.css("overflowY") || t.css("overflowX") || t.css("overflow") || ""; if (/scroll|auto/.test(r)) return o.clientHeight != o.scrollHeight; o = !!o.parentNode && o.parentNode } return !1 }, this.getViewport = function (e) { for (var o = !(!e || !e.parentNode) && e.parentNode; o && 1 == o.nodeType && !/^BODY|HTML/.test(o.nodeName);) { var t = n(o); if (/fixed|absolute/.test(t.css("position"))) return t; var r = t.css("overflowY") || t.css("overflowX") || t.css("overflow") || ""; if (/scroll|auto/.test(r) && o.clientHeight != o.scrollHeight) return t; if (t.getNiceScroll().length > 0) return t; o = !!o.parentNode && o.parentNode } return !1 }, this.triggerScrollStart = function (e, o, t, r, i) { if (T.onscrollstart) { var s = { type: "scrollstart", current: { x: e, y: o }, request: { x: t, y: r }, end: { x: T.newscrollx, y: T.newscrolly }, speed: i }; T.onscrollstart.call(T, s) } }, this.triggerScrollEnd = function () { if (T.onscrollend) { var e = T.getScrollLeft(), o = T.getScrollTop(), t = { type: "scrollend", current: { x: e, y: o }, end: { x: e, y: o } }; T.onscrollend.call(T, t) } }; var B = 0, X = 0, D = 0, A = 1, q = !1; if (this.onmousewheel = function (e) { if (T.wheelprevented || T.locked) return !1; if (T.railslocked) return T.debounced("checkunlock", T.resize, 250), !1; if (T.rail.drag) return T.cancelEvent(e); if ("auto" === M.oneaxismousemode && 0 !== e.deltaX && (M.oneaxismousemode = !1), M.oneaxismousemode && 0 === e.deltaX && !T.rail.scrollable) return !T.railh || !T.railh.scrollable || T.onmousewheelhr(e); var o = f(), t = !1; if (M.preservenativescrolling && T.checkarea + 600 < o && (T.nativescrollingarea = T.isScrollable(e), t = !0), T.checkarea = o, T.nativescrollingarea) return !0; var r = k(e, !1, t); return r && (T.checkarea = 0), r }, this.onmousewheelhr = function (e) { if (!T.wheelprevented) { if (T.railslocked || !T.railh.scrollable) return !0; if (T.rail.drag) return T.cancelEvent(e); var o = f(), t = !1; return M.preservenativescrolling && T.checkarea + 600 < o && (T.nativescrollingarea = T.isScrollable(e), t = !0), T.checkarea = o, !!T.nativescrollingarea || (T.railslocked ? T.cancelEvent(e) : k(e, !0, t)) } }, this.stop = function () { return T.cancelScroll(), T.scrollmon && T.scrollmon.stop(), T.cursorfreezed = !1, T.scroll.y = Math.round(T.getScrollTop() * (1 / T.scrollratio.y)), T.noticeCursor(), T }, this.getTransitionSpeed = function (e) { return 80 + e / 72 * M.scrollspeed | 0 }, M.smoothscroll) if (T.ishwscroll && P.hastransition && M.usetransition && M.smoothscroll) { var j = ""; this.resetTransition = function () { j = "", T.doc.css(P.prefixstyle + "transition-duration", "0ms") }, this.prepareTransition = function (e, o) { var t = o ? e : T.getTransitionSpeed(e), r = t + "ms"; return j !== r && (j = r, T.doc.css(P.prefixstyle + "transition-duration", r)), t }, this.doScrollLeft = function (e, o) { var t = T.scrollrunning ? T.newscrolly : T.getScrollTop(); T.doScrollPos(e, t, o) }, this.doScrollTop = function (e, o) { var t = T.scrollrunning ? T.newscrollx : T.getScrollLeft(); T.doScrollPos(t, e, o) }, this.cursorupdate = { running: !1, start: function () { var e = this; if (!e.running) { e.running = !0; var o = function () { e.running && u(o), T.showCursor(T.getScrollTop(), T.getScrollLeft()), T.notifyScrollEvent(T.win[0]) }; u(o) } }, stop: function () { this.running = !1 } }, this.doScrollPos = function (e, o, t) { var r = T.getScrollTop(), i = T.getScrollLeft(); if (((T.newscrolly - r) * (o - r) < 0 || (T.newscrollx - i) * (e - i) < 0) && T.cancelScroll(), M.bouncescroll ? (o < 0 ? o = o / 2 | 0 : o > T.page.maxh && (o = T.page.maxh + (o - T.page.maxh) / 2 | 0), e < 0 ? e = e / 2 | 0 : e > T.page.maxw && (e = T.page.maxw + (e - T.page.maxw) / 2 | 0)) : (o < 0 ? o = 0 : o > T.page.maxh && (o = T.page.maxh), e < 0 ? e = 0 : e > T.page.maxw && (e = T.page.maxw)), T.scrollrunning && e == T.newscrollx && o == T.newscrolly) return !1; T.newscrolly = o, T.newscrollx = e; var s = T.getScrollTop(), n = T.getScrollLeft(), l = {}; l.x = e - n, l.y = o - s; var a = 0 | Math.sqrt(l.x * l.x + l.y * l.y), c = T.prepareTransition(a); T.scrollrunning || (T.scrollrunning = !0, T.triggerScrollStart(n, s, e, o, c), T.cursorupdate.start()), T.scrollendtrapped = !0, P.transitionend || (T.scrollendtrapped && clearTimeout(T.scrollendtrapped), T.scrollendtrapped = setTimeout(T.onScrollTransitionEnd, c)), T.setScrollTop(T.newscrolly), T.setScrollLeft(T.newscrollx) }, this.cancelScroll = function () { if (!T.scrollendtrapped) return !0; var e = T.getScrollTop(), o = T.getScrollLeft(); return T.scrollrunning = !1, P.transitionend || clearTimeout(P.transitionend), T.scrollendtrapped = !1, T.resetTransition(), T.setScrollTop(e), T.railh && T.setScrollLeft(o), T.timerscroll && T.timerscroll.tm && clearInterval(T.timerscroll.tm), T.timerscroll = !1, T.cursorfreezed = !1, T.cursorupdate.stop(), T.showCursor(e, o), T }, this.onScrollTransitionEnd = function () { if (T.scrollendtrapped) { var e = T.getScrollTop(), o = T.getScrollLeft(); if (e < 0 ? e = 0 : e > T.page.maxh && (e = T.page.maxh), o < 0 ? o = 0 : o > T.page.maxw && (o = T.page.maxw), e != T.newscrolly || o != T.newscrollx) return T.doScrollPos(o, e, M.snapbackspeed); T.scrollrunning && T.triggerScrollEnd(), T.scrollrunning = !1, T.scrollendtrapped = !1, T.resetTransition(), T.timerscroll = !1, T.setScrollTop(e), T.railh && T.setScrollLeft(o), T.cursorupdate.stop(), T.noticeCursor(!1, e, o), T.cursorfreezed = !1 } } } else this.doScrollLeft = function (e, o) { var t = T.scrollrunning ? T.newscrolly : T.getScrollTop(); T.doScrollPos(e, t, o) }, this.doScrollTop = function (e, o) { var t = T.scrollrunning ? T.newscrollx : T.getScrollLeft(); T.doScrollPos(t, e, o) }, this.doScrollPos = function (e, o, t) { var r = T.getScrollTop(), i = T.getScrollLeft(); ((T.newscrolly - r) * (o - r) < 0 || (T.newscrollx - i) * (e - i) < 0) && T.cancelScroll(); var s = !1; if (T.bouncescroll && T.rail.visibility || (o < 0 ? (o = 0, s = !0) : o > T.page.maxh && (o = T.page.maxh, s = !0)), T.bouncescroll && T.railh.visibility || (e < 0 ? (e = 0, s = !0) : e > T.page.maxw && (e = T.page.maxw, s = !0)), T.scrollrunning && T.newscrolly === o && T.newscrollx === e) return !0; T.newscrolly = o, T.newscrollx = e, T.dst = {}, T.dst.x = e - i, T.dst.y = o - r, T.dst.px = i, T.dst.py = r; var n = 0 | Math.sqrt(T.dst.x * T.dst.x + T.dst.y * T.dst.y), l = T.getTransitionSpeed(n); T.bzscroll = {}; var a = s ? 1 : .58; T.bzscroll.x = new R(i, T.newscrollx, l, 0, 0, a, 1), T.bzscroll.y = new R(r, T.newscrolly, l, 0, 0, a, 1); f(); var c = function () { if (T.scrollrunning) { var e = T.bzscroll.y.getPos(); T.setScrollLeft(T.bzscroll.x.getNow()), T.setScrollTop(T.bzscroll.y.getNow()), e <= 1 ? T.timer = u(c) : (T.scrollrunning = !1, T.timer = 0, T.triggerScrollEnd()) } }; T.scrollrunning || (T.triggerScrollStart(i, r, e, o, l), T.scrollrunning = !0, T.timer = u(c)) }, this.cancelScroll = function () { return T.timer && h(T.timer), T.timer = 0, T.bzscroll = !1, T.scrollrunning = !1, T }; else this.doScrollLeft = function (e, o) { var t = T.getScrollTop(); T.doScrollPos(e, t, o) }, this.doScrollTop = function (e, o) { var t = T.getScrollLeft(); T.doScrollPos(t, e, o) }, this.doScrollPos = function (e, o, t) { var r = e > T.page.maxw ? T.page.maxw : e; r < 0 && (r = 0); var i = o > T.page.maxh ? T.page.maxh : o; i < 0 && (i = 0), T.synched("scroll", function () { T.setScrollTop(i), T.setScrollLeft(r) }) }, this.cancelScroll = function () { }; this.doScrollBy = function (e, o) { z(0, e) }, this.doScrollLeftBy = function (e, o) { z(e, 0) }, this.doScrollTo = function (e, o) { var t = o ? Math.round(e * T.scrollratio.y) : e; t < 0 ? t = 0 : t > T.page.maxh && (t = T.page.maxh), T.cursorfreezed = !1, T.doScrollTop(e) }, this.checkContentSize = function () { var e = T.getContentSize(); e.h == T.page.h && e.w == T.page.w || T.resize(!1, e) }, T.onscroll = function (e) { T.rail.drag || T.cursorfreezed || T.synched("scroll", function () { T.scroll.y = Math.round(T.getScrollTop() / T.scrollratio.y), T.railh && (T.scroll.x = Math.round(T.getScrollLeft() / T.scrollratio.x)), T.noticeCursor() }) }, T.bind(T.docscroll, "scroll", T.onscroll), this.doZoomIn = function (e) { if (!T.zoomactive) { T.zoomactive = !0, T.zoomrestore = { style: {} }; var o = ["position", "top", "left", "zIndex", "backgroundColor", "marginTop", "marginBottom", "marginLeft", "marginRight"], t = T.win[0].style; for (var r in o) { var i = o[r]; T.zoomrestore.style[i] = void 0 !== t[i] ? t[i] : "" } T.zoomrestore.style.width = T.win.css("width"), T.zoomrestore.style.height = T.win.css("height"), T.zoomrestore.padding = { w: T.win.outerWidth() - T.win.width(), h: T.win.outerHeight() - T.win.height() }, P.isios4 && (T.zoomrestore.scrollTop = c.scrollTop(), c.scrollTop(0)), T.win.css({ position: P.isios4 ? "absolute" : "fixed", top: 0, left: 0, zIndex: s + 100, margin: 0 }); var n = T.win.css("backgroundColor"); return ("" === n || /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(n)) && T.win.css("backgroundColor", "#fff"), T.rail.css({ zIndex: s + 101 }), T.zoom.css({ zIndex: s + 102 }), T.zoom.css("backgroundPosition", "0 -18px"), T.resizeZoom(), T.onzoomin && T.onzoomin.call(T), T.cancelEvent(e) } }, this.doZoomOut = function (e) { if (T.zoomactive) return T.zoomactive = !1, T.win.css("margin", ""), T.win.css(T.zoomrestore.style), P.isios4 && c.scrollTop(T.zoomrestore.scrollTop), T.rail.css({ "z-index": T.zindex }), T.zoom.css({ "z-index": T.zindex }), T.zoomrestore = !1, T.zoom.css("backgroundPosition", "0 0"), T.onResize(), T.onzoomout && T.onzoomout.call(T), T.cancelEvent(e) }, this.doZoom = function (e) { return T.zoomactive ? T.doZoomOut(e) : T.doZoomIn(e) }, this.resizeZoom = function () { if (T.zoomactive) { var e = T.getScrollTop(); T.win.css({ width: c.width() - T.zoomrestore.padding.w + "px", height: c.height() - T.zoomrestore.padding.h + "px" }), T.onResize(), T.setScrollTop(Math.min(T.page.maxh, e)) } }, this.init(), n.nicescroll.push(this) }, y = function (e) { var o = this; this.nc = e, this.lastx = 0, this.lasty = 0, this.speedx = 0, this.speedy = 0, this.lasttime = 0, this.steptime = 0, this.snapx = !1, this.snapy = !1, this.demulx = 0, this.demuly = 0, this.lastscrollx = -1, this.lastscrolly = -1, this.chkx = 0, this.chky = 0, this.timer = 0, this.reset = function (e, t) { o.stop(), o.steptime = 0, o.lasttime = f(), o.speedx = 0, o.speedy = 0, o.lastx = e, o.lasty = t, o.lastscrollx = -1, o.lastscrolly = -1 }, this.update = function (e, t) { var r = f(); o.steptime = r - o.lasttime, o.lasttime = r; var i = t - o.lasty, s = e - o.lastx, n = o.nc.getScrollTop() + i, l = o.nc.getScrollLeft() + s; o.snapx = l < 0 || l > o.nc.page.maxw, o.snapy = n < 0 || n > o.nc.page.maxh, o.speedx = s, o.speedy = i, o.lastx = e, o.lasty = t }, this.stop = function () { o.nc.unsynched("domomentum2d"), o.timer && clearTimeout(o.timer), o.timer = 0, o.lastscrollx = -1, o.lastscrolly = -1 }, this.doSnapy = function (e, t) { var r = !1; t < 0 ? (t = 0, r = !0) : t > o.nc.page.maxh && (t = o.nc.page.maxh, r = !0), e < 0 ? (e = 0, r = !0) : e > o.nc.page.maxw && (e = o.nc.page.maxw, r = !0), r ? o.nc.doScrollPos(e, t, o.nc.opt.snapbackspeed) : o.nc.triggerScrollEnd() }, this.doMomentum = function (e) { var t = f(), r = e ? t + e : o.lasttime, i = o.nc.getScrollLeft(), s = o.nc.getScrollTop(), n = o.nc.page.maxh, l = o.nc.page.maxw; o.speedx = l > 0 ? Math.min(60, o.speedx) : 0, o.speedy = n > 0 ? Math.min(60, o.speedy) : 0; var a = r && t - r <= 60; (s < 0 || s > n || i < 0 || i > l) && (a = !1); var c = !(!o.speedy || !a) && o.speedy, d = !(!o.speedx || !a) && o.speedx; if (c || d) { var u = Math.max(16, o.steptime); if (u > 50) { var h = u / 50; o.speedx *= h, o.speedy *= h, u = 50 } o.demulxy = 0, o.lastscrollx = o.nc.getScrollLeft(), o.chkx = o.lastscrollx, o.lastscrolly = o.nc.getScrollTop(), o.chky = o.lastscrolly; var p = o.lastscrollx, m = o.lastscrolly, g = function () { var e = f() - t > 600 ? .04 : .02; o.speedx && (p = Math.floor(o.lastscrollx - o.speedx * (1 - o.demulxy)), o.lastscrollx = p, (p < 0 || p > l) && (e = .1)), o.speedy && (m = Math.floor(o.lastscrolly - o.speedy * (1 - o.demulxy)), o.lastscrolly = m, (m < 0 || m > n) && (e = .1)), o.demulxy = Math.min(1, o.demulxy + e), o.nc.synched("domomentum2d", function () { if (o.speedx) { o.nc.getScrollLeft(); o.chkx = p, o.nc.setScrollLeft(p) } if (o.speedy) { o.nc.getScrollTop(); o.chky = m, o.nc.setScrollTop(m) } o.timer || (o.nc.hideCursor(), o.doSnapy(p, m)) }), o.demulxy < 1 ? o.timer = setTimeout(g, u) : (o.stop(), o.nc.hideCursor(), o.doSnapy(p, m)) }; g() } else o.doSnapy(o.nc.getScrollLeft(), o.nc.getScrollTop()) } }, x = e.fn.scrollTop; e.cssHooks.pageYOffset = { get: function (e, o, t) { var r = n.data(e, "__nicescroll") || !1; return r && r.ishwscroll ? r.getScrollTop() : x.call(e) }, set: function (e, o) { var t = n.data(e, "__nicescroll") || !1; return t && t.ishwscroll ? t.setScrollTop(parseInt(o)) : x.call(e, o), this } }, e.fn.scrollTop = function (e) { if (void 0 === e) { var o = !!this[0] && (n.data(this[0], "__nicescroll") || !1); return o && o.ishwscroll ? o.getScrollTop() : x.call(this) } return this.each(function () { var o = n.data(this, "__nicescroll") || !1; o && o.ishwscroll ? o.setScrollTop(parseInt(e)) : x.call(n(this), e) }) }; var S = e.fn.scrollLeft; n.cssHooks.pageXOffset = { get: function (e, o, t) { var r = n.data(e, "__nicescroll") || !1; return r && r.ishwscroll ? r.getScrollLeft() : S.call(e) }, set: function (e, o) { var t = n.data(e, "__nicescroll") || !1; return t && t.ishwscroll ? t.setScrollLeft(parseInt(o)) : S.call(e, o), this } }, e.fn.scrollLeft = function (e) { if (void 0 === e) { var o = !!this[0] && (n.data(this[0], "__nicescroll") || !1); return o && o.ishwscroll ? o.getScrollLeft() : S.call(this) } return this.each(function () { var o = n.data(this, "__nicescroll") || !1; o && o.ishwscroll ? o.setScrollLeft(parseInt(e)) : S.call(n(this), e) }) }; var z = function (e) { var o = this; if (this.length = 0, this.name = "nicescrollarray", this.each = function (e) { return n.each(o, e), o }, this.push = function (e) { o[o.length] = e, o.length++ }, this.eq = function (e) { return o[e] }, e) for (var t = 0; t < e.length; t++) { var r = n.data(e[t], "__nicescroll") || !1; r && (this[this.length] = r, this.length++) } return this }; !function (e, o, t) { for (var r = 0, i = o.length; r < i; r++)t(e, o[r]) }(z.prototype, ["show", "hide", "toggle", "onResize", "resize", "remove", "stop", "doScrollPos"], function (e, o) { e[o] = function () { var e = arguments; return this.each(function () { this[o].apply(this, e) }) } }), e.fn.getNiceScroll = function (e) { return void 0 === e ? new z(this) : this[e] && n.data(this[e], "__nicescroll") || !1 }, (e.expr.pseudos || e.expr[":"]).nicescroll = function (e) { return void 0 !== n.data(e, "__nicescroll") }, n.fn.niceScroll = function (e, o) { void 0 !== o || "object" != typeof e || "jquery" in e || (o = e, e = !1); var t = new z; return this.each(function () { var r = n(this), i = n.extend({}, o); if (e) { var s = n(e); i.doc = s.length > 1 ? n(e, r) : s, i.win = r } !("doc" in i) || "win" in i || (i.win = r); var l = r.data("__nicescroll") || !1; l || (i.doc = i.doc || r, l = new b(i, r), r.data("__nicescroll", l)), t.push(l) }), 1 === t.length ? t[0] : t }, a.NiceScroll = { getjQuery: function () { return e } }, n.nicescroll || (n.nicescroll = new z, n.nicescroll.options = g) });

// ==================================================
// fancyBox v3.3.5
//
// Licensed GPLv3 for open source use
// or fancyBox Commercial License for commercial use
//
// http://fancyapps.com/fancybox/
// Copyright 2018 fancyApps
//
// ==================================================
!function (t, e, n, o) {
    "use strict"; function i(t, e) { var o, i, a = [], s = 0; t && t.isDefaultPrevented() || (t.preventDefault(), e = t && t.data ? t.data.options : e || {}, o = e.$target || n(t.currentTarget), i = o.attr("data-fancybox") || "", i ? (a = e.selector ? n(e.selector) : t.data ? t.data.items : [], a = a.length ? a.filter('[data-fancybox="' + i + '"]') : n('[data-fancybox="' + i + '"]'), s = a.index(o), s < 0 && (s = 0)) : a = [o], n.fancybox.open(a, e, s)) } if (t.console = t.console || { info: function (t) { } }, n) {
        if (n.fn.fancybox) return void console.info("fancyBox already initialized"); var a = { loop: !1, gutter: 50, keyboard: !0, arrows: !0, infobar: !0, smallBtn: "auto", toolbar: "auto", buttons: ["zoom", "thumbs", "close"], idleTime: 3, protect: !1, modal: !1, image: { preload: !1 }, ajax: { settings: { data: { fancybox: !0 } } }, iframe: { tpl: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" src=""></iframe>', preload: !0, css: {}, attr: { scrolling: "auto" } }, defaultType: "image", animationEffect: "zoom", animationDuration: 366, zoomOpacity: "auto", transitionEffect: "fade", transitionDuration: 366, slideClass: "", baseClass: "", baseTpl: '<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><div class="fancybox-toolbar">{{buttons}}</div><div class="fancybox-navigation">{{arrows}}</div><div class="fancybox-stage"></div><div class="fancybox-caption"></div></div></div>', spinnerTpl: '<div class="fancybox-loading"></div>', errorTpl: '<div class="fancybox-error"><p>{{ERROR}}</p></div>', btnTpl: { download: '<a download data-fancybox-download class="fancybox-button fancybox-button--download" title="{{DOWNLOAD}}" href="javascript:;"><svg viewBox="0 0 40 40"><path d="M13,16 L20,23 L27,16 M20,7 L20,23 M10,24 L10,28 L30,28 L30,24" /></svg></a>', zoom: '<button data-fancybox-zoom class="fancybox-button fancybox-button--zoom" title="{{ZOOM}}"><svg viewBox="0 0 40 40"><path d="M18,17 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 M24,22 L31,29" /></svg></button>', close: '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"><svg viewBox="0 0 40 40"><path d="M10,10 L30,30 M30,10 L10,30" /></svg></button>', smallBtn: '<button data-fancybox-close class="fancybox-close-small" title="{{CLOSE}}"><svg viewBox="0 0 32 32"><path d="M10,10 L22,22 M22,10 L10,22"></path></svg></button>', arrowLeft: '<a data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}" href="javascript:;"><svg viewBox="0 0 40 40"><path d="M18,12 L10,20 L18,28 M10,20 L30,20"></path></svg></a>', arrowRight: '<a data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}" href="javascript:;"><svg viewBox="0 0 40 40"><path d="M10,20 L30,20 M22,12 L30,20 L22,28"></path></svg></a>' }, parentEl: "body", autoFocus: !1, backFocus: !0, trapFocus: !0, fullScreen: { autoStart: !1 }, touch: { vertical: !0, momentum: !0 }, hash: null, media: {}, slideShow: { autoStart: !1, speed: 4e3 }, thumbs: { autoStart: !1, hideOnClose: !0, parentEl: ".fancybox-container", axis: "y" }, wheel: "auto", onInit: n.noop, beforeLoad: n.noop, afterLoad: n.noop, beforeShow: n.noop, afterShow: n.noop, beforeClose: n.noop, afterClose: n.noop, onActivate: n.noop, onDeactivate: n.noop, clickContent: function (t, e) { return "image" === t.type && "zoom" }, clickSlide: "close", clickOutside: "close", dblclickContent: !1, dblclickSlide: !1, dblclickOutside: !1, mobile: { idleTime: !1, clickContent: function (t, e) { return "image" === t.type && "toggleControls" }, clickSlide: function (t, e) { return "image" === t.type ? "toggleControls" : "close" }, dblclickContent: function (t, e) { return "image" === t.type && "zoom" }, dblclickSlide: function (t, e) { return "image" === t.type && "zoom" } }, lang: "en", i18n: { en: { CLOSE: "Close", NEXT: "Next", PREV: "Previous", ERROR: "The requested content cannot be loaded. <br/> Please try again later.", PLAY_START: "Start slideshow", PLAY_STOP: "Pause slideshow", FULL_SCREEN: "Full screen", THUMBS: "Thumbnails", DOWNLOAD: "Download", SHARE: "Share", ZOOM: "Zoom" }, de: { CLOSE: "Schliessen", NEXT: "Weiter", PREV: "Zurück", ERROR: "Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es später nochmal.", PLAY_START: "Diaschau starten", PLAY_STOP: "Diaschau beenden", FULL_SCREEN: "Vollbild", THUMBS: "Vorschaubilder", DOWNLOAD: "Herunterladen", SHARE: "Teilen", ZOOM: "Maßstab" } } }, s = n(t), r = n(e), c = 0, l = function (t) { return t && t.hasOwnProperty && t instanceof n }, d = function () { return t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || function (e) { return t.setTimeout(e, 1e3 / 60) } }(), u = function () { var t, n = e.createElement("fakeelement"), i = { transition: "transitionend", OTransition: "oTransitionEnd", MozTransition: "transitionend", WebkitTransition: "webkitTransitionEnd" }; for (t in i) if (n.style[t] !== o) return i[t]; return "transitionend" }(), f = function (t) { return t && t.length && t[0].offsetHeight }, p = function (t, e) { var o = n.extend(!0, {}, t, e); return n.each(e, function (t, e) { n.isArray(e) && (o[t] = e) }), o }, h = function (t, o, i) { var a = this; a.opts = p({ index: i }, n.fancybox.defaults), n.isPlainObject(o) && (a.opts = p(a.opts, o)), n.fancybox.isMobile && (a.opts = p(a.opts, a.opts.mobile)), a.id = a.opts.id || ++c, a.currIndex = parseInt(a.opts.index, 10) || 0, a.prevIndex = null, a.prevPos = null, a.currPos = 0, a.firstRun = !0, a.group = [], a.slides = {}, a.addContent(t), a.group.length && (a.$lastFocus = n(e.activeElement).trigger("blur"), a.init()) }; n.extend(h.prototype, { init: function () { var i, a, s, r = this, c = r.group[r.currIndex], l = c.opts, d = n.fancybox.scrollbarWidth; n.fancybox.getInstance() || l.hideScrollbar === !1 || (n("body").addClass("fancybox-active"), !n.fancybox.isMobile && e.body.scrollHeight > t.innerHeight && (d === o && (i = n('<div style="width:100px;height:100px;overflow:scroll;" />').appendTo("body"), d = n.fancybox.scrollbarWidth = i[0].offsetWidth - i[0].clientWidth, i.remove()), n("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar { margin-right: ' + d + "px; }</style>"), n("body").addClass("compensate-for-scrollbar"))), s = "", n.each(l.buttons, function (t, e) { s += l.btnTpl[e] || "" }), a = n(r.translate(r, l.baseTpl.replace("{{buttons}}", s).replace("{{arrows}}", l.btnTpl.arrowLeft + l.btnTpl.arrowRight))).attr("id", "fancybox-container-" + r.id).addClass("fancybox-is-hidden").addClass(l.baseClass).data("FancyBox", r).appendTo(l.parentEl), r.$refs = { container: a }, ["bg", "inner", "infobar", "toolbar", "stage", "caption", "navigation"].forEach(function (t) { r.$refs[t] = a.find(".fancybox-" + t) }), r.trigger("onInit"), r.activate(), r.jumpTo(r.currIndex) }, translate: function (t, e) { var n = t.opts.i18n[t.opts.lang]; return e.replace(/\{\{(\w+)\}\}/g, function (t, e) { var i = n[e]; return i === o ? t : i }) }, addContent: function (t) { var e, i = this, a = n.makeArray(t); n.each(a, function (t, e) { var a, s, r, c, l, d = {}, u = {}; n.isPlainObject(e) ? (d = e, u = e.opts || e) : "object" === n.type(e) && n(e).length ? (a = n(e), u = a.data() || {}, u = n.extend(!0, {}, u, u.options), u.$orig = a, d.src = i.opts.src || u.src || a.attr("href"), d.type || d.src || (d.type = "inline", d.src = e)) : d = { type: "html", src: e + "" }, d.opts = n.extend(!0, {}, i.opts, u), n.isArray(u.buttons) && (d.opts.buttons = u.buttons), s = d.type || d.opts.type, c = d.src || "", !s && c && ((r = c.match(/\.(mp4|mov|ogv)((\?|#).*)?$/i)) ? (s = "video", d.opts.videoFormat || (d.opts.videoFormat = "video/" + ("ogv" === r[1] ? "ogg" : r[1]))) : c.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? s = "image" : c.match(/\.(pdf)((\?|#).*)?$/i) ? s = "iframe" : "#" === c.charAt(0) && (s = "inline")), s ? d.type = s : i.trigger("objectNeedsType", d), d.contentType || (d.contentType = n.inArray(d.type, ["html", "inline", "ajax"]) > -1 ? "html" : d.type), d.index = i.group.length, "auto" == d.opts.smallBtn && (d.opts.smallBtn = n.inArray(d.type, ["html", "inline", "ajax"]) > -1), "auto" === d.opts.toolbar && (d.opts.toolbar = !d.opts.smallBtn), d.opts.$trigger && d.index === i.opts.index && (d.opts.$thumb = d.opts.$trigger.find("img:first")), d.opts.$thumb && d.opts.$thumb.length || !d.opts.$orig || (d.opts.$thumb = d.opts.$orig.find("img:first")), "function" === n.type(d.opts.caption) && (d.opts.caption = d.opts.caption.apply(e, [i, d])), "function" === n.type(i.opts.caption) && (d.opts.caption = i.opts.caption.apply(e, [i, d])), d.opts.caption instanceof n || (d.opts.caption = d.opts.caption === o ? "" : d.opts.caption + ""), "ajax" === d.type && (l = c.split(/\s+/, 2), l.length > 1 && (d.src = l.shift(), d.opts.filter = l.shift())), d.opts.modal && (d.opts = n.extend(!0, d.opts, { infobar: 0, toolbar: 0, smallBtn: 0, keyboard: 0, slideShow: 0, fullScreen: 0, thumbs: 0, touch: 0, clickContent: !1, clickSlide: !1, clickOutside: !1, dblclickContent: !1, dblclickSlide: !1, dblclickOutside: !1 })), i.group.push(d) }), Object.keys(i.slides).length && (i.updateControls(), e = i.Thumbs, e && e.isActive && (e.create(), e.focus())) }, addEvents: function () { var o = this; o.removeEvents(), o.$refs.container.on("click.fb-close", "[data-fancybox-close]", function (t) { t.stopPropagation(), t.preventDefault(), o.close(t) }).on("touchstart.fb-prev click.fb-prev", "[data-fancybox-prev]", function (t) { t.stopPropagation(), t.preventDefault(), o.previous() }).on("touchstart.fb-next click.fb-next", "[data-fancybox-next]", function (t) { t.stopPropagation(), t.preventDefault(), o.next() }).on("click.fb", "[data-fancybox-zoom]", function (t) { o[o.isScaledDown() ? "scaleToActual" : "scaleToFit"]() }), s.on("orientationchange.fb resize.fb", function (t) { t && t.originalEvent && "resize" === t.originalEvent.type ? d(function () { o.update() }) : (o.$refs.stage.hide(), setTimeout(function () { o.$refs.stage.show(), o.update() }, n.fancybox.isMobile ? 600 : 250)) }), r.on("focusin.fb", function (t) { var o = n.fancybox ? n.fancybox.getInstance() : null; o.isClosing || !o.current || !o.current.opts.trapFocus || n(t.target).hasClass("fancybox-container") || n(t.target).is(e) || o && "fixed" !== n(t.target).css("position") && !o.$refs.container.has(t.target).length && (t.stopPropagation(), o.focus()) }), r.on("keydown.fb", function (t) { var e = o.current, i = t.keyCode || t.which; if (e && e.opts.keyboard && !(t.ctrlKey || t.altKey || t.shiftKey || n(t.target).is("input") || n(t.target).is("textarea"))) return 8 === i || 27 === i ? (t.preventDefault(), void o.close(t)) : 37 === i || 38 === i ? (t.preventDefault(), void o.previous()) : 39 === i || 40 === i ? (t.preventDefault(), void o.next()) : void o.trigger("afterKeydown", t, i) }), o.group[o.currIndex].opts.idleTime && (o.idleSecondsCounter = 0, r.on("mousemove.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle", function (t) { o.idleSecondsCounter = 0, o.isIdle && o.showControls(), o.isIdle = !1 }), o.idleInterval = t.setInterval(function () { o.idleSecondsCounter++ , o.idleSecondsCounter >= o.group[o.currIndex].opts.idleTime && !o.isDragging && (o.isIdle = !0, o.idleSecondsCounter = 0, o.hideControls()) }, 1e3)) }, removeEvents: function () { var e = this; s.off("orientationchange.fb resize.fb"), r.off("focusin.fb keydown.fb .fb-idle"), this.$refs.container.off(".fb-close .fb-prev .fb-next"), e.idleInterval && (t.clearInterval(e.idleInterval), e.idleInterval = null) }, previous: function (t) { return this.jumpTo(this.currPos - 1, t) }, next: function (t) { return this.jumpTo(this.currPos + 1, t) }, jumpTo: function (t, e) { var i, a, s, r, c, l, d, u = this, p = u.group.length; if (!(u.isDragging || u.isClosing || u.isAnimating && u.firstRun)) { if (t = parseInt(t, 10), a = u.current ? u.current.opts.loop : u.opts.loop, !a && (t < 0 || t >= p)) return !1; if (i = u.firstRun = !Object.keys(u.slides).length, !(p < 2 && !i && u.isDragging)) { if (r = u.current, u.prevIndex = u.currIndex, u.prevPos = u.currPos, s = u.createSlide(t), p > 1 && ((a || s.index > 0) && u.createSlide(t - 1), (a || s.index < p - 1) && u.createSlide(t + 1)), u.current = s, u.currIndex = s.index, u.currPos = s.pos, u.trigger("beforeShow", i), u.updateControls(), l = n.fancybox.getTranslate(s.$slide), s.isMoved = (0 !== l.left || 0 !== l.top) && !s.$slide.hasClass("fancybox-animated"), s.forcedDuration = o, n.isNumeric(e) ? s.forcedDuration = e : e = s.opts[i ? "animationDuration" : "transitionDuration"], e = parseInt(e, 10), i) return s.opts.animationEffect && e && u.$refs.container.css("transition-duration", e + "ms"), u.$refs.container.removeClass("fancybox-is-hidden"), f(u.$refs.container), u.$refs.container.addClass("fancybox-is-open"), f(u.$refs.container), s.$slide.addClass("fancybox-slide--previous"), u.loadSlide(s), s.$slide.removeClass("fancybox-slide--previous").addClass("fancybox-slide--current"), void u.preload("image"); n.each(u.slides, function (t, e) { n.fancybox.stop(e.$slide) }), s.$slide.removeClass("fancybox-slide--next fancybox-slide--previous").addClass("fancybox-slide--current"), s.isMoved ? (c = Math.round(s.$slide.width()), n.each(u.slides, function (t, o) { var i = o.pos - s.pos; n.fancybox.animate(o.$slide, { top: 0, left: i * c + i * o.opts.gutter }, e, function () { o.$slide.removeAttr("style").removeClass("fancybox-slide--next fancybox-slide--previous"), o.pos === u.currPos && (s.isMoved = !1, u.complete()) }) })) : u.$refs.stage.children().removeAttr("style"), s.isLoaded ? u.revealContent(s) : u.loadSlide(s), u.preload("image"), r.pos !== s.pos && (d = "fancybox-slide--" + (r.pos > s.pos ? "next" : "previous"), r.$slide.removeClass("fancybox-slide--complete fancybox-slide--current fancybox-slide--next fancybox-slide--previous"), r.isComplete = !1, e && (s.isMoved || s.opts.transitionEffect) && (s.isMoved ? r.$slide.addClass(d) : (d = "fancybox-animated " + d + " fancybox-fx-" + s.opts.transitionEffect, n.fancybox.animate(r.$slide, d, e, function () { r.$slide.removeClass(d).removeAttr("style") })))) } } }, createSlide: function (t) { var e, o, i = this; return o = t % i.group.length, o = o < 0 ? i.group.length + o : o, !i.slides[t] && i.group[o] && (e = n('<div class="fancybox-slide"></div>').appendTo(i.$refs.stage), i.slides[t] = n.extend(!0, {}, i.group[o], { pos: t, $slide: e, isLoaded: !1 }), i.updateSlide(i.slides[t])), i.slides[t] }, scaleToActual: function (t, e, i) { var a, s, r, c, l, d = this, u = d.current, f = u.$content, p = n.fancybox.getTranslate(u.$slide).width, h = n.fancybox.getTranslate(u.$slide).height, g = u.width, b = u.height; !d.isAnimating && f && "image" == u.type && u.isLoaded && !u.hasError && (n.fancybox.stop(f), d.isAnimating = !0, t = t === o ? .5 * p : t, e = e === o ? .5 * h : e, a = n.fancybox.getTranslate(f), a.top -= n.fancybox.getTranslate(u.$slide).top, a.left -= n.fancybox.getTranslate(u.$slide).left, c = g / a.width, l = b / a.height, s = .5 * p - .5 * g, r = .5 * h - .5 * b, g > p && (s = a.left * c - (t * c - t), s > 0 && (s = 0), s < p - g && (s = p - g)), b > h && (r = a.top * l - (e * l - e), r > 0 && (r = 0), r < h - b && (r = h - b)), d.updateCursor(g, b), n.fancybox.animate(f, { top: r, left: s, scaleX: c, scaleY: l }, i || 330, function () { d.isAnimating = !1 }), d.SlideShow && d.SlideShow.isActive && d.SlideShow.stop()) }, scaleToFit: function (t) { var e, o = this, i = o.current, a = i.$content; !o.isAnimating && a && "image" == i.type && i.isLoaded && !i.hasError && (n.fancybox.stop(a), o.isAnimating = !0, e = o.getFitPos(i), o.updateCursor(e.width, e.height), n.fancybox.animate(a, { top: e.top, left: e.left, scaleX: e.width / a.width(), scaleY: e.height / a.height() }, t || 330, function () { o.isAnimating = !1 })) }, getFitPos: function (t) { var e, n, o, i, a, s = this, r = t.$content, c = t.width || t.opts.width, l = t.height || t.opts.height, d = {}; return !!(t.isLoaded && r && r.length) && (i = { top: parseInt(t.$slide.css("paddingTop"), 10), right: parseInt(t.$slide.css("paddingRight"), 10), bottom: parseInt(t.$slide.css("paddingBottom"), 10), left: parseInt(t.$slide.css("paddingLeft"), 10) }, e = parseInt(s.$refs.stage.width(), 10) - (i.left + i.right), n = parseInt(s.$refs.stage.height(), 10) - (i.top + i.bottom), c && l || (c = e, l = n), o = Math.min(1, e / c, n / l), c = Math.floor(o * c), l = Math.floor(o * l), "image" === t.type ? (d.top = Math.floor(.5 * (n - l)) + i.top, d.left = Math.floor(.5 * (e - c)) + i.left) : "video" === t.contentType && (a = t.opts.width && t.opts.height ? c / l : t.opts.ratio || 16 / 9, l > c / a ? l = c / a : c > l * a && (c = l * a)), d.width = c, d.height = l, d) }, update: function () { var t = this; n.each(t.slides, function (e, n) { t.updateSlide(n) }) }, updateSlide: function (t, e) { var o = this, i = t && t.$content, a = t.width || t.opts.width, s = t.height || t.opts.height; i && (a || s || "video" === t.contentType) && !t.hasError && (n.fancybox.stop(i), n.fancybox.setTranslate(i, o.getFitPos(t)), t.pos === o.currPos && (o.isAnimating = !1, o.updateCursor())), t.$slide.trigger("refresh"), o.$refs.toolbar.toggleClass("compensate-for-scrollbar", t.$slide.get(0).scrollHeight > t.$slide.get(0).clientHeight), o.trigger("onUpdate", t) }, centerSlide: function (t, e) { var i, a, s = this; s.current && (i = Math.round(t.$slide.width()), a = t.pos - s.current.pos, n.fancybox.animate(t.$slide, { top: 0, left: a * i + a * t.opts.gutter, opacity: 1 }, e === o ? 0 : e, null, !1)) }, updateCursor: function (t, e) { var o, i = this, a = i.current, s = i.$refs.container.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-drag fancybox-can-zoomOut"); a && !i.isClosing && (o = i.isZoomable(), s.toggleClass("fancybox-is-zoomable", o), n("[data-fancybox-zoom]").prop("disabled", !o), o && ("zoom" === a.opts.clickContent || n.isFunction(a.opts.clickContent) && "zoom" === a.opts.clickContent(a)) ? i.isScaledDown(t, e) ? s.addClass("fancybox-can-zoomIn") : a.opts.touch ? s.addClass("fancybox-can-drag") : s.addClass("fancybox-can-zoomOut") : a.opts.touch && "video" !== a.contentType && s.addClass("fancybox-can-drag")) }, isZoomable: function () { var t, e = this, n = e.current; if (n && !e.isClosing && "image" === n.type && !n.hasError) { if (!n.isLoaded) return !0; if (t = e.getFitPos(n), n.width > t.width || n.height > t.height) return !0 } return !1 }, isScaledDown: function (t, e) { var i = this, a = !1, s = i.current, r = s.$content; return t !== o && e !== o ? a = t < s.width && e < s.height : r && (a = n.fancybox.getTranslate(r), a = a.width < s.width && a.height < s.height), a }, canPan: function () { var t, e = this, n = !1, o = e.current; return "image" === o.type && (t = o.$content) && !o.hasError && (n = e.getFitPos(o), n = Math.abs(t.width() - n.width) > 1 || Math.abs(t.height() - n.height) > 1), n }, loadSlide: function (t) { var e, o, i, a = this; if (!t.isLoading && !t.isLoaded) { switch (t.isLoading = !0, a.trigger("beforeLoad", t), e = t.type, o = t.$slide, o.off("refresh").trigger("onReset").addClass(t.opts.slideClass), e) { case "image": a.setImage(t); break; case "iframe": a.setIframe(t); break; case "html": a.setContent(t, t.src || t.content); break; case "video": a.setContent(t, '<video class="fancybox-video" controls controlsList="nodownload"><source src="' + t.src + '" type="' + t.opts.videoFormat + "\">Your browser doesn't support HTML5 video</video"); break; case "inline": n(t.src).length ? a.setContent(t, n(t.src)) : a.setError(t); break; case "ajax": a.showLoading(t), i = n.ajax(n.extend({}, t.opts.ajax.settings, { url: t.src, success: function (e, n) { "success" === n && a.setContent(t, e) }, error: function (e, n) { e && "abort" !== n && a.setError(t) } })), o.one("onReset", function () { i.abort() }); break; default: a.setError(t) }return !0 } }, setImage: function (e) { var o, i, a, s, r, c = this, l = e.opts.srcset || e.opts.image.srcset; if (e.timouts = setTimeout(function () { var t = e.$image; !e.isLoading || t && t[0].complete || e.hasError || c.showLoading(e) }, 350), l) { s = t.devicePixelRatio || 1, r = t.innerWidth * s, a = l.split(",").map(function (t) { var e = {}; return t.trim().split(/\s+/).forEach(function (t, n) { var o = parseInt(t.substring(0, t.length - 1), 10); return 0 === n ? e.url = t : void (o && (e.value = o, e.postfix = t[t.length - 1])) }), e }), a.sort(function (t, e) { return t.value - e.value }); for (var d = 0; d < a.length; d++) { var u = a[d]; if ("w" === u.postfix && u.value >= r || "x" === u.postfix && u.value >= s) { i = u; break } } !i && a.length && (i = a[a.length - 1]), i && (e.src = i.url, e.width && e.height && "w" == i.postfix && (e.height = e.width / e.height * i.value, e.width = i.value), e.opts.srcset = l) } e.$content = n('<div class="fancybox-content"></div>').addClass("fancybox-is-hidden").appendTo(e.$slide.addClass("fancybox-slide--image")), o = e.opts.thumb || !(!e.opts.$thumb || !e.opts.$thumb.length) && e.opts.$thumb.attr("src"), e.opts.preload !== !1 && e.opts.width && e.opts.height && o && (e.width = e.opts.width, e.height = e.opts.height, e.$ghost = n("<img />").one("error", function () { n(this).remove(), e.$ghost = null }).one("load", function () { c.afterLoad(e) }).addClass("fancybox-image").appendTo(e.$content).attr("src", o)), c.setBigImage(e) }, setBigImage: function (t) { var e = this, o = n("<img />"); t.$image = o.one("error", function () { e.setError(t) }).one("load", function () { var n; t.$ghost || (e.resolveImageSlideSize(t, this.naturalWidth, this.naturalHeight), e.afterLoad(t)), t.timouts && (clearTimeout(t.timouts), t.timouts = null), e.isClosing || (t.opts.srcset && (n = t.opts.sizes, n && "auto" !== n || (n = (t.width / t.height > 1 && s.width() / s.height() > 1 ? "100" : Math.round(t.width / t.height * 100)) + "vw"), o.attr("sizes", n).attr("srcset", t.opts.srcset)), t.$ghost && setTimeout(function () { t.$ghost && !e.isClosing && t.$ghost.hide() }, Math.min(300, Math.max(1e3, t.height / 1600))), e.hideLoading(t)) }).addClass("fancybox-image").attr("src", t.src).appendTo(t.$content), (o[0].complete || "complete" == o[0].readyState) && o[0].naturalWidth && o[0].naturalHeight ? o.trigger("load") : o[0].error && o.trigger("error") }, resolveImageSlideSize: function (t, e, n) { var o = parseInt(t.opts.width, 10), i = parseInt(t.opts.height, 10); t.width = e, t.height = n, o > 0 && (t.width = o, t.height = Math.floor(o * n / e)), i > 0 && (t.width = Math.floor(i * e / n), t.height = i) }, setIframe: function (t) { var e, i = this, a = t.opts.iframe, s = t.$slide; t.$content = n('<div class="fancybox-content' + (a.preload ? " fancybox-is-hidden" : "") + '"></div>').css(a.css).appendTo(s), s.addClass("fancybox-slide--" + t.contentType), t.$iframe = e = n(a.tpl.replace(/\{rnd\}/g, (new Date).getTime())).attr(a.attr).appendTo(t.$content), a.preload ? (i.showLoading(t), e.on("load.fb error.fb", function (e) { this.isReady = 1, t.$slide.trigger("refresh"), i.afterLoad(t) }), s.on("refresh.fb", function () { var n, i, s = t.$content, r = a.css.width, c = a.css.height; if (1 === e[0].isReady) { try { n = e.contents(), i = n.find("body") } catch (t) { } i && i.length && i.children().length && (s.css({ width: "", height: "" }), r === o && (r = Math.ceil(Math.max(i[0].clientWidth, i.outerWidth(!0)))), r && s.width(r), c === o && (c = Math.ceil(Math.max(i[0].clientHeight, i.outerHeight(!0)))), c && s.height(c)), s.removeClass("fancybox-is-hidden") } })) : this.afterLoad(t), e.attr("src", t.src), s.one("onReset", function () { try { n(this).find("iframe").hide().unbind().attr("src", "//about:blank") } catch (t) { } n(this).off("refresh.fb").empty(), t.isLoaded = !1 }) }, setContent: function (t, e) { var o = this; o.isClosing || (o.hideLoading(t), t.$content && n.fancybox.stop(t.$content), t.$slide.empty(), l(e) && e.parent().length ? (e.parent().parent(".fancybox-slide--inline").trigger("onReset"), t.$placeholder = n("<div>").hide().insertAfter(e), e.css("display", "inline-block")) : t.hasError || ("string" === n.type(e) && (e = n("<div>").append(n.trim(e)).contents(), 3 === e[0].nodeType && (e = n("<div>").html(e))), t.opts.filter && (e = n("<div>").html(e).find(t.opts.filter))), t.$slide.one("onReset", function () { n(this).find("video,audio").trigger("pause"), t.$placeholder && (t.$placeholder.after(e.hide()).remove(), t.$placeholder = null), t.$smallBtn && (t.$smallBtn.remove(), t.$smallBtn = null), t.hasError || (n(this).empty(), t.isLoaded = !1) }), n(e).appendTo(t.$slide), n(e).is("video,audio") && (n(e).addClass("fancybox-video"), n(e).wrap("<div></div>"), t.contentType = "video", t.opts.width = t.opts.width || n(e).attr("width"), t.opts.height = t.opts.height || n(e).attr("height")), t.$content = t.$slide.children().filter("div,form,main,video,audio").first().addClass("fancybox-content"), t.$slide.addClass("fancybox-slide--" + t.contentType), this.afterLoad(t)) }, setError: function (t) { t.hasError = !0, t.$slide.trigger("onReset").removeClass("fancybox-slide--" + t.contentType).addClass("fancybox-slide--error"), t.contentType = "html", this.setContent(t, this.translate(t, t.opts.errorTpl)), t.pos === this.currPos && (this.isAnimating = !1) }, showLoading: function (t) { var e = this; t = t || e.current, t && !t.$spinner && (t.$spinner = n(e.translate(e, e.opts.spinnerTpl)).appendTo(t.$slide)) }, hideLoading: function (t) { var e = this; t = t || e.current, t && t.$spinner && (t.$spinner.remove(), delete t.$spinner) }, afterLoad: function (t) { var e = this; e.isClosing || (t.isLoading = !1, t.isLoaded = !0, e.trigger("afterLoad", t), e.hideLoading(t), t.pos === e.currPos && e.updateCursor(), !t.opts.smallBtn || t.$smallBtn && t.$smallBtn.length || (t.$smallBtn = n(e.translate(t, t.opts.btnTpl.smallBtn)).prependTo(t.$content)), t.opts.protect && t.$content && !t.hasError && (t.$content.on("contextmenu.fb", function (t) { return 2 == t.button && t.preventDefault(), !0 }), "image" === t.type && n('<div class="fancybox-spaceball"></div>').appendTo(t.$content)), e.revealContent(t)) }, revealContent: function (t) { var e, i, a, s, r = this, c = t.$slide, l = !1, d = !1; return e = t.opts[r.firstRun ? "animationEffect" : "transitionEffect"], a = t.opts[r.firstRun ? "animationDuration" : "transitionDuration"], a = parseInt(t.forcedDuration === o ? a : t.forcedDuration, 10), t.pos === r.currPos && (t.isComplete ? e = !1 : r.isAnimating = !0), !t.isMoved && t.pos === r.currPos && a || (e = !1), "zoom" === e && (t.pos === r.currPos && a && "image" === t.type && !t.hasError && (d = r.getThumbPos(t)) ? l = r.getFitPos(t) : e = "fade"), "zoom" === e ? (l.scaleX = l.width / d.width, l.scaleY = l.height / d.height, s = t.opts.zoomOpacity, "auto" == s && (s = Math.abs(t.width / t.height - d.width / d.height) > .1), s && (d.opacity = .1, l.opacity = 1), n.fancybox.setTranslate(t.$content.removeClass("fancybox-is-hidden"), d), f(t.$content), void n.fancybox.animate(t.$content, l, a, function () { r.isAnimating = !1, r.complete() })) : (r.updateSlide(t), e ? (n.fancybox.stop(c), i = "fancybox-animated fancybox-slide--" + (t.pos >= r.prevPos ? "next" : "previous") + " fancybox-fx-" + e, c.removeAttr("style").removeClass("fancybox-slide--current fancybox-slide--next fancybox-slide--previous").addClass(i), t.$content.removeClass("fancybox-is-hidden"), f(c), void n.fancybox.animate(c, "fancybox-slide--current", a, function (e) { c.removeClass(i).removeAttr("style"), t.pos === r.currPos && r.complete() }, !0)) : (f(c), t.$content.removeClass("fancybox-is-hidden"), void (t.pos === r.currPos && r.complete()))) }, getThumbPos: function (o) { var i, a = this, s = !1, r = o.opts.$thumb, c = r && r.length && r[0].ownerDocument === e ? r.offset() : 0, l = function (e) { for (var o, i = e[0], a = i.getBoundingClientRect(), s = []; null !== i.parentElement;)"hidden" !== n(i.parentElement).css("overflow") && "auto" !== n(i.parentElement).css("overflow") || s.push(i.parentElement.getBoundingClientRect()), i = i.parentElement; return o = s.every(function (t) { var e = Math.min(a.right, t.right) - Math.max(a.left, t.left), n = Math.min(a.bottom, t.bottom) - Math.max(a.top, t.top); return e > 0 && n > 0 }), o && a.bottom > 0 && a.right > 0 && a.left < n(t).width() && a.top < n(t).height() }; return c && l(r) && (i = a.$refs.stage.offset(), s = { top: c.top - i.top + parseFloat(r.css("border-top-width") || 0), left: c.left - i.left + parseFloat(r.css("border-left-width") || 0), width: r.width(), height: r.height(), scaleX: 1, scaleY: 1 }), s }, complete: function () { var t = this, o = t.current, i = {}; !o.isMoved && o.isLoaded && (o.isComplete || (o.isComplete = !0, o.$slide.siblings().trigger("onReset"), t.preload("inline"), f(o.$slide), o.$slide.addClass("fancybox-slide--complete"), n.each(t.slides, function (e, o) { o.pos >= t.currPos - 1 && o.pos <= t.currPos + 1 ? i[o.pos] = o : o && (n.fancybox.stop(o.$slide), o.$slide.off().remove()) }), t.slides = i), t.isAnimating = !1, t.updateCursor(), t.trigger("afterShow"), o.$slide.find("video,audio").filter(":visible:first").trigger("play"), (n(e.activeElement).is("[disabled]") || o.opts.autoFocus && "image" != o.type && "iframe" !== o.type) && t.focus()) }, preload: function (t) { var e = this, n = e.slides[e.currPos + 1], o = e.slides[e.currPos - 1]; n && n.type === t && e.loadSlide(n), o && o.type === t && e.loadSlide(o) }, focus: function () { var t, e = this.current; this.isClosing || e && e.isComplete && e.$content && (t = e.$content.find("input[autofocus]:enabled:visible:first"), t.length || (t = e.$content.find("button,:input,[tabindex],a").filter(":enabled:visible:first")), t = t && t.length ? t : e.$content, t.trigger("focus")) }, activate: function () { var t = this; n(".fancybox-container").each(function () { var e = n(this).data("FancyBox"); e && e.id !== t.id && !e.isClosing && (e.trigger("onDeactivate"), e.removeEvents(), e.isVisible = !1) }), t.isVisible = !0, (t.current || t.isIdle) && (t.update(), t.updateControls()), t.trigger("onActivate"), t.addEvents() }, close: function (t, e) { var o, i, a, s, r, c, l, p = this, h = p.current, g = function () { p.cleanUp(t) }; return !p.isClosing && (p.isClosing = !0, p.trigger("beforeClose", t) === !1 ? (p.isClosing = !1, d(function () { p.update() }), !1) : (p.removeEvents(), h.timouts && clearTimeout(h.timouts), a = h.$content, o = h.opts.animationEffect, i = n.isNumeric(e) ? e : o ? h.opts.animationDuration : 0, h.$slide.off(u).removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"), h.$slide.siblings().trigger("onReset").remove(), i && p.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing"), p.hideLoading(h), p.hideControls(), p.updateCursor(), "zoom" !== o || t !== !0 && a && i && "image" === h.type && !h.hasError && (l = p.getThumbPos(h)) || (o = "fade"), "zoom" === o ? (n.fancybox.stop(a), s = n.fancybox.getTranslate(a), c = { top: s.top, left: s.left, scaleX: s.width / l.width, scaleY: s.height / l.height, width: l.width, height: l.height }, r = h.opts.zoomOpacity, "auto" == r && (r = Math.abs(h.width / h.height - l.width / l.height) > .1), r && (l.opacity = 0), n.fancybox.setTranslate(a, c), f(a), n.fancybox.animate(a, l, i, g), !0) : (o && i ? t === !0 ? setTimeout(g, i) : n.fancybox.animate(h.$slide.removeClass("fancybox-slide--current"), "fancybox-animated fancybox-slide--previous fancybox-fx-" + o, i, g) : g(), !0))) }, cleanUp: function (t) { var e, o = this, i = n("body"); o.current.$slide.trigger("onReset"), o.$refs.container.empty().remove(), o.trigger("afterClose", t), o.$lastFocus && o.current.opts.backFocus && o.$lastFocus.trigger("focus"), o.current = null, e = n.fancybox.getInstance(), e ? e.activate() : (i.removeClass("fancybox-active compensate-for-scrollbar"), n("#fancybox-style-noscroll").remove()) }, trigger: function (t, e) { var o, i = Array.prototype.slice.call(arguments, 1), a = this, s = e && e.opts ? e : a.current; return s ? i.unshift(s) : s = a, i.unshift(a), n.isFunction(s.opts[t]) && (o = s.opts[t].apply(s, i)), o === !1 ? o : void ("afterClose" !== t && a.$refs ? a.$refs.container.trigger(t + ".fb", i) : r.trigger(t + ".fb", i)) }, updateControls: function (t) { var e = this, n = e.current, o = n.index, i = n.opts.caption, a = e.$refs.container, s = e.$refs.caption; n.$slide.trigger("refresh"), e.$caption = i && i.length ? s.html(i) : null, e.isHiddenControls || e.isIdle || e.showControls(), a.find("[data-fancybox-count]").html(e.group.length), a.find("[data-fancybox-index]").html(o + 1), a.find("[data-fancybox-prev]").toggleClass("disabled", !n.opts.loop && o <= 0), a.find("[data-fancybox-next]").toggleClass("disabled", !n.opts.loop && o >= e.group.length - 1), "image" === n.type ? a.find("[data-fancybox-zoom]").show().end().find("[data-fancybox-download]").attr("href", n.opts.image.src || n.src).show() : n.opts.toolbar && a.find("[data-fancybox-download],[data-fancybox-zoom]").hide() }, hideControls: function () { this.isHiddenControls = !0, this.$refs.container.removeClass("fancybox-show-infobar fancybox-show-toolbar fancybox-show-caption fancybox-show-nav") }, showControls: function () { var t = this, e = t.current ? t.current.opts : t.opts, n = t.$refs.container; t.isHiddenControls = !1, t.idleSecondsCounter = 0, n.toggleClass("fancybox-show-toolbar", !(!e.toolbar || !e.buttons)).toggleClass("fancybox-show-infobar", !!(e.infobar && t.group.length > 1)).toggleClass("fancybox-show-nav", !!(e.arrows && t.group.length > 1)).toggleClass("fancybox-is-modal", !!e.modal), t.$caption ? n.addClass("fancybox-show-caption ") : n.removeClass("fancybox-show-caption") }, toggleControls: function () { this.isHiddenControls ? this.showControls() : this.hideControls() } }), n.fancybox = {
            version: "3.3.5", defaults: a, getInstance: function (t) { var e = n('.fancybox-container:not(".fancybox-is-closing"):last').data("FancyBox"), o = Array.prototype.slice.call(arguments, 1); return e instanceof h && ("string" === n.type(t) ? e[t].apply(e, o) : "function" === n.type(t) && t.apply(e, o), e) }, open: function (t, e, n) { return new h(t, e, n) }, close: function (t) { var e = this.getInstance(); e && (e.close(), t === !0 && this.close()) }, destroy: function () { this.close(!0), r.add("body").off("click.fb-start", "**") }, isMobile: e.createTouch !== o && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), use3d: function () { var n = e.createElement("div"); return t.getComputedStyle && t.getComputedStyle(n) && t.getComputedStyle(n).getPropertyValue("transform") && !(e.documentMode && e.documentMode < 11) }(), getTranslate: function (t) { var e; return !(!t || !t.length) && (e = t[0].getBoundingClientRect(), { top: e.top || 0, left: e.left || 0, width: e.width, height: e.height, opacity: parseFloat(t.css("opacity")) }) }, setTranslate: function (t, e) { var n = "", i = {}; if (t && e) return e.left === o && e.top === o || (n = (e.left === o ? t.position().left : e.left) + "px, " + (e.top === o ? t.position().top : e.top) + "px", n = this.use3d ? "translate3d(" + n + ", 0px)" : "translate(" + n + ")"), e.scaleX !== o && e.scaleY !== o && (n = (n.length ? n + " " : "") + "scale(" + e.scaleX + ", " + e.scaleY + ")"), n.length && (i.transform = n), e.opacity !== o && (i.opacity = e.opacity), e.width !== o && (i.width = e.width), e.height !== o && (i.height = e.height), t.css(i) }, animate: function (t, e, i, a, s) {
                var r = !1; n.isFunction(i) && (a = i, i = null), n.isPlainObject(e) || t.removeAttr("style"), n.fancybox.stop(t), t.on(u, function (o) {
                (!o || !o.originalEvent || t.is(o.originalEvent.target) && "z-index" != o.originalEvent.propertyName) && (n.fancybox.stop(t), r && n.fancybox.setTranslate(t, r),
                    n.isPlainObject(e) ? s === !1 && t.removeAttr("style") : s !== !0 && t.removeClass(e), n.isFunction(a) && a(o))
                }), n.isNumeric(i) && t.css("transition-duration", i + "ms"), n.isPlainObject(e) ? (e.scaleX !== o && e.scaleY !== o && (r = n.extend({}, e, { width: t.width() * e.scaleX, height: t.height() * e.scaleY, scaleX: 1, scaleY: 1 }), delete e.width, delete e.height, t.parent().hasClass("fancybox-slide--image") && t.parent().addClass("fancybox-is-scaling")), n.fancybox.setTranslate(t, e)) : t.addClass(e), t.data("timer", setTimeout(function () { t.trigger("transitionend") }, i + 16))
            }, stop: function (t) { t && t.length && (clearTimeout(t.data("timer")), t.off("transitionend").css("transition-duration", ""), t.parent().removeClass("fancybox-is-scaling")) }
        }, n.fn.fancybox = function (t) { var e; return t = t || {}, e = t.selector || !1, e ? n("body").off("click.fb-start", e).on("click.fb-start", e, { options: t }, i) : this.off("click.fb-start").on("click.fb-start", { items: this, options: t }, i), this }, r.on("click.fb-start", "[data-fancybox]", i), r.on("click.fb-start", "[data-trigger]", function (t) { i(t, { $target: n('[data-fancybox="' + n(t.currentTarget).attr("data-trigger") + '"]').eq(n(t.currentTarget).attr("data-index") || 0), $trigger: n(this) }) })
    }
}(window, document, window.jQuery || jQuery), function (t) { "use strict"; var e = function (e, n, o) { if (e) return o = o || "", "object" === t.type(o) && (o = t.param(o, !0)), t.each(n, function (t, n) { e = e.replace("$" + t, n || "") }), o.length && (e += (e.indexOf("?") > 0 ? "&" : "?") + o), e }, n = { youtube: { matcher: /(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i, params: { autoplay: 1, autohide: 1, fs: 1, rel: 0, hd: 1, wmode: "transparent", enablejsapi: 1, html5: 1 }, paramPlace: 8, type: "iframe", url: "//www.youtube.com/embed/$4", thumb: "//img.youtube.com/vi/$4/hqdefault.jpg" }, vimeo: { matcher: /^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/, params: { autoplay: 1, hd: 1, show_title: 1, show_byline: 1, show_portrait: 0, fullscreen: 1, api: 1 }, paramPlace: 3, type: "iframe", url: "//player.vimeo.com/video/$2" }, instagram: { matcher: /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i, type: "image", url: "//$1/p/$2/media/?size=l" }, gmap_place: { matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i, type: "iframe", url: function (t) { return "//maps.google." + t[2] + "/?ll=" + (t[9] ? t[9] + "&z=" + Math.floor(t[10]) + (t[12] ? t[12].replace(/^\//, "&") : "") : t[12] + "").replace(/\?/, "&") + "&output=" + (t[12] && t[12].indexOf("layer=c") > 0 ? "svembed" : "embed") } }, gmap_search: { matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(maps\/search\/)(.*)/i, type: "iframe", url: function (t) { return "//maps.google." + t[2] + "/maps?q=" + t[5].replace("query=", "q=").replace("api=1", "") + "&output=embed" } } }; t(document).on("objectNeedsType.fb", function (o, i, a) { var s, r, c, l, d, u, f, p = a.src || "", h = !1; s = t.extend(!0, {}, n, a.opts.media), t.each(s, function (n, o) { if (c = p.match(o.matcher)) { if (h = o.type, f = n, u = {}, o.paramPlace && c[o.paramPlace]) { d = c[o.paramPlace], "?" == d[0] && (d = d.substring(1)), d = d.split("&"); for (var i = 0; i < d.length; ++i) { var s = d[i].split("=", 2); 2 == s.length && (u[s[0]] = decodeURIComponent(s[1].replace(/\+/g, " "))) } } return l = t.extend(!0, {}, o.params, a.opts[n], u), p = "function" === t.type(o.url) ? o.url.call(this, c, l, a) : e(o.url, c, l), r = "function" === t.type(o.thumb) ? o.thumb.call(this, c, l, a) : e(o.thumb, c), "youtube" === n ? p = p.replace(/&t=((\d+)m)?(\d+)s/, function (t, e, n, o) { return "&start=" + ((n ? 60 * parseInt(n, 10) : 0) + parseInt(o, 10)) }) : "vimeo" === n && (p = p.replace("&%23", "#")), !1 } }), h ? (a.opts.thumb || a.opts.$thumb && a.opts.$thumb.length || (a.opts.thumb = r), "iframe" === h && (a.opts = t.extend(!0, a.opts, { iframe: { preload: !1, attr: { scrolling: "no" } } })), t.extend(a, { type: h, src: p, origSrc: a.src, contentSource: f, contentType: "image" === h ? "image" : "gmap_place" == f || "gmap_search" == f ? "map" : "video" })) : p && (a.type = a.opts.defaultType) }) }(window.jQuery || jQuery), function (t, e, n) { "use strict"; var o = function () { return t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || function (e) { return t.setTimeout(e, 1e3 / 60) } }(), i = function () { return t.cancelAnimationFrame || t.webkitCancelAnimationFrame || t.mozCancelAnimationFrame || t.oCancelAnimationFrame || function (e) { t.clearTimeout(e) } }(), a = function (e) { var n = []; e = e.originalEvent || e || t.e, e = e.touches && e.touches.length ? e.touches : e.changedTouches && e.changedTouches.length ? e.changedTouches : [e]; for (var o in e) e[o].pageX ? n.push({ x: e[o].pageX, y: e[o].pageY }) : e[o].clientX && n.push({ x: e[o].clientX, y: e[o].clientY }); return n }, s = function (t, e, n) { return e && t ? "x" === n ? t.x - e.x : "y" === n ? t.y - e.y : Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)) : 0 }, r = function (t) { if (t.is('a,area,button,[role="button"],input,label,select,summary,textarea,video,audio') || n.isFunction(t.get(0).onclick) || t.data("selectable")) return !0; for (var e = 0, o = t[0].attributes, i = o.length; e < i; e++)if ("data-fancybox-" === o[e].nodeName.substr(0, 14)) return !0; return !1 }, c = function (e) { var n = t.getComputedStyle(e)["overflow-y"], o = t.getComputedStyle(e)["overflow-x"], i = ("scroll" === n || "auto" === n) && e.scrollHeight > e.clientHeight, a = ("scroll" === o || "auto" === o) && e.scrollWidth > e.clientWidth; return i || a }, l = function (t) { for (var e = !1; ;) { if (e = c(t.get(0))) break; if (t = t.parent(), !t.length || t.hasClass("fancybox-stage") || t.is("body")) break } return e }, d = function (t) { var e = this; e.instance = t, e.$bg = t.$refs.bg, e.$stage = t.$refs.stage, e.$container = t.$refs.container, e.destroy(), e.$container.on("touchstart.fb.touch mousedown.fb.touch", n.proxy(e, "ontouchstart")) }; d.prototype.destroy = function () { this.$container.off(".fb.touch") }, d.prototype.ontouchstart = function (o) { var i = this, c = n(o.target), d = i.instance, u = d.current, f = u.$content, p = "touchstart" == o.type; if (p && i.$container.off("mousedown.fb.touch"), (!o.originalEvent || 2 != o.originalEvent.button) && c.length && !r(c) && !r(c.parent()) && (c.is("img") || !(o.originalEvent.clientX > c[0].clientWidth + c.offset().left))) { if (!u || d.isAnimating || d.isClosing) return o.stopPropagation(), void o.preventDefault(); if (i.realPoints = i.startPoints = a(o), i.startPoints.length) { if (o.stopPropagation(), i.startEvent = o, i.canTap = !0, i.$target = c, i.$content = f, i.opts = u.opts.touch, i.isPanning = !1, i.isSwiping = !1, i.isZooming = !1, i.isScrolling = !1, i.startTime = (new Date).getTime(), i.distanceX = i.distanceY = i.distance = 0, i.canvasWidth = Math.round(u.$slide[0].clientWidth), i.canvasHeight = Math.round(u.$slide[0].clientHeight), i.contentLastPos = null, i.contentStartPos = n.fancybox.getTranslate(i.$content) || { top: 0, left: 0 }, i.sliderStartPos = i.sliderLastPos || n.fancybox.getTranslate(u.$slide), i.stagePos = n.fancybox.getTranslate(d.$refs.stage), i.sliderStartPos.top -= i.stagePos.top, i.sliderStartPos.left -= i.stagePos.left, i.contentStartPos.top -= i.stagePos.top, i.contentStartPos.left -= i.stagePos.left, n(e).off(".fb.touch").on(p ? "touchend.fb.touch touchcancel.fb.touch" : "mouseup.fb.touch mouseleave.fb.touch", n.proxy(i, "ontouchend")).on(p ? "touchmove.fb.touch" : "mousemove.fb.touch", n.proxy(i, "ontouchmove")), n.fancybox.isMobile && e.addEventListener("scroll", i.onscroll, !0), !i.opts && !d.canPan() || !c.is(i.$stage) && !i.$stage.find(c).length) return void (c.is(".fancybox-image") && o.preventDefault()); n.fancybox.isMobile && (l(c) || l(c.parent())) || o.preventDefault(), (1 === i.startPoints.length || u.hasError) && (i.instance.canPan() ? (n.fancybox.stop(i.$content), i.$content.css("transition-duration", ""), i.isPanning = !0) : i.isSwiping = !0, i.$container.addClass("fancybox-controls--isGrabbing")), 2 === i.startPoints.length && "image" === u.type && (u.isLoaded || u.$ghost) && (i.canTap = !1, i.isSwiping = !1, i.isPanning = !1, i.isZooming = !0, n.fancybox.stop(i.$content), i.$content.css("transition-duration", ""), i.centerPointStartX = .5 * (i.startPoints[0].x + i.startPoints[1].x) - n(t).scrollLeft(), i.centerPointStartY = .5 * (i.startPoints[0].y + i.startPoints[1].y) - n(t).scrollTop(), i.percentageOfImageAtPinchPointX = (i.centerPointStartX - i.contentStartPos.left) / i.contentStartPos.width, i.percentageOfImageAtPinchPointY = (i.centerPointStartY - i.contentStartPos.top) / i.contentStartPos.height, i.startDistanceBetweenFingers = s(i.startPoints[0], i.startPoints[1])) } } }, d.prototype.onscroll = function (t) { var n = this; n.isScrolling = !0, e.removeEventListener("scroll", n.onscroll, !0) }, d.prototype.ontouchmove = function (t) { var e = this, o = n(t.target); return void 0 !== t.originalEvent.buttons && 0 === t.originalEvent.buttons ? void e.ontouchend(t) : e.isScrolling || !o.is(e.$stage) && !e.$stage.find(o).length ? void (e.canTap = !1) : (e.newPoints = a(t), void ((e.opts || e.instance.canPan()) && e.newPoints.length && e.newPoints.length && (e.isSwiping && e.isSwiping === !0 || t.preventDefault(), e.distanceX = s(e.newPoints[0], e.startPoints[0], "x"), e.distanceY = s(e.newPoints[0], e.startPoints[0], "y"), e.distance = s(e.newPoints[0], e.startPoints[0]), e.distance > 0 && (e.isSwiping ? e.onSwipe(t) : e.isPanning ? e.onPan() : e.isZooming && e.onZoom())))) }, d.prototype.onSwipe = function (e) { var a, s = this, r = s.isSwiping, c = s.sliderStartPos.left || 0; if (r !== !0) "x" == r && (s.distanceX > 0 && (s.instance.group.length < 2 || 0 === s.instance.current.index && !s.instance.current.opts.loop) ? c += Math.pow(s.distanceX, .8) : s.distanceX < 0 && (s.instance.group.length < 2 || s.instance.current.index === s.instance.group.length - 1 && !s.instance.current.opts.loop) ? c -= Math.pow(-s.distanceX, .8) : c += s.distanceX), s.sliderLastPos = { top: "x" == r ? 0 : s.sliderStartPos.top + s.distanceY, left: c }, s.requestId && (i(s.requestId), s.requestId = null), s.requestId = o(function () { s.sliderLastPos && (n.each(s.instance.slides, function (t, e) { var o = e.pos - s.instance.currPos; n.fancybox.setTranslate(e.$slide, { top: s.sliderLastPos.top, left: s.sliderLastPos.left + o * s.canvasWidth + o * e.opts.gutter }) }), s.$container.addClass("fancybox-is-sliding")) }); else if (Math.abs(s.distance) > 10) { if (s.canTap = !1, s.instance.group.length < 2 && s.opts.vertical ? s.isSwiping = "y" : s.instance.isDragging || s.opts.vertical === !1 || "auto" === s.opts.vertical && n(t).width() > 800 ? s.isSwiping = "x" : (a = Math.abs(180 * Math.atan2(s.distanceY, s.distanceX) / Math.PI), s.isSwiping = a > 45 && a < 135 ? "y" : "x"), s.canTap = !1, "y" === s.isSwiping && n.fancybox.isMobile && (l(s.$target) || l(s.$target.parent()))) return void (s.isScrolling = !0); s.instance.isDragging = s.isSwiping, s.startPoints = s.newPoints, n.each(s.instance.slides, function (t, e) { n.fancybox.stop(e.$slide), e.$slide.css("transition-duration", ""), e.inTransition = !1, e.pos === s.instance.current.pos && (s.sliderStartPos.left = n.fancybox.getTranslate(e.$slide).left - n.fancybox.getTranslate(s.instance.$refs.stage).left) }), s.instance.SlideShow && s.instance.SlideShow.isActive && s.instance.SlideShow.stop() } }, d.prototype.onPan = function () { var t = this; return s(t.newPoints[0], t.realPoints[0]) < (n.fancybox.isMobile ? 10 : 5) ? void (t.startPoints = t.newPoints) : (t.canTap = !1, t.contentLastPos = t.limitMovement(), t.requestId && (i(t.requestId), t.requestId = null), void (t.requestId = o(function () { n.fancybox.setTranslate(t.$content, t.contentLastPos) }))) }, d.prototype.limitMovement = function () { var t, e, n, o, i, a, s = this, r = s.canvasWidth, c = s.canvasHeight, l = s.distanceX, d = s.distanceY, u = s.contentStartPos, f = u.left, p = u.top, h = u.width, g = u.height; return i = h > r ? f + l : f, a = p + d, t = Math.max(0, .5 * r - .5 * h), e = Math.max(0, .5 * c - .5 * g), n = Math.min(r - h, .5 * r - .5 * h), o = Math.min(c - g, .5 * c - .5 * g), l > 0 && i > t && (i = t - 1 + Math.pow(-t + f + l, .8) || 0), l < 0 && i < n && (i = n + 1 - Math.pow(n - f - l, .8) || 0), d > 0 && a > e && (a = e - 1 + Math.pow(-e + p + d, .8) || 0), d < 0 && a < o && (a = o + 1 - Math.pow(o - p - d, .8) || 0), { top: a, left: i } }, d.prototype.limitPosition = function (t, e, n, o) { var i = this, a = i.canvasWidth, s = i.canvasHeight; return n > a ? (t = t > 0 ? 0 : t, t = t < a - n ? a - n : t) : t = Math.max(0, a / 2 - n / 2), o > s ? (e = e > 0 ? 0 : e, e = e < s - o ? s - o : e) : e = Math.max(0, s / 2 - o / 2), { top: e, left: t } }, d.prototype.onZoom = function () { var e = this, a = e.contentStartPos, r = a.width, c = a.height, l = a.left, d = a.top, u = s(e.newPoints[0], e.newPoints[1]), f = u / e.startDistanceBetweenFingers, p = Math.floor(r * f), h = Math.floor(c * f), g = (r - p) * e.percentageOfImageAtPinchPointX, b = (c - h) * e.percentageOfImageAtPinchPointY, m = (e.newPoints[0].x + e.newPoints[1].x) / 2 - n(t).scrollLeft(), y = (e.newPoints[0].y + e.newPoints[1].y) / 2 - n(t).scrollTop(), v = m - e.centerPointStartX, x = y - e.centerPointStartY, w = l + (g + v), $ = d + (b + x), S = { top: $, left: w, scaleX: f, scaleY: f }; e.canTap = !1, e.newWidth = p, e.newHeight = h, e.contentLastPos = S, e.requestId && (i(e.requestId), e.requestId = null), e.requestId = o(function () { n.fancybox.setTranslate(e.$content, e.contentLastPos) }) }, d.prototype.ontouchend = function (t) { var o = this, s = Math.max((new Date).getTime() - o.startTime, 1), r = o.isSwiping, c = o.isPanning, l = o.isZooming, d = o.isScrolling; return o.endPoints = a(t), o.$container.removeClass("fancybox-controls--isGrabbing"), n(e).off(".fb.touch"), e.removeEventListener("scroll", o.onscroll, !0), o.requestId && (i(o.requestId), o.requestId = null), o.isSwiping = !1, o.isPanning = !1, o.isZooming = !1, o.isScrolling = !1, o.instance.isDragging = !1, o.canTap ? o.onTap(t) : (o.speed = 366, o.velocityX = o.distanceX / s * .5, o.velocityY = o.distanceY / s * .5, o.speedX = Math.max(.5 * o.speed, Math.min(1.5 * o.speed, 1 / Math.abs(o.velocityX) * o.speed)), void (c ? o.endPanning() : l ? o.endZooming() : o.endSwiping(r, d))) }, d.prototype.endSwiping = function (t, e) { var o = this, i = !1, a = o.instance.group.length; o.sliderLastPos = null, "y" == t && !e && Math.abs(o.distanceY) > 50 ? (n.fancybox.animate(o.instance.current.$slide, { top: o.sliderStartPos.top + o.distanceY + 150 * o.velocityY, opacity: 0 }, 200), i = o.instance.close(!0, 200)) : "x" == t && o.distanceX > 50 && a > 1 ? i = o.instance.previous(o.speedX) : "x" == t && o.distanceX < -50 && a > 1 && (i = o.instance.next(o.speedX)), i !== !1 || "x" != t && "y" != t || (e || a < 2 ? o.instance.centerSlide(o.instance.current, 150) : o.instance.jumpTo(o.instance.current.index)), o.$container.removeClass("fancybox-is-sliding") }, d.prototype.endPanning = function () { var t, e, o, i = this; i.contentLastPos && (i.opts.momentum === !1 ? (t = i.contentLastPos.left, e = i.contentLastPos.top) : (t = i.contentLastPos.left + i.velocityX * i.speed, e = i.contentLastPos.top + i.velocityY * i.speed), o = i.limitPosition(t, e, i.contentStartPos.width, i.contentStartPos.height), o.width = i.contentStartPos.width, o.height = i.contentStartPos.height, n.fancybox.animate(i.$content, o, 330)) }, d.prototype.endZooming = function () { var t, e, o, i, a = this, s = a.instance.current, r = a.newWidth, c = a.newHeight; a.contentLastPos && (t = a.contentLastPos.left, e = a.contentLastPos.top, i = { top: e, left: t, width: r, height: c, scaleX: 1, scaleY: 1 }, n.fancybox.setTranslate(a.$content, i), r < a.canvasWidth && c < a.canvasHeight ? a.instance.scaleToFit(150) : r > s.width || c > s.height ? a.instance.scaleToActual(a.centerPointStartX, a.centerPointStartY, 150) : (o = a.limitPosition(t, e, r, c), n.fancybox.setTranslate(a.$content, n.fancybox.getTranslate(a.$content)), n.fancybox.animate(a.$content, o, 150))) }, d.prototype.onTap = function (e) { var o, i = this, s = n(e.target), r = i.instance, c = r.current, l = e && a(e) || i.startPoints, d = l[0] ? l[0].x - n(t).scrollLeft() - i.stagePos.left : 0, u = l[0] ? l[0].y - n(t).scrollTop() - i.stagePos.top : 0, f = function (t) { var o = c.opts[t]; if (n.isFunction(o) && (o = o.apply(r, [c, e])), o) switch (o) { case "close": r.close(i.startEvent); break; case "toggleControls": r.toggleControls(!0); break; case "next": r.next(); break; case "nextOrClose": r.group.length > 1 ? r.next() : r.close(i.startEvent); break; case "zoom": "image" == c.type && (c.isLoaded || c.$ghost) && (r.canPan() ? r.scaleToFit() : r.isScaledDown() ? r.scaleToActual(d, u) : r.group.length < 2 && r.close(i.startEvent)) } }; if ((!e.originalEvent || 2 != e.originalEvent.button) && (s.is("img") || !(d > s[0].clientWidth + s.offset().left))) { if (s.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container")) o = "Outside"; else if (s.is(".fancybox-slide")) o = "Slide"; else { if (!r.current.$content || !r.current.$content.find(s).addBack().filter(s).length) return; o = "Content" } if (i.tapped) { if (clearTimeout(i.tapped), i.tapped = null, Math.abs(d - i.tapX) > 50 || Math.abs(u - i.tapY) > 50) return this; f("dblclick" + o) } else i.tapX = d, i.tapY = u, c.opts["dblclick" + o] && c.opts["dblclick" + o] !== c.opts["click" + o] ? i.tapped = setTimeout(function () { i.tapped = null, f("click" + o) }, 500) : f("click" + o); return this } }, n(e).on("onActivate.fb", function (t, e) { e && !e.Guestures && (e.Guestures = new d(e)) }) }(window, document, window.jQuery || jQuery), function (t, e) { "use strict"; e.extend(!0, e.fancybox.defaults, { btnTpl: { slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><svg viewBox="0 0 40 40"><path d="M13,12 L27,20 L13,27 Z" /><path d="M15,10 v19 M23,10 v19" /></svg></button>' }, slideShow: { autoStart: !1, speed: 3e3 } }); var n = function (t) { this.instance = t, this.init() }; e.extend(n.prototype, { timer: null, isActive: !1, $button: null, init: function () { var t = this; t.$button = t.instance.$refs.toolbar.find("[data-fancybox-play]").on("click", function () { t.toggle() }), (t.instance.group.length < 2 || !t.instance.group[t.instance.currIndex].opts.slideShow) && t.$button.hide() }, set: function (t) { var e = this; e.instance && e.instance.current && (t === !0 || e.instance.current.opts.loop || e.instance.currIndex < e.instance.group.length - 1) ? e.timer = setTimeout(function () { e.isActive && e.instance.jumpTo((e.instance.currIndex + 1) % e.instance.group.length) }, e.instance.current.opts.slideShow.speed) : (e.stop(), e.instance.idleSecondsCounter = 0, e.instance.showControls()) }, clear: function () { var t = this; clearTimeout(t.timer), t.timer = null }, start: function () { var t = this, e = t.instance.current; e && (t.isActive = !0, t.$button.attr("title", e.opts.i18n[e.opts.lang].PLAY_STOP).removeClass("fancybox-button--play").addClass("fancybox-button--pause"), t.set(!0)) }, stop: function () { var t = this, e = t.instance.current; t.clear(), t.$button.attr("title", e.opts.i18n[e.opts.lang].PLAY_START).removeClass("fancybox-button--pause").addClass("fancybox-button--play"), t.isActive = !1 }, toggle: function () { var t = this; t.isActive ? t.stop() : t.start() } }), e(t).on({ "onInit.fb": function (t, e) { e && !e.SlideShow && (e.SlideShow = new n(e)) }, "beforeShow.fb": function (t, e, n, o) { var i = e && e.SlideShow; o ? i && n.opts.slideShow.autoStart && i.start() : i && i.isActive && i.clear() }, "afterShow.fb": function (t, e, n) { var o = e && e.SlideShow; o && o.isActive && o.set() }, "afterKeydown.fb": function (n, o, i, a, s) { var r = o && o.SlideShow; !r || !i.opts.slideShow || 80 !== s && 32 !== s || e(t.activeElement).is("button,a,input") || (a.preventDefault(), r.toggle()) }, "beforeClose.fb onDeactivate.fb": function (t, e) { var n = e && e.SlideShow; n && n.stop() } }), e(t).on("visibilitychange", function () { var n = e.fancybox.getInstance(), o = n && n.SlideShow; o && o.isActive && (t.hidden ? o.clear() : o.set()) }) }(document, window.jQuery || jQuery), function (t, e) { "use strict"; var n = function () { for (var e = [["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"], ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"], ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"], ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"], ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]], n = {}, o = 0; o < e.length; o++) { var i = e[o]; if (i && i[1] in t) { for (var a = 0; a < i.length; a++)n[e[0][a]] = i[a]; return n } } return !1 }(); if (!n) return void (e && e.fancybox && (e.fancybox.defaults.btnTpl.fullScreen = !1)); var o = { request: function (e) { e = e || t.documentElement, e[n.requestFullscreen](e.ALLOW_KEYBOARD_INPUT) }, exit: function () { t[n.exitFullscreen]() }, toggle: function (e) { e = e || t.documentElement, this.isFullscreen() ? this.exit() : this.request(e) }, isFullscreen: function () { return Boolean(t[n.fullscreenElement]) }, enabled: function () { return Boolean(t[n.fullscreenEnabled]) } }; e.extend(!0, e.fancybox.defaults, { btnTpl: { fullScreen: '<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fullscreen" title="{{FULL_SCREEN}}"><svg viewBox="0 0 40 40"><path d="M9,12 v16 h22 v-16 h-22 v8" /></svg></button>' }, fullScreen: { autoStart: !1 } }), e(t).on({ "onInit.fb": function (t, e) { var n; e && e.group[e.currIndex].opts.fullScreen ? (n = e.$refs.container, n.on("click.fb-fullscreen", "[data-fancybox-fullscreen]", function (t) { t.stopPropagation(), t.preventDefault(), o.toggle() }), e.opts.fullScreen && e.opts.fullScreen.autoStart === !0 && o.request(), e.FullScreen = o) : e && e.$refs.toolbar.find("[data-fancybox-fullscreen]").hide() }, "afterKeydown.fb": function (t, e, n, o, i) { e && e.FullScreen && 70 === i && (o.preventDefault(), e.FullScreen.toggle()) }, "beforeClose.fb": function (t, e) { e && e.FullScreen && e.$refs.container.hasClass("fancybox-is-fullscreen") && o.exit() } }), e(t).on(n.fullscreenchange, function () { var t = o.isFullscreen(), n = e.fancybox.getInstance(); n && (n.current && "image" === n.current.type && n.isAnimating && (n.current.$content.css("transition", "none"), n.isAnimating = !1, n.update(!0, !0, 0)), n.trigger("onFullscreenChange", t), n.$refs.container.toggleClass("fancybox-is-fullscreen", t)) }) }(document, window.jQuery || jQuery), function (t, e) { "use strict"; var n = "fancybox-thumbs", o = n + "-active", i = n + "-loading"; e.fancybox.defaults = e.extend(!0, { btnTpl: { thumbs: '<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"><svg viewBox="0 0 120 120"><path d="M30,30 h14 v14 h-14 Z M50,30 h14 v14 h-14 Z M70,30 h14 v14 h-14 Z M30,50 h14 v14 h-14 Z M50,50 h14 v14 h-14 Z M70,50 h14 v14 h-14 Z M30,70 h14 v14 h-14 Z M50,70 h14 v14 h-14 Z M70,70 h14 v14 h-14 Z" /></svg></button>' }, thumbs: { autoStart: !1, hideOnClose: !0, parentEl: ".fancybox-container", axis: "y" } }, e.fancybox.defaults); var a = function (t) { this.init(t) }; e.extend(a.prototype, { $button: null, $grid: null, $list: null, isVisible: !1, isActive: !1, init: function (t) { var e, n, o = this; o.instance = t, t.Thumbs = o, o.opts = t.group[t.currIndex].opts.thumbs, e = t.group[0], e = e.opts.thumb || !(!e.opts.$thumb || !e.opts.$thumb.length) && e.opts.$thumb.attr("src"), t.group.length > 1 && (n = t.group[1], n = n.opts.thumb || !(!n.opts.$thumb || !n.opts.$thumb.length) && n.opts.$thumb.attr("src")), o.$button = t.$refs.toolbar.find("[data-fancybox-thumbs]"), o.opts && e && n && e && n ? (o.$button.show().on("click", function () { o.toggle() }), o.isActive = !0) : o.$button.hide() }, create: function () { var t, o = this, a = o.instance, s = o.opts.parentEl, r = []; o.$grid || (o.$grid = e('<div class="' + n + " " + n + "-" + o.opts.axis + '"></div>').appendTo(a.$refs.container.find(s).addBack().filter(s)), o.$grid.on("click", "li", function () { a.jumpTo(e(this).attr("data-index")) })), o.$list || (o.$list = e("<ul>").appendTo(o.$grid)), e.each(a.group, function (e, n) { t = n.opts.thumb || (n.opts.$thumb ? n.opts.$thumb.attr("src") : null), t || "image" !== n.type || (t = n.src), r.push('<li data-index="' + e + '" tabindex="0" class="' + i + '"' + (t && t.length ? ' style="background-image:url(' + t + ')" />' : "") + "></li>") }), o.$list[0].innerHTML = r.join(""), "x" === o.opts.axis && o.$list.width(parseInt(o.$grid.css("padding-right"), 10) + a.group.length * o.$list.children().eq(0).outerWidth(!0)) }, focus: function (t) { var e, n, i = this, a = i.$list, s = i.$grid; i.instance.current && (e = a.children().removeClass(o).filter('[data-index="' + i.instance.current.index + '"]').addClass(o), n = e.position(), "y" === i.opts.axis && (n.top < 0 || n.top > a.height() - e.outerHeight()) ? a.stop().animate({ scrollTop: a.scrollTop() + n.top }, t) : "x" === i.opts.axis && (n.left < s.scrollLeft() || n.left > s.scrollLeft() + (s.width() - e.outerWidth())) && a.parent().stop().animate({ scrollLeft: n.left }, t)) }, update: function () { var t = this; t.instance.$refs.container.toggleClass("fancybox-show-thumbs", this.isVisible), t.isVisible ? (t.$grid || t.create(), t.instance.trigger("onThumbsShow"), t.focus(0)) : t.$grid && t.instance.trigger("onThumbsHide"), t.instance.update() }, hide: function () { this.isVisible = !1, this.update() }, show: function () { this.isVisible = !0, this.update() }, toggle: function () { this.isVisible = !this.isVisible, this.update() } }), e(t).on({ "onInit.fb": function (t, e) { var n; e && !e.Thumbs && (n = new a(e), n.isActive && n.opts.autoStart === !0 && n.show()) }, "beforeShow.fb": function (t, e, n, o) { var i = e && e.Thumbs; i && i.isVisible && i.focus(o ? 0 : 250) }, "afterKeydown.fb": function (t, e, n, o, i) { var a = e && e.Thumbs; a && a.isActive && 71 === i && (o.preventDefault(), a.toggle()) }, "beforeClose.fb": function (t, e) { var n = e && e.Thumbs; n && n.isVisible && n.opts.hideOnClose !== !1 && n.$grid.hide() } }) }(document, window.jQuery || jQuery), function (t, e) { "use strict"; function n(t) { var e = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;" }; return String(t).replace(/[&<>"'`=\/]/g, function (t) { return e[t] }) } e.extend(!0, e.fancybox.defaults, { btnTpl: { share: '<button data-fancybox-share class="fancybox-button fancybox-button--share" title="{{SHARE}}"><svg viewBox="0 0 40 40"><path d="M6,30 C8,18 19,16 23,16 L23,16 L23,10 L33,20 L23,29 L23,24 C19,24 8,27 6,30 Z"></svg></button>' }, share: { url: function (t, e) { return !t.currentHash && "inline" !== e.type && "html" !== e.type && (e.origSrc || e.src) || window.location }, tpl: '<div class="fancybox-share"><h1>{{SHARE}}</h1><p><a class="fancybox-share__button fancybox-share__button--fb" href="https://www.facebook.com/sharer/sharer.php?u={{url}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m287 456v-299c0-21 6-35 35-35h38v-63c-7-1-29-3-55-3-54 0-91 33-91 94v306m143-254h-205v72h196" /></svg><span>Facebook</span></a><a class="fancybox-share__button fancybox-share__button--tw" href="https://twitter.com/intent/tweet?url={{url}}&text={{descr}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m456 133c-14 7-31 11-47 13 17-10 30-27 37-46-15 10-34 16-52 20-61-62-157-7-141 75-68-3-129-35-169-85-22 37-11 86 26 109-13 0-26-4-37-9 0 39 28 72 65 80-12 3-25 4-37 2 10 33 41 57 77 57-42 30-77 38-122 34 170 111 378-32 359-208 16-11 30-25 41-42z" /></svg><span>Twitter</span></a><a class="fancybox-share__button fancybox-share__button--pt" href="https://www.pinterest.com/pin/create/button/?url={{url}}&description={{descr}}&media={{media}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m265 56c-109 0-164 78-164 144 0 39 15 74 47 87 5 2 10 0 12-5l4-19c2-6 1-8-3-13-9-11-15-25-15-45 0-58 43-110 113-110 62 0 96 38 96 88 0 67-30 122-73 122-24 0-42-19-36-44 6-29 20-60 20-81 0-19-10-35-31-35-25 0-44 26-44 60 0 21 7 36 7 36l-30 125c-8 37-1 83 0 87 0 3 4 4 5 2 2-3 32-39 42-75l16-64c8 16 31 29 56 29 74 0 124-67 124-157 0-69-58-132-146-132z" fill="#fff"/></svg><span>Pinterest</span></a></p><p><input class="fancybox-share__input" type="text" value="{{url_raw}}" /></p></div>' } }), e(t).on("click", "[data-fancybox-share]", function () { var t, o, i = e.fancybox.getInstance(), a = i.current || null; a && ("function" === e.type(a.opts.share.url) && (t = a.opts.share.url.apply(a, [i, a])), o = a.opts.share.tpl.replace(/\{\{media\}\}/g, "image" === a.type ? encodeURIComponent(a.src) : "").replace(/\{\{url\}\}/g, encodeURIComponent(t)).replace(/\{\{url_raw\}\}/g, n(t)).replace(/\{\{descr\}\}/g, i.$caption ? encodeURIComponent(i.$caption.text()) : ""), e.fancybox.open({ src: i.translate(i, o), type: "html", opts: { animationEffect: !1, afterLoad: function (t, e) { i.$refs.container.one("beforeClose.fb", function () { t.close(null, 0) }), e.$content.find(".fancybox-share__links a").click(function () { return window.open(this.href, "Share", "width=550, height=450"), !1 }) } } })) }) }(document, window.jQuery || jQuery), function (t, e, n) { "use strict"; function o() { var t = e.location.hash.substr(1), n = t.split("-"), o = n.length > 1 && /^\+?\d+$/.test(n[n.length - 1]) ? parseInt(n.pop(-1), 10) || 1 : 1, i = n.join("-"); return { hash: t, index: o < 1 ? 1 : o, gallery: i } } function i(t) { var e; "" !== t.gallery && (e = n("[data-fancybox='" + n.escapeSelector(t.gallery) + "']").eq(t.index - 1).trigger("click.fb-start")) } function a(t) { var e, n; return !!t && (e = t.current ? t.current.opts : t.opts, n = e.hash || (e.$orig ? e.$orig.data("fancybox") : ""), "" !== n && n) } n.escapeSelector || (n.escapeSelector = function (t) { var e = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, n = function (t, e) { return e ? "\0" === t ? "�" : t.slice(0, -1) + "\\" + t.charCodeAt(t.length - 1).toString(16) + " " : "\\" + t }; return (t + "").replace(e, n) }), n(function () { n.fancybox.defaults.hash !== !1 && (n(t).on({ "onInit.fb": function (t, e) { var n, i; e.group[e.currIndex].opts.hash !== !1 && (n = o(), i = a(e), i && n.gallery && i == n.gallery && (e.currIndex = n.index - 1)) }, "beforeShow.fb": function (n, o, i, s) { var r; i && i.opts.hash !== !1 && (r = a(o), r && (o.currentHash = r + (o.group.length > 1 ? "-" + (i.index + 1) : ""), e.location.hash !== "#" + o.currentHash && (o.origHash || (o.origHash = e.location.hash), o.hashTimer && clearTimeout(o.hashTimer), o.hashTimer = setTimeout(function () { "replaceState" in e.history ? (e.history[s ? "pushState" : "replaceState"]({}, t.title, e.location.pathname + e.location.search + "#" + o.currentHash), s && (o.hasCreatedHistory = !0)) : e.location.hash = o.currentHash, o.hashTimer = null }, 300)))) }, "beforeClose.fb": function (n, o, i) { var s; i.opts.hash !== !1 && (s = a(o), o.currentHash && o.hasCreatedHistory ? e.history.back() : o.currentHash && ("replaceState" in e.history ? e.history.replaceState({}, t.title, e.location.pathname + e.location.search + (o.origHash || "")) : e.location.hash = o.origHash), o.currentHash = null, clearTimeout(o.hashTimer)) } }), n(e).on("hashchange.fb", function () { var t, e = o(); n.each(n(".fancybox-container").get().reverse(), function (e, o) { var i = n(o).data("FancyBox"); if (i.currentHash) return t = i, !1 }), t ? !t.currentHash || t.currentHash === e.gallery + "-" + e.index || 1 === e.index && t.currentHash == e.gallery || (t.currentHash = null, t.close()) : "" !== e.gallery && i(e) }), setTimeout(function () { n.fancybox.getInstance() || i(o()) }, 50)) }) }(document, window, window.jQuery || jQuery), function (t, e) { "use strict"; var n = (new Date).getTime(); e(t).on({ "onInit.fb": function (t, e, o) { e.$refs.stage.on("mousewheel DOMMouseScroll wheel MozMousePixelScroll", function (t) { var o = e.current, i = (new Date).getTime(); e.group.length < 2 || o.opts.wheel === !1 || "auto" === o.opts.wheel && "image" !== o.type || (t.preventDefault(), t.stopPropagation(), o.$slide.hasClass("fancybox-animated") || (t = t.originalEvent || t, i - n < 250 || (n = i, e[(-t.deltaY || -t.deltaX || t.wheelDelta || -t.detail) < 0 ? "next" : "previous"]()))) }) } }) }(document, window.jQuery || jQuery);




class Contextual {
    /**
     * Creates a new contextual menu
     * @param {object} opts options which build the menu e.g. position and items
     * @param {number} opts.width sets the width of the menu including children
     * @param {boolean} opts.isSticky sets how the menu apears, follow the mouse or sticky
     * @param {Array<ContextualItem>} opts.items sets the default items in the menu
     */
    constructor(opts) {
        contextualCore.CloseMenu();

        this.position = opts.isSticky != null ? opts.isSticky : false;
        this.menuControl = contextualCore.CreateEl(`<ul class='contextualJs contextualMenu'></ul>`);
        this.menuControl.style.width = opts.width != null ? opts.width : '200px';
        opts.items.forEach(i => {
            let item = new ContextualItem(i);
            if (item != null && item != undefined && item.element != null && item.element != undefined) {
                this.menuControl.appendChild(item.element);
            }
            
        });

        if (event != undefined) {
            event.stopPropagation()
            
            document.body.appendChild(this.menuControl);
            contextualCore.PositionMenu(this.position, event, this.menuControl);
            $(this.menuControl).addClass("open");
        }

        document.onclick = function (e) {
            if (!e.target.classList.contains('contextualJs')) {
                contextualCore.CloseMenu();
            }
        }
    }
    /**
     * Adds item to this contextual menu instance
     * @param {ContextualItem} item item to add to the contextual menu
     */
    add(item) {
        this.menuControl.appendChild(item.element);
    }
    /**
     * Makes this contextual menu visible
     */
    show() {
        event.stopPropagation();       
        document.body.appendChild(this.menuControl);
        contextualCore.PositionMenu(this.position, event, this.menuControl);
    }
    /**
     * Hides this contextual menu
     */
    hide() {
        event.stopPropagation()
        contextualCore.CloseMenu();
    }
    /**
     * Toggle visibility of menu
     */
    toggle() {
        event.stopPropagation()
        if (this.menuControl.parentElement != document.body) {
            document.body.appendChild(this.menuControl);
            contextualCore.PositionMenu(this.position, event, this.menuControl);
        } else {
            contextualCore.CloseMenu();
        }
    }
}
class ContextualItem {
    element;
    /**
     * 
     * @param {Object} opts
     * @param {string} [opts.label]
     * @param {string} [opts.type]
     * @param {string} [opts.markup]
     * @param {string} [opts.icon]
     * @param {string} [opts.cssIcon]
     * @param {string} [opts.shortcut]
     * @param {void} [opts.onClick]
     * @param {boolean} [opts.enabled]
     * @param {Array<ContextualItem>} [opts.items]
     * 
     */
    constructor(opts) {
        switch (opts.type) {
            case 'seperator':
                this.seperator();
                break;
            case 'custom':
                this.custom(opts.markup);
                break;
            case 'multi':
                this.multiButton(opts.items);
                break;
            case 'submenu':
                this.subMenu(opts.label, opts.items, (opts.icon !== undefined ? opts.icon : ''), (opts.cssIcon !== undefined ? opts.cssIcon : ''), (opts.enabled !== undefined ? opts.enabled : true));
                break;
            case 'hovermenu':
                this.hoverMenu(opts.label, opts.items, (opts.icon !== undefined ? opts.icon : ''), (opts.cssIcon !== undefined ? opts.cssIcon : ''), (opts.enabled !== undefined ? opts.enabled : true));
                break;
            case 'normal':
            default:
                this.button(opts.label, opts.onClick, (opts.shortcut !== undefined ? opts.shortcut : ''), (opts.icon !== undefined ? opts.icon : ''), (opts.cssIcon !== undefined ? opts.cssIcon : ''), (opts.enabled !== undefined ? opts.enabled : true));
        }
    }

    button(label, onClick, shortcut = '', icon = '', cssIcon = '', enabled = true, nolabel = false) {
        if (label!=undefined) {
            this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualMenuItemOuter'>
                <div class='contextualJs contextualMenuItem ${enabled == true ? '' : 'disabled'}'>
                    ${icon != '' ? `<img src='${icon}' class='contextualJs contextualMenuItemIcon'/>` : `<div class='contextualJs contextualMenuItemIcon ${cssIcon != '' ? cssIcon : ''}'></div>`}
                    <span class='contextualJs contextualMenuItemTitle'>${label == undefined ? 'No label' : label}</span>
                    <span class='contextualJs contextualMenuItemTip'>${shortcut == '' ? '' : shortcut}</span>
                </div>
            </li>`);

            if (enabled == true) {
                this.element.addEventListener('click', () => {
                    event.stopPropagation();
                    if (onClick !== undefined) { onClick(); }
                    contextualCore.CloseMenu();
                }, false);
            }
        }
        
    }
    custom(markup) {
        this.element = contextualCore.CreateEl(`<li class='contextualJs contextualCustomEl'>${markup}</li>`);
    }
    hoverMenu(label, items, icon = '', cssIcon = '', enabled = true) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualHoverMenuOuter'>
                <div class='contextualJs contextualHoverMenuItem ${enabled == true ? '' : 'disabled'}'>
                    ${icon != '' ? `<img src='${icon}' class='contextualJs contextualMenuItemIcon'/>` : `<div class='contextualJs contextualMenuItemIcon ${cssIcon != '' ? cssIcon : ''}'></div>`}
                    <span class='contextualJs contextualMenuItemTitle'>${label == undefined ? 'No label' : label}</span>
                    <span class='contextualJs contextualMenuItemOverflow'>></span>
                </div>
                <ul class='contextualJs contextualHoverMenu'>
                </ul>
            </li>
        `);

        let childMenu = this.element.querySelector('.contextualHoverMenu'),
            menuItem = this.element.querySelector('.contextualHoverMenuItem');

        if (items !== undefined) {
            items.forEach(i => {
                let item = new ContextualItem(i);
                childMenu.appendChild(item.element);
            });
        }
        if (enabled == true) {
            menuItem.addEventListener('mouseenter', () => {

            });
            menuItem.addEventListener('mouseleave', () => {

            });
        }
    }
    multiButton(buttons) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualMultiItem'>
            </li>
        `);
        buttons.forEach(i => {
            let item = new ContextualItem(i);
            this.element.appendChild(item.element);
        });
    }
    subMenu(label, items, icon = '', cssIcon = '', enabled = true) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualMenuItemOuter'>
                <div class='contextualJs contextualMenuItem ${enabled == true ? '' : 'disabled'}'>
                    ${icon != '' ? `<img src='${icon}' class='contextualJs contextualMenuItemIcon'/>` : `<div class='contextualJs contextualMenuItemIcon ${cssIcon != '' ? cssIcon : ''}'></div>`}
                    <span class='contextualJs contextualMenuItemTitle'>${label == undefined ? 'No label' : label}</span>
                    <span class='contextualJs contextualMenuItemOverflow'>
                        <span class='contextualJs contextualMenuItemOverflowLine'></span>
                        <span class='contextualJs contextualMenuItemOverflowLine'></span>
                        <span class='contextualJs contextualMenuItemOverflowLine'></span>
                    </span>
                </div>
                <ul class='contextualJs contextualSubMenu contextualMenuHidden'>
                </ul>
            </li>`);

        let childMenu = this.element.querySelector('.contextualSubMenu'),
            menuItem = this.element.querySelector('.contextualMenuItem');

        if (items !== undefined) {
            items.forEach(i => {
                let item = new ContextualItem(i);
                childMenu.appendChild(item.element);
            });
        }
        if (enabled == true) {
            menuItem.addEventListener('click', () => {
                menuItem.classList.toggle('SubMenuActive');
                childMenu.classList.toggle('contextualMenuHidden');
            }, false);
        }
    }
    seperator(label, items) {
        this.element = contextualCore.CreateEl(`<li class='contextualJs contextualMenuSeperator'><span></span></li>`);
    }
}

const contextualCore = {
    PositionMenu: (docked, el, menu) => {
        if (docked) {
            menu.style.left = ((el.target.offsetLeft + menu.offsetWidth) >= window.innerWidth) ?
                ((el.target.offsetLeft - menu.offsetWidth) + el.target.offsetWidth) + "px"
                : (el.target.offsetLeft) + "px";

            menu.style.top = ((el.target.offsetTop + menu.offsetHeight) >= window.innerHeight) ?
                (el.target.offsetTop - menu.offsetHeight) + "px"
                : (el.target.offsetHeight + el.target.offsetTop) + "px";
        } else {
            menu.style.left = ((el.clientX + menu.offsetWidth) >= window.innerWidth) ?
                ((el.clientX - menu.offsetWidth)) + "px"
                : (el.clientX) + "px";

            menu.style.top = ((el.clientY + menu.offsetHeight) >= window.innerHeight) ?
                (el.clientY - menu.offsetHeight) + "px"
                : (el.clientY) + "px";
        }
    },
    CloseMenu: () => {
        let openMenuItem = document.querySelector('.contextualMenu:not(.contextualMenuHidden)');
        if (openMenuItem != null) {
            $(openMenuItem).removeClass("open");
            setTimeout(function () { document.body.removeChild(openMenuItem); }, 100);
        }
    },
    CreateEl: (template) => {
        var el = document.createElement('div');
        el.innerHTML = template;
        return el.firstElementChild;
    }
};

/*
 * DarkTooltip v0.4.0
 * Simple customizable tooltip with confirm option and 3d effects
 * (c)2014 Rubén Torres - rubentdlh@gmail.com
 * Released under the MIT license
 */

(function ($) {

    function DarkTooltip(element, options) {
        this.bearer = element;
        this.options = options;
        this.hideEvent;
        this.mouseOverMode = (this.options.trigger == "hover" || this.options.trigger == "mouseover" || this.options.trigger == "onmouseover");
    }

    DarkTooltip.prototype = {

        show: function () {
            var dt = this;
            if (this.options.modal) {
                this.modalLayer.css('display', 'block');
            }
            //Close all other tooltips
            this.tooltip.css('display', 'block');
            //Set event to prevent tooltip from closig when mouse is over the tooltip
            if (dt.mouseOverMode) {
                this.tooltip.mouseover(function () {
                    clearTimeout(dt.hideEvent);
                });
                this.tooltip.mouseout(function () {
                    clearTimeout(dt.hideEvent);
                    dt.hide();
                });
            }
        },

        hide: function () {
            var dt = this;
            this.hideEvent = setTimeout(function () {
                dt.tooltip.hide();
            }, 100);
            if (dt.options.modal) {
                dt.modalLayer.hide();
            }
            this.options.onClose();
        },

        toggle: function () {
            if (this.tooltip.is(":visible")) {
                this.hide();
            } else {
                this.show();
            }
        },

        addAnimation: function () {
            switch (this.options.animation) {
                case 'none':
                    break;
                case 'fadeIn':
                    this.tooltip.addClass('animated');
                    this.tooltip.addClass('fadeIn');
                    break;
                case 'flipIn':
                    this.tooltip.addClass('animated');
                    this.tooltip.addClass('flipIn');
                    break;
            }
        },

        setContent: function () {
            $(this.bearer).css('cursor', 'pointer');
            //Get tooltip content
            if (this.options.content) {
                this.content = this.options.content;
            } else if (this.bearer.attr("data-tooltip")) {
                this.content = this.bearer.attr("data-tooltip");
            } else {
                // console.log("No content for tooltip: " + this.bearer.selector);
                return;
            }
            if (this.content.charAt(0) == '#') {
                if (this.options.delete_content) {
                    var content = $(this.content).html();
                    $(this.content).html('');
                    this.content = content;
                    delete content;
                }
                else {
                    $(this.content).hide();
                    this.content = $(this.content).html();
                }
                this.contentType = 'html';
            } else {
                this.contentType = 'text';
            }
            tooltipId = "";
            if (this.bearer.attr("id") != "") {
                tooltipId = "id='darktooltip-" + this.bearer.attr("id") + "'";
            }
            //Create modal layer
            this.modalLayer = $("<ins class='darktooltip-modal-layer'></ins>");
            //Create tooltip container
            this.tooltip = $("<ins " + tooltipId + " class = 'dark-tooltip " + this.options.theme + " " + this.options.size + " "
                + this.options.gravity + "'><div>" + this.content + "</div>" + ((this.options.arrow) ? "<div class = 'tip'></div>" : "")
                + "</ins>");
            this.tip = this.tooltip.find(".tip");

            $("body").append(this.modalLayer);
            $("body").append(this.tooltip);

            //Adjust size for html tooltip
            if (this.contentType == 'html') {
                this.tooltip.css('max-width', 'none');
            }
            this.tooltip.css('opacity', this.options.opacity);
            this.addAnimation();
            if (this.options.confirm) {
                this.addConfirm();
            }
        },

        setPositions: function () {
            var leftPos = this.bearer.offset().left;
            var topPos = this.bearer.offset().top;

            switch (this.options.gravity) {
                case 'south':
                    leftPos += this.bearer.outerWidth() / 2 - this.tooltip.outerWidth() / 2;
                    topPos += -this.tooltip.outerHeight() - this.tip.outerHeight() / 2;
                    break;
                case 'west':
                    leftPos += this.bearer.outerWidth() + this.tip.outerWidth() / 2;
                    topPos += this.bearer.outerHeight() / 2 - (this.tooltip.outerHeight() / 2);
                    break;
                case 'north':
                    leftPos += this.bearer.outerWidth() / 2 - (this.tooltip.outerWidth() / 2);
                    topPos += this.bearer.outerHeight() + this.tip.outerHeight() / 2;
                    break;
                case 'east':
                    leftPos += -this.tooltip.outerWidth() - this.tip.outerWidth() / 2;
                    topPos += this.bearer.outerHeight() / 2 - this.tooltip.outerHeight() / 2;
                    break;
            }
            if (this.options.autoLeft) {
                this.tooltip.css('left', leftPos);
            }
            if (this.options.autoTop) {
                this.tooltip.css('top', topPos);
            }
        },

        setEvents: function () {
            var dt = this;
            var delay = dt.options.hoverDelay;
            var setTimeoutConst;
            if (dt.mouseOverMode) {
                this.bearer.mouseenter(function () {
                    //Timeout for hover mouse delay
                    setTimeoutConst = setTimeout(function () {
                        dt.setPositions();
                        dt.show();
                    }, delay);
                }).mouseleave(function () {
                    clearTimeout(setTimeoutConst);
                    dt.hide();
                });
            } else if (this.options.trigger == "click" || this.options.trigger == "onclik") {
                this.tooltip.click(function (e) {
                    e.stopPropagation();
                });
                this.bearer.click(function (e) {
                    e.preventDefault();
                    dt.setPositions();
                    dt.toggle();
                    e.stopPropagation();
                });
                $('html').click(function () {
                    dt.hide();
                })
            }
        },

        activate: function () {
            this.setContent();
            if (this.content) {
                this.setEvents();
            }
        },

        addConfirm: function () {
            this.tooltip.append("<ul class = 'confirm'><li class = 'darktooltip-yes'>"
                + this.options.yes + "</li><li class = 'darktooltip-no'>" + this.options.no + "</li></ul>");
            this.setConfirmEvents();
        },

        setConfirmEvents: function () {
            var dt = this;
            this.tooltip.find('li.darktooltip-yes').click(function (e) {
                dt.onYes();
                e.stopPropagation();
            });
            this.tooltip.find('li.darktooltip-no').click(function (e) {
                dt.onNo();
                e.stopPropagation();
            });
        },

        finalMessage: function () {
            if (this.options.finalMessage) {
                var dt = this;
                dt.tooltip.find('div:first').html(this.options.finalMessage);
                dt.tooltip.find('ul').remove();
                dt.setPositions();
                setTimeout(function () {
                    dt.hide();
                    dt.setContent();
                }, dt.options.finalMessageDuration);
            } else {
                this.hide();
            }
        },

        onYes: function () {
            this.options.onYes(this.bearer);
            this.finalMessage();
        },

        onNo: function () {
            this.options.onNo(this.bearer);
            this.hide();
        }
    }

    $.fn.darkTooltip = function (options) {
        return this.each(function () {
            options = $.extend({}, $.fn.darkTooltip.defaults, options);
            var tooltip = new DarkTooltip($(this), options);
            tooltip.activate();
        });
    }

    $.fn.darkTooltip.defaults = {
        animation: 'none',
        confirm: false,
        content: '',
        finalMessage: '',
        finalMessageDuration: 1000,
        gravity: 'south',
        hoverDelay: 0,
        modal: false,
        no: 'No',
        onNo: function () { },
        onYes: function () { },
        opacity: 0.9,
        size: 'medium',
        theme: 'dark',
        trigger: 'hover',
        yes: 'Yes',
        autoTop: true,
        autoLeft: true,
        onClose: function () { },
        arrow: true
    };

})(jQuery);

/*!
 * jQuery ComboTree Plugin
 * Author:  Erhan FIRAT
 * Mail:    erhanfirat@gmail.com
 * Licensed under the MIT license
 * Version: 1.2.1
 */


; (function ($, window, document, undefined) {

    // Default settings
    var comboTreePlugin = 'comboTree',
        defaults = {
            source: [],
            isMultiple: false,
            cascadeSelect: false,
            selected: [],
            collapse: false,
            selectableLastNode: false
        };

    // LIFE CYCLE
    function ComboTree(element, options) {

        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = comboTreePlugin;

        this.constructorFunc(element, options);
    }

    ComboTree.prototype.constructorFunc = function (element, options) {
        this.elemInput = element;
        this._elemInput = $(element);

        this.init();
    }

    ComboTree.prototype.init = function () {
        // Setting Doms
        this.comboTreeId = 'comboTree' + Math.floor(Math.random() * 999999);

        this._elemInput.addClass('comboTreeInputBox');

        if (this._elemInput.attr('id') === undefined)
            this._elemInput.attr('id', this.comboTreeId + 'Input');
        this.elemInputId = this._elemInput.attr('id');

        this._elemInput.wrap('<div id="' + this.comboTreeId + 'Wrapper" class="comboTreeWrapper"></div>');
        this._elemInput.wrap('<div id="' + this.comboTreeId + 'InputWrapper" class="comboTreeInputWrapper"></div>');
        this._elemWrapper = $('#' + this.comboTreeId + 'Wrapper');

        this._elemArrowBtn = $('<div id="' + this.comboTreeId + 'ArrowBtn" class="comboTreeArrowBtn" type="button"><span class="mdi mdi-chevron-down comboTreeArrowBtnImg"></span></div>');
        this._elemInput.after(this._elemArrowBtn);
        this._elemWrapper.append('<div id="' + this.comboTreeId + 'DropDownContainer" class="comboTreeDropDownContainer"><div class="comboTreeDropDownContent"></div>');

        // DORP DOWN AREA
        this._elemDropDownContainer = $('#' + this.comboTreeId + 'DropDownContainer');

        this._elemDropDownContainer.html(this.createSourceHTML());
        this._elemFilterInput = this.options.isMultiple ? $('#' + this.comboTreeId + 'MultiFilter') : null;
        this._elemSourceUl = $('#' + this.comboTreeId + 'ComboTreeSourceUl');

        this._elemItems = this._elemDropDownContainer.find('li');
        this._elemItemsTitle = this._elemDropDownContainer.find('span.comboTreeItemTitle');

        // VARIABLES
        this._selectedItem = {};
        this._selectedItems = [];

        this.processSelected();

        this.bindings();
    };

    ComboTree.prototype.unbind = function () {
        this._elemArrowBtn.off('click');
        this._elemInput.off('click');
        this._elemItems.off('click');
        this._elemItemsTitle.off('click');
        this._elemItemsTitle.off("mousemove");
        this._elemInput.off('keyup');
        this._elemInput.off('keydown');
        this._elemInput.off('mouseup.' + this.comboTreeId);
        $(document).off('mouseup.' + this.comboTreeId);
    }

    ComboTree.prototype.destroy = function () {
        this.unbind();
        this._elemWrapper.before(this._elemInput);
        this._elemWrapper.remove();
        //this._elemInput.removeData('plugin_' + comboTreePlugin);
    }



    // CREATE DOM HTMLs

    ComboTree.prototype.removeSourceHTML = function () {
        this._elemDropDownContainer.html('');
    };

    ComboTree.prototype.createSourceHTML = function () {
        var sourceHTML = '';
        if (this.options.isMultiple)
            sourceHTML = this.createFilterHTMLForMultiSelect();
        sourceHTML += this.createSourceSubItemsHTML(this.options.source);
        return sourceHTML;
    };

    ComboTree.prototype.createFilterHTMLForMultiSelect = function () {
        return '<input id="' + this.comboTreeId + 'MultiFilter" type="text" class="multiplesFilter" placeholder="Type to filter"/>';
    }

    ComboTree.prototype.createSourceSubItemsHTML = function (subItems, parentId) {
        var subItemsHtml = '<UL id="' + this.comboTreeId + 'ComboTreeSourceUl' + (parentId ? parentId : 'main') + '" style="' + ((this.options.collapse && parentId) ? 'display:none;' : '') + '">';
        for (var i = 0; i < subItems.length; i++) {
            subItemsHtml += this.createSourceItemHTML(subItems[i]);
        }
        subItemsHtml += '</UL>'
        return subItemsHtml;
    }

    ComboTree.prototype.createSourceItemHTML = function (sourceItem) {
        var itemHtml = "",
            isThereSubs = sourceItem.hasOwnProperty("subs");
        let isSelectable = (sourceItem.isSelectable === undefined ? true : sourceItem.isSelectable),
            selectableClass = (isSelectable || isThereSubs) ? 'selectable' : 'not-selectable',
            selectableLastNode = (this.options.selectableLastNode !== undefined && isThereSubs) ? this.options.selectableLastNode : false;

        itemHtml += '<LI id="' + this.comboTreeId + 'Li' + sourceItem.id + '" class="ComboTreeItem' + (isThereSubs ? 'Parent' : 'Chlid') + '"> ';

        if (isThereSubs)
            itemHtml += '<span class="comboTreeParentPlus">' + (this.options.collapse ? '<span class="mdi mdi-chevron-right-circle-outline"></span>' : '<span class="mdi mdi-chevron-down-circle-outline"></span>') + '</span>'; // itemHtml += '<span class="comboTreeParentPlus">' + (this.options.collapse ? '+' : '&minus;') + '</span>';

        if (this.options.isMultiple)
            itemHtml += '<span data-id="' + sourceItem.id + '" data-selectable="' + isSelectable + '" class="comboTreeItemTitle ' + selectableClass + '">' + (!selectableLastNode && isSelectable ? '<input type="checkbox" />' : '') + sourceItem.title + '</span>';
        else
            itemHtml += '<span data-id="' + sourceItem.id + '" data-selectable="' + isSelectable + '" class="comboTreeItemTitle ' + selectableClass + '">' + sourceItem.title + '</span>';

        if (isThereSubs)
            itemHtml += this.createSourceSubItemsHTML(sourceItem.subs, sourceItem.id);

        itemHtml += '</LI>';
        return itemHtml;
    };


    // BINDINGS

    ComboTree.prototype.bindings = function () {
        var _this = this;

        $(this._elemInput).focus(function (e) {
            if (!_this._elemDropDownContainer.is(':visible'))
                $(_this._elemDropDownContainer).slideToggle(100);
        });

        this._elemArrowBtn.on('click', function (e) {
            e.stopPropagation();
            _this.toggleDropDown();
        });
        this._elemInput.on('click', function (e) {
            e.stopPropagation();
            if (!_this._elemDropDownContainer.is(':visible'))
                _this.toggleDropDown();
        });
        this._elemItems.on('click', function (e) {
            e.stopPropagation();
            if ($(this).hasClass('ComboTreeItemParent')) {
                _this.toggleSelectionTree(this);
            }
        });
        this._elemItemsTitle.on('click', function (e) {
            e.stopPropagation();
            if (_this.options.isMultiple)
                _this.multiItemClick(this);
            else
                _this.singleItemClick(this);
        });
        this._elemItemsTitle.on("mousemove", function (e) {
            e.stopPropagation();
            _this.dropDownMenuHover(this);
        });

        // KEY BINDINGS
        this._elemInput.on('keyup', function (e) {
            e.stopPropagation();

            switch (e.keyCode) {
                case 27:
                    _this.closeDropDownMenu(); break;
                case 13:
                case 39: case 37: case 40: case 38:
                    e.preventDefault();
                    break;
                default:
                    if (!_this.options.isMultiple)
                        _this.filterDropDownMenu();
                    break;
            }
        });

        this._elemFilterInput && this._elemFilterInput.on('keyup', function (e) {
            e.stopPropagation();

            switch (e.keyCode) {
                case 27:
                    if ($(this).val()) {
                        $(this).val('');
                        _this.filterDropDownMenu();
                    } else {
                        _this.closeDropDownMenu();
                    }
                    break;
                case 40: case 38:
                    e.preventDefault();
                    _this.dropDownInputKeyControl(e.keyCode - 39); break;
                case 37: case 39:
                    e.preventDefault();
                    _this.dropDownInputKeyToggleTreeControl(e.keyCode - 38);
                    break;
                case 13:
                    _this.multiItemClick(_this._elemHoveredItem);
                    e.preventDefault();
                    break;
                default:
                    _this.filterDropDownMenu();
                    break;
            }
        });

        this._elemInput.on('keydown', function (e) {
            e.stopPropagation();

            switch (e.keyCode) {
                case 9:
                    _this.closeDropDownMenu(); break;
                case 40: case 38:
                    e.preventDefault();
                    _this.dropDownInputKeyControl(e.keyCode - 39); break;
                case 37: case 39:
                    e.preventDefault();
                    _this.dropDownInputKeyToggleTreeControl(e.keyCode - 38);
                    break;
                case 13:
                    if (_this.options.isMultiple)
                        _this.multiItemClick(_this._elemHoveredItem);
                    else
                        _this.singleItemClick(_this._elemHoveredItem);
                    e.preventDefault();
                    break;
                default:
                    if (_this.options.isMultiple)
                        e.preventDefault();
            }
        });


        // ON FOCUS OUT CLOSE DROPDOWN
        $(document).on('mouseup.' + _this.comboTreeId, function (e) {
            if (!_this._elemWrapper.is(e.target) && _this._elemWrapper.has(e.target).length === 0 && _this._elemDropDownContainer.is(':visible'))
                _this.closeDropDownMenu();
        });
    };





    // EVENTS HERE

    // DropDown Menu Open/Close
    ComboTree.prototype.toggleDropDown = function () {
        let _this = this;
        $(this._elemDropDownContainer).slideToggle(100, function () {
            if (_this._elemDropDownContainer.is(':visible'))
                $(_this._elemInput).focus();
        });
    };

    ComboTree.prototype.closeDropDownMenu = function () {
        $(this._elemDropDownContainer).slideUp(100);
    };

    // Selection Tree Open/Close
    ComboTree.prototype.toggleSelectionTree = function (item, direction) {
        var subMenu = $(item).children('ul')[0];
        if (direction === undefined) {
            if ($(subMenu).is(':visible'))
                $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-right-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("+");
            else
                $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-down-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("&minus;");

            $(subMenu).slideToggle(50);
        }
        else if (direction == 1 && !$(subMenu).is(':visible')) {
            $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-down-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("&minus;");
            $(subMenu).slideDown(50);
        }
        else if (direction == -1) {
            if ($(subMenu).is(':visible')) {
                $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-right-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("+");
                $(subMenu).slideUp(50);
            }
            else {
                this.dropDownMenuHoverToParentItem(item);
            }
        }

    };


    // SELECTION FUNCTIONS
    ComboTree.prototype.selectMultipleItem = function (ctItem) {

        if (this.options.selectableLastNode && $(ctItem).parent('li').hasClass('ComboTreeItemParent')) {

            this.toggleSelectionTree($(ctItem).parent('li'));

            return false;
        }

        if ($(ctItem).data("selectable") == true) {
            this._selectedItem = {
                id: $(ctItem).attr("data-id"),
                title: $(ctItem).text()
            };

            let check = this.isItemInArray(this._selectedItem, this.options.source);
            if (check) {
                var index = this.isItemInArray(this._selectedItem, this._selectedItems);
                if (index) {
                    this._selectedItems.splice(parseInt(index), 1);
                    $(ctItem).find("input").prop('checked', false);
                } else {
                    this._selectedItems.push(this._selectedItem);
                    $(ctItem).find("input").prop('checked', true);
                }
            } // if check
        } // if selectable
    };

    ComboTree.prototype.singleItemClick = function (ctItem) {
        if ($(ctItem).data("selectable") == true) {
            this._selectedItem = {
                id: $(ctItem).attr("data-id"),
                title: $(ctItem).text()
            };
        } // if selectable

        this.refreshInputVal();
        this.closeDropDownMenu();
    };

    ComboTree.prototype.multiItemClick = function (ctItem) {
        this.selectMultipleItem(ctItem);

        if (this.options.cascadeSelect) {
            if ($(ctItem).parent('li').hasClass('ComboTreeItemParent')) {
                var subMenu = $(ctItem).parent('li').children('ul').first().find('input[type="checkbox"]');
                subMenu.each(function () {
                    var $input = $(this)
                    if ($(ctItem).children('input[type="checkbox"]').first().prop("checked") !== $input.prop('checked')) {
                        $input.prop('checked', !$(ctItem).children('input[type="checkbox"]').first().prop("checked"));
                        $input.trigger('click');
                    }
                });
            }
        }
        this.refreshInputVal();
    };


    // recursive search for item in arr
    ComboTree.prototype.isItemInArray = function (item, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (item.id == arr[i].id && item.title == arr[i].title)
                return i + "";

            if (arr[i].hasOwnProperty("subs")) {
                let found = this.isItemInArray(item, arr[i].subs);
                if (found)
                    return found;
            }
        }
        return false;
    };

    ComboTree.prototype.refreshInputVal = function () {
        var tmpTitle = "";

        if (this.options.isMultiple) {
            for (var i = 0; i < this._selectedItems.length; i++) {
                tmpTitle += this._selectedItems[i].title;
                if (i < this._selectedItems.length - 1)
                    tmpTitle += ", ";
            }
        }
        else {
            tmpTitle = this._selectedItem.title;
        }

        this._elemInput.val(tmpTitle);
        this._elemInput.trigger('change');

        if (this.changeHandler)
            this.changeHandler();
    };

    ComboTree.prototype.dropDownMenuHover = function (itemSpan, withScroll) {
        this._elemItems.find('span.comboTreeItemHover').removeClass('comboTreeItemHover');
        $(itemSpan).addClass('comboTreeItemHover');
        this._elemHoveredItem = $(itemSpan);
        if (withScroll)
            this.dropDownScrollToHoveredItem(this._elemHoveredItem);
    }

    ComboTree.prototype.dropDownScrollToHoveredItem = function (itemSpan) {
        var curScroll = this._elemSourceUl.scrollTop();
        this._elemSourceUl.scrollTop(curScroll + $(itemSpan).parent().position().top - 80);
    }

    ComboTree.prototype.dropDownMenuHoverToParentItem = function (item) {
        var parentSpanItem = $($(item).parents('li.ComboTreeItemParent')[0]).children("span.comboTreeItemTitle");
        if (parentSpanItem.length)
            this.dropDownMenuHover(parentSpanItem, true);
        else
            this.dropDownMenuHover(this._elemItemsTitle[0], true);
    }

    ComboTree.prototype.dropDownInputKeyToggleTreeControl = function (direction) {
        var item = this._elemHoveredItem;
        if ($(item).parent('li').hasClass('ComboTreeItemParent'))
            this.toggleSelectionTree($(item).parent('li'), direction);
        else if (direction == -1)
            this.dropDownMenuHoverToParentItem(item);
    }

    ComboTree.prototype.dropDownInputKeyControl = function (step) {
        if (!this._elemDropDownContainer.is(":visible"))
            this.toggleDropDown();

        var list = this._elemItems.find("span.comboTreeItemTitle:visible");
        i = this._elemHoveredItem ? list.index(this._elemHoveredItem) + step : 0;
        i = (list.length + i) % list.length;

        this.dropDownMenuHover(list[i], true);
    },

        ComboTree.prototype.filterDropDownMenu = function () {
            var searchText = '';
            if (!this.options.isMultiple)
                searchText = this._elemInput.val();
            else
                searchText = $("#" + this.comboTreeId + "MultiFilter").val();

            if (searchText != "") {
                this._elemItemsTitle.hide();
                this._elemItemsTitle.siblings("span.comboTreeParentPlus").hide();
                list = this._elemItems.filter(function (index, item) {
                    return item.innerHTML.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
                }).each(function (i, elem) {
                    $(this.children).show()
                    $(this).siblings("span.comboTreeParentPlus").show();
                });
            }
            else {
                this._elemItemsTitle.show();
                this._elemItemsTitle.siblings("span.comboTreeParentPlus").show();
            }
        }

    ComboTree.prototype.processSelected = function () {
        let elements = this._elemItemsTitle;
        let selectedItem = this._selectedItem;
        let selectedItems = this._selectedItems;
        this.options.selected.forEach(function (element) {
            let selected = $(elements).filter(function () {
                return $(this).data('id') == element;
            });

            if (selected.length > 0) {
                $(selected).find('input').attr('checked', true);

                selectedItem = {
                    id: selected.data("id"),
                    title: selected.text()
                };
                selectedItems.push(selectedItem);
            }
        });

        //Without this it doesn't work
        this._selectedItem = selectedItem;

        this.refreshInputVal();
    };


    // METHODS


    ComboTree.prototype.findItembyId = function (itemId, source) {
        if (itemId && source) {
            for (let i = 0; i < source.length; i++) {
                if (source[i].id == itemId)
                    return { id: source[i].id, title: source[i].title };
                if (source[i].hasOwnProperty("subs")) {
                    let found = this.findItembyId(itemId, source[i].subs);
                    if (found)
                        return found;
                }
            }
        }
        return null;
    }

    // Returns selected id array or null
    ComboTree.prototype.getSelectedIds = function () {
        if (this.options.isMultiple && this._selectedItems.length > 0) {
            var tmpArr = [];
            for (i = 0; i < this._selectedItems.length; i++)
                tmpArr.push(this._selectedItems[i].id);

            return tmpArr;
        }
        else if (!this.options.isMultiple && this._selectedItem.hasOwnProperty('id')) {
            return [this._selectedItem.id];
        }
        return null;
    };

    // Retuns Array (multiple), Integer (single), or False (No choice)
    ComboTree.prototype.getSelectedNames = function () {
        if (this.options.isMultiple && this._selectedItems.length > 0) {
            var tmpArr = [];
            for (i = 0; i < this._selectedItems.length; i++)
                tmpArr.push(this._selectedItems[i].title);

            return tmpArr;
        }
        else if (!this.options.isMultiple && this._selectedItem.hasOwnProperty('id')) {
            return this._selectedItem.title;
        }
        return null;
    };

    ComboTree.prototype.setSource = function (source) {
        this._selectedItems = [];

        this.destroy();
        this.options.source = source;
        this.constructorFunc(this.elemInput, this.options);
    };

    ComboTree.prototype.clearSelection = function () {
        for (i = 0; i < this._selectedItems.length; i++) {
            let itemElem = $("#" + this.comboTreeId + 'Li' + this._selectedItems[i].id);
            $(itemElem).find("input").prop('checked', false);
        }
        this._selectedItems = [];
        this.refreshInputVal();
    };

    ComboTree.prototype.setSelection = function (selectionIdList) {
        if (selectionIdList && selectionIdList.length && selectionIdList.length > 0) {
            for (let i = 0; i < selectionIdList.length; i++) {
                let selectedItem = this.findItembyId(selectionIdList[i], this.options.source);

                if (selectedItem) {
                    let check = this.isItemInArray(selectedItem, this.options.source);
                    if (check) {
                        var index = this.isItemInArray(selectedItem, this._selectedItems);
                        if (!index) {
                            let selectedItemElem = $("#" + this.comboTreeId + 'Li' + selectionIdList[i]);

                            this._selectedItems.push(selectedItem);
                            this._selectedItem = selectedItem;
                            $(selectedItemElem).find("input").prop('checked', true);
                        }
                    }
                }
            }
        }

        this.refreshInputVal();
    };


    // EVENTS

    ComboTree.prototype.onChange = function (callBack) {
        if (callBack && typeof callBack === "function")
            this.changeHandler = callBack;
    };



    // -----

    $.fn[comboTreePlugin] = function (options) {
        var ctArr = [];
        this.each(function () {
            if (!$.data(this, 'plugin_' + comboTreePlugin)) {
                $.data(this, 'plugin_' + comboTreePlugin, new ComboTree(this, options));
                ctArr.push($(this).data()['plugin_' + comboTreePlugin]);
            }
        });

        if (this.length == 1)
            return ctArr[0];
        else
            return ctArr;
    }

})(jQuery, window, document);
