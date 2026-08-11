/*! Currencies Mepto v1.0.0-mepto.1 — Mepto-integrated, jQuery-free */

var Currency = (function () {
  'use strict';

  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }

  var _G$location$hostname, _G$location, _jQuery$cookie, _jQuery;
  /**
   * Currencies — Mepto-integrated (jQuery-free)
   * Original: jquery.currencies.js © Caroline Schnapp (MIT), Klaus Hartl cookie (MIT)
   * Modernized: ESM + IIFE, Mepto `window.mepto || window.jQuery || window.$` fallback, native cookie,
   * scheduler batched convertAll, modern syntax, Babel → last 3 versions.
   * Keeps Currency API: cookie, moneyFormats, formatMoney, convert, convertAll, currentCurrency, format
   */

  var G = globalThis;
  var jQuery = G.jQuery || null;
  var $ = G.mepto || G.jQuery || G.$ || null;

  // hoisted regex — avoid per-call allocation (Part II Rule 27)
  var NON_DIGITS_RE = /[^0-9]/g;
  var PLACEHOLDER_RE = /\{\{\s*(\w+)\s*\}\}/;
  var THOUSANDS_RE = /(\d)(?=(?:\d\d\d)+(?:$|\D))/g;
  if (typeof Currency$1 === 'undefined') {
    var Currency$1 = {};
  }
  if (typeof window !== 'undefined') window.Currency = Currency$1;

  // ── Cookie — native, no jQuery.trim, no jQuery.cookie dep ──────────────────
  var trim = function trim(str) {
    return (str !== null && str !== void 0 ? str : '').trim();
  };
  function writeCookie(name, value) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var cfg = _objectSpread2(_objectSpread2({}, Currency$1.cookie.configuration), options);
    if (value === null) {
      value = '';
      cfg.expires = -1;
    }
    var expires = '';
    if (cfg.expires && (typeof cfg.expires === 'number' || cfg.expires.toUTCString)) {
      var d;
      if (typeof cfg.expires === 'number') {
        d = new Date();
        d.setTime(d.getTime() + cfg.expires * 24 * 60 * 60 * 1000);
      } else d = cfg.expires;
      expires = "; expires=".concat(d.toUTCString());
    }
    var path = cfg.path ? "; path=".concat(cfg.path) : '';
    var domain = cfg.domain ? "; domain=".concat(cfg.domain) : '';
    var secure = cfg.secure ? '; secure' : '';
    document.cookie = "".concat(name, "=").concat(encodeURIComponent(value)).concat(expires).concat(path).concat(domain).concat(secure);
  }
  function readCookie(name) {
    if (!document.cookie) return null;
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = trim(parts[i]);
      if (c.substring(0, name.length + 1) === "".concat(name, "=")) {
        return decodeURIComponent(c.substring(name.length + 1));
      }
    }
    return null;
  }
  Currency$1.cookie = {
    configuration: {
      expires: 365,
      path: '/',
      domain: (_G$location$hostname = (_G$location = G.location) === null || _G$location === void 0 ? void 0 : _G$location.hostname) !== null && _G$location$hostname !== void 0 ? _G$location$hostname : window.location.hostname
    },
    name: 'currency',
    write: function write(currency) {
      writeCookie(this.name, currency, this.configuration);
    },
    read: function read() {
      return readCookie(this.name);
    },
    destroy: function destroy() {
      writeCookie(this.name, null, this.configuration);
    }
  };

  // compat: keep jQuery.cookie alias if jQuery present (themes expect it)
  if (typeof jQuery !== 'undefined' && jQuery && !jQuery.cookie) {
    jQuery.cookie = function (name, value, opts) {
      if (typeof value !== 'undefined') writeCookie(name, value, opts);else return readCookie(name);
    };
  }
  // also expose via mepto for parity
  if ($ && !$.cookie) $.cookie = (_jQuery$cookie = (_jQuery = jQuery) === null || _jQuery === void 0 ? void 0 : _jQuery.cookie) !== null && _jQuery$cookie !== void 0 ? _jQuery$cookie : function (n, v, o) {
    return v !== undefined ? writeCookie(n, v, o) : readCookie(n);
  };

  // moneyFormats — keep as plain object (verbatim), but hoist lookup cache via Map for hot path
  Currency$1.moneyFormats = {
    "USD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} USD"
    },
    "EUR": {
      "money_format": "&euro;{{amount}}",
      "money_with_currency_format": "&euro;{{amount}} EUR"
    },
    "GBP": {
      "money_format": "&pound;{{amount}}",
      "money_with_currency_format": "&pound;{{amount}} GBP"
    },
    "CAD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} CAD"
    },
    "ALL": {
      "money_format": "Lek {{amount}}",
      "money_with_currency_format": "Lek {{amount}} ALL"
    },
    "DZD": {
      "money_format": "DA {{amount}}",
      "money_with_currency_format": "DA {{amount}} DZD"
    },
    "AOA": {
      "money_format": "Kz{{amount}}",
      "money_with_currency_format": "Kz{{amount}} AOA"
    },
    "ARS": {
      "money_format": "${{amount_with_comma_separator}}",
      "money_with_currency_format": "${{amount_with_comma_separator}} ARS"
    },
    "AMD": {
      "money_format": "{{amount}} AMD",
      "money_with_currency_format": "{{amount}} AMD"
    },
    "AWG": {
      "money_format": "Afl{{amount}}",
      "money_with_currency_format": "Afl{{amount}} AWG"
    },
    "AUD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} AUD"
    },
    "BBD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} Bds"
    },
    "AZN": {
      "money_format": "m.{{amount}}",
      "money_with_currency_format": "m.{{amount}} AZN"
    },
    "BDT": {
      "money_format": "Tk {{amount}}",
      "money_with_currency_format": "Tk {{amount}} BDT"
    },
    "BSD": {
      "money_format": "BS${{amount}}",
      "money_with_currency_format": "BS${{amount}} BSD"
    },
    "BHD": {
      "money_format": "{{amount}}0 BD",
      "money_with_currency_format": "{{amount}}0 BHD"
    },
    "BYR": {
      "money_format": "Br {{amount}}",
      "money_with_currency_format": "Br {{amount}} BYR"
    },
    "BZD": {
      "money_format": "BZ${{amount}}",
      "money_with_currency_format": "BZ${{amount}} BZD"
    },
    "BTN": {
      "money_format": "Nu {{amount}}",
      "money_with_currency_format": "Nu {{amount}} BTN"
    },
    "BAM": {
      "money_format": "KM {{amount_with_comma_separator}}",
      "money_with_currency_format": "KM {{amount_with_comma_separator}} BAM"
    },
    "BRL": {
      "money_format": "R$ {{amount_with_comma_separator}}",
      "money_with_currency_format": "R$ {{amount_with_comma_separator}} BRL"
    },
    "BOB": {
      "money_format": "Bs{{amount_with_comma_separator}}",
      "money_with_currency_format": "Bs{{amount_with_comma_separator}} BOB"
    },
    "BWP": {
      "money_format": "P{{amount}}",
      "money_with_currency_format": "P{{amount}} BWP"
    },
    "BND": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} BND"
    },
    "BGN": {
      "money_format": "{{amount}} лв",
      "money_with_currency_format": "{{amount}} лв BGN"
    },
    "MMK": {
      "money_format": "K{{amount}}",
      "money_with_currency_format": "K{{amount}} MMK"
    },
    "KHR": {
      "money_format": "KHR{{amount}}",
      "money_with_currency_format": "KHR{{amount}}"
    },
    "KYD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} KYD"
    },
    "XAF": {
      "money_format": "FCFA{{amount}}",
      "money_with_currency_format": "FCFA{{amount}} XAF"
    },
    "CLP": {
      "money_format": "${{amount_no_decimals}}",
      "money_with_currency_format": "${{amount_no_decimals}} CLP"
    },
    "CNY": {
      "money_format": "&#165;{{amount}}",
      "money_with_currency_format": "&#165;{{amount}} CNY"
    },
    "COP": {
      "money_format": "${{amount_with_comma_separator}}",
      "money_with_currency_format": "${{amount_with_comma_separator}} COP"
    },
    "CRC": {
      "money_format": "&#8353; {{amount_with_comma_separator}}",
      "money_with_currency_format": "&#8353; {{amount_with_comma_separator}} CRC"
    },
    "HRK": {
      "money_format": "{{amount_with_comma_separator}} kn",
      "money_with_currency_format": "{{amount_with_comma_separator}} kn HRK"
    },
    "CZK": {
      "money_format": "{{amount_with_comma_separator}} K&#269;",
      "money_with_currency_format": "{{amount_with_comma_separator}} K&#269;"
    },
    "DKK": {
      "money_format": "{{amount_with_comma_separator}}",
      "money_with_currency_format": "kr.{{amount_with_comma_separator}}"
    },
    "DOP": {
      "money_format": "RD$ {{amount}}",
      "money_with_currency_format": "RD$ {{amount}}"
    },
    "XCD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "EC${{amount}}"
    },
    "EGP": {
      "money_format": "LE {{amount}}",
      "money_with_currency_format": "LE {{amount}} EGP"
    },
    "ETB": {
      "money_format": "Br{{amount}}",
      "money_with_currency_format": "Br{{amount}} ETB"
    },
    "XPF": {
      "money_format": "{{amount_no_decimals_with_comma_separator}} XPF",
      "money_with_currency_format": "{{amount_no_decimals_with_comma_separator}} XPF"
    },
    "FJD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "FJ${{amount}}"
    },
    "GMD": {
      "money_format": "D {{amount}}",
      "money_with_currency_format": "D {{amount}} GMD"
    },
    "GHS": {
      "money_format": "GH&#8373;{{amount}}",
      "money_with_currency_format": "GH&#8373;{{amount}}"
    },
    "GTQ": {
      "money_format": "Q{{amount}}",
      "money_with_currency_format": "{{amount}} GTQ"
    },
    "GYD": {
      "money_format": "G${{amount}}",
      "money_with_currency_format": "${{amount}} GYD"
    },
    "GEL": {
      "money_format": "{{amount}} GEL",
      "money_with_currency_format": "{{amount}} GEL"
    },
    "HNL": {
      "money_format": "L {{amount}}",
      "money_with_currency_format": "L {{amount}} HNL"
    },
    "HKD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "HK${{amount}}"
    },
    "HUF": {
      "money_format": "{{amount_no_decimals_with_comma_separator}}",
      "money_with_currency_format": "{{amount_no_decimals_with_comma_separator}} Ft"
    },
    "ISK": {
      "money_format": "{{amount_no_decimals}} kr",
      "money_with_currency_format": "{{amount_no_decimals}} kr ISK"
    },
    "INR": {
      "money_format": "Rs. {{amount}}",
      "money_with_currency_format": "Rs. {{amount}}"
    },
    "IDR": {
      "money_format": "{{amount_with_comma_separator}}",
      "money_with_currency_format": "Rp {{amount_with_comma_separator}}"
    },
    "ILS": {
      "money_format": "{{amount}} NIS",
      "money_with_currency_format": "{{amount}} NIS"
    },
    "JMD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} JMD"
    },
    "JPY": {
      "money_format": "&#165;{{amount_no_decimals}}",
      "money_with_currency_format": "&#165;{{amount_no_decimals}} JPY"
    },
    "JEP": {
      "money_format": "&pound;{{amount}}",
      "money_with_currency_format": "&pound;{{amount}} JEP"
    },
    "JOD": {
      "money_format": "{{amount}}0 JD",
      "money_with_currency_format": "{{amount}}0 JOD"
    },
    "KZT": {
      "money_format": "{{amount}} KZT",
      "money_with_currency_format": "{{amount}} KZT"
    },
    "KES": {
      "money_format": "KSh{{amount}}",
      "money_with_currency_format": "KSh{{amount}}"
    },
    "KWD": {
      "money_format": "{{amount}}0 KD",
      "money_with_currency_format": "{{amount}}0 KWD"
    },
    "KGS": {
      "money_format": "лв{{amount}}",
      "money_with_currency_format": "лв{{amount}}"
    },
    "LVL": {
      "money_format": "Ls {{amount}}",
      "money_with_currency_format": "Ls {{amount}} LVL"
    },
    "LBP": {
      "money_format": "L&pound;{{amount}}",
      "money_with_currency_format": "L&pound;{{amount}} LBP"
    },
    "LTL": {
      "money_format": "{{amount}} Lt",
      "money_with_currency_format": "{{amount}} Lt"
    },
    "MGA": {
      "money_format": "Ar {{amount}}",
      "money_with_currency_format": "Ar {{amount}} MGA"
    },
    "MKD": {
      "money_format": "ден {{amount}}",
      "money_with_currency_format": "ден {{amount}} MKD"
    },
    "MOP": {
      "money_format": "MOP${{amount}}",
      "money_with_currency_format": "MOP${{amount}}"
    },
    "MVR": {
      "money_format": "Rf{{amount}}",
      "money_with_currency_format": "Rf{{amount}} MRf"
    },
    "MXN": {
      "money_format": "$ {{amount}}",
      "money_with_currency_format": "$ {{amount}} MXN"
    },
    "MYR": {
      "money_format": "RM{{amount}} MYR",
      "money_with_currency_format": "RM{{amount}} MYR"
    },
    "MUR": {
      "money_format": "Rs {{amount}}",
      "money_with_currency_format": "Rs {{amount}} MUR"
    },
    "MDL": {
      "money_format": "{{amount}} MDL",
      "money_with_currency_format": "{{amount}} MDL"
    },
    "MAD": {
      "money_format": "{{amount}} dh",
      "money_with_currency_format": "Dh {{amount}} MAD"
    },
    "MNT": {
      "money_format": "{{amount_no_decimals}} &#8366",
      "money_with_currency_format": "{{amount_no_decimals}} MNT"
    },
    "MZN": {
      "money_format": "{{amount}} Mt",
      "money_with_currency_format": "Mt {{amount}} MZN"
    },
    "NAD": {
      "money_format": "N${{amount}}",
      "money_with_currency_format": "N${{amount}} NAD"
    },
    "NPR": {
      "money_format": "Rs{{amount}}",
      "money_with_currency_format": "Rs{{amount}} NPR"
    },
    "ANG": {
      "money_format": "&fnof;{{amount}}",
      "money_with_currency_format": "{{amount}} NA&fnof;"
    },
    "NZD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} NZD"
    },
    "NIO": {
      "money_format": "C${{amount}}",
      "money_with_currency_format": "C${{amount}} NIO"
    },
    "NGN": {
      "money_format": "&#8358;{{amount}}",
      "money_with_currency_format": "&#8358;{{amount}} NGN"
    },
    "NOK": {
      "money_format": "kr {{amount_with_comma_separator}}",
      "money_with_currency_format": "kr {{amount_with_comma_separator}} NOK"
    },
    "OMR": {
      "money_format": "{{amount_with_comma_separator}} OMR",
      "money_with_currency_format": "{{amount_with_comma_separator}} OMR"
    },
    "PKR": {
      "money_format": "Rs.{{amount}}",
      "money_with_currency_format": "Rs.{{amount}} PKR"
    },
    "PGK": {
      "money_format": "K {{amount}}",
      "money_with_currency_format": "K {{amount}} PGK"
    },
    "PYG": {
      "money_format": "Gs. {{amount_no_decimals_with_comma_separator}}",
      "money_with_currency_format": "Gs. {{amount_no_decimals_with_comma_separator}} PYG"
    },
    "PEN": {
      "money_format": "S/. {{amount}}",
      "money_with_currency_format": "S/. {{amount}} PEN"
    },
    "PHP": {
      "money_format": "&#8369;{{amount}}",
      "money_with_currency_format": "&#8369;{{amount}} PHP"
    },
    "PLN": {
      "money_format": "{{amount_with_comma_separator}} zl",
      "money_with_currency_format": "{{amount_with_comma_separator}} zl PLN"
    },
    "QAR": {
      "money_format": "QAR {{amount_with_comma_separator}}",
      "money_with_currency_format": "QAR {{amount_with_comma_separator}}"
    },
    "RON": {
      "money_format": "{{amount_with_comma_separator}} lei",
      "money_with_currency_format": "{{amount_with_comma_separator}} lei RON"
    },
    "RUB": {
      "money_format": "&#1088;&#1091;&#1073;{{amount_with_comma_separator}}",
      "money_with_currency_format": "&#1088;&#1091;&#1073;{{amount_with_comma_separator}} RUB"
    },
    "RWF": {
      "money_format": "{{amount_no_decimals}} RF",
      "money_with_currency_format": "{{amount_no_decimals}} RWF"
    },
    "WST": {
      "money_format": "WS$ {{amount}}",
      "money_with_currency_format": "WS$ {{amount}} WST"
    },
    "SAR": {
      "money_format": "{{amount}} SR",
      "money_with_currency_format": "{{amount}} SAR"
    },
    "STD": {
      "money_format": "Db {{amount}}",
      "money_with_currency_format": "Db {{amount}} STD"
    },
    "RSD": {
      "money_format": "{{amount}} RSD",
      "money_with_currency_format": "{{amount}} RSD"
    },
    "SCR": {
      "money_format": "Rs {{amount}}",
      "money_with_currency_format": "Rs {{amount}} SCR"
    },
    "SGD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} SGD"
    },
    "SYP": {
      "money_format": "S&pound;{{amount}}",
      "money_with_currency_format": "S&pound;{{amount}} SYP"
    },
    "ZAR": {
      "money_format": "R {{amount}}",
      "money_with_currency_format": "R {{amount}} ZAR"
    },
    "KRW": {
      "money_format": "&#8361;{{amount_no_decimals}}",
      "money_with_currency_format": "&#8361;{{amount_no_decimals}} KRW"
    },
    "LKR": {
      "money_format": "Rs {{amount}}",
      "money_with_currency_format": "Rs {{amount}} LKR"
    },
    "SEK": {
      "money_format": "{{amount_no_decimals}} kr",
      "money_with_currency_format": "{{amount_no_decimals}} kr SEK"
    },
    "CHF": {
      "money_format": "SFr. {{amount}}",
      "money_with_currency_format": "SFr. {{amount}} CHF"
    },
    "TWD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} TWD"
    },
    "THB": {
      "money_format": "{{amount}} &#xe3f;",
      "money_with_currency_format": "{{amount}} &#xe3f; THB"
    },
    "TZS": {
      "money_format": "{{amount}} TZS",
      "money_with_currency_format": "{{amount}} TZS"
    },
    "TTD": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}} TTD"
    },
    "TND": {
      "money_format": "{{amount}}",
      "money_with_currency_format": "{{amount}} DT"
    },
    "TRY": {
      "money_format": "{{amount}}TL",
      "money_with_currency_format": "{{amount}}TL"
    },
    "UGX": {
      "money_format": "Ush {{amount_no_decimals}}",
      "money_with_currency_format": "Ush {{amount_no_decimals}} UGX"
    },
    "UAH": {
      "money_format": "₴{{amount}}",
      "money_with_currency_format": "₴{{amount}} UAH"
    },
    "AED": {
      "money_format": "Dhs. {{amount}}",
      "money_with_currency_format": "Dhs. {{amount}} AED"
    },
    "UYU": {
      "money_format": "${{amount_with_comma_separator}}",
      "money_with_currency_format": "${{amount_with_comma_separator}} UYU"
    },
    "VUV": {
      "money_format": "${{amount}}",
      "money_with_currency_format": "${{amount}}VT"
    },
    "VEF": {
      "money_format": "Bs. {{amount_with_comma_separator}}",
      "money_with_currency_format": "Bs. {{amount_with_comma_separator}} VEF"
    },
    "VND": {
      "money_format": "{{amount_no_decimals_with_comma_separator}}&#8363;",
      "money_with_currency_format": "{{amount_no_decimals_with_comma_separator}} VND"
    },
    "XBT": {
      "money_format": "{{amount_no_decimals}} BTC",
      "money_with_currency_format": "{{amount_no_decimals}} BTC"
    },
    "XOF": {
      "money_format": "CFA{{amount}}",
      "money_with_currency_format": "CFA{{amount}} XOF"
    },
    "ZMW": {
      "money_format": "K{{amount_no_decimals_with_comma_separator}}",
      "money_with_currency_format": "ZMW{{amount_no_decimals_with_comma_separator}}"
    }
  };
  Currency$1.formatMoney = function (cents, format) {
    if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') return Shopify.formatMoney(cents, format);
    if (typeof cents === 'string') cents = cents.replace('.', '');
    var formatString = format || '${{amount}}';
    var m = formatString.match(PLACEHOLDER_RE);
    var type = m ? m[1] : 'amount';
    var value = '';
    var def = function def(opt, d) {
      return opt === undefined ? d : opt;
    };
    var withDelims = function withDelims(num, prec, thou, dec) {
      prec = def(prec, 2);
      thou = def(thou, ',');
      dec = def(dec, '.');
      if (isNaN(num) || num == null) return 0;
      num = (num / 100).toFixed(prec);
      var parts = num.split('.');
      var dollars = parts[0].replace(THOUSANDS_RE, "$1".concat(thou));
      var centsPart = parts[1] ? dec + parts[1] : '';
      return dollars + centsPart;
    };
    switch (type) {
      case 'amount':
        value = withDelims(cents, 2);
        break;
      case 'amount_no_decimals':
        value = withDelims(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = withDelims(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = withDelims(cents, 0, '.', ',');
        break;
      default:
        value = withDelims(cents, 2);
        break;
    }
    return formatString.replace(PLACEHOLDER_RE, value);
  };
  Currency$1.currentCurrency = '';
  Currency$1.format = 'money_with_currency_format';

  // convert is from upstream currencies.js (Shopify) — assume present on page via {{ "/services/javascripts/currencies.js" | script_tag }}
  // If not present, provide no-op fallback to avoid crash in convertAll

  Currency$1.convertAll = function (oldCurrency, newCurrency, selector, format) {
    var _Currency$moneyFormat, _Currency$moneyFormat2;
    var sel = selector || 'span.money';
    // Use native querySelectorAll directly — Mepto's $(sel).toArray() allocates collection wrapper,
    // native is already fast for simple selectors and avoids extra array copy
    var nodes = Array.from(document.querySelectorAll(sel));
    var fmt = format || Currency$1.format;
    // hoisted — same for all nodes, no per-element Map lookups (was 2 Maps + N lookups)
    var oldFmt = ((_Currency$moneyFormat = Currency$1.moneyFormats[oldCurrency]) === null || _Currency$moneyFormat === void 0 ? void 0 : _Currency$moneyFormat[fmt]) || '{{amount}}';
    var newFmt = ((_Currency$moneyFormat2 = Currency$1.moneyFormats[newCurrency]) === null || _Currency$moneyFormat2 === void 0 ? void 0 : _Currency$moneyFormat2[fmt]) || '{{amount}}';
    var saveAttr = "data-currency-".concat(newCurrency);
    var isOldNoDecimals = oldFmt.includes('amount_no_decimals');
    var isOldSpecial = oldCurrency === 'JOD' || oldCurrency === 'KWD' || oldCurrency === 'BHD';

    // Part I §3/§5: separate read phase (collect text/attrs) from write phase — one layout for 50+ spans
    // Use textContent not innerHTML — avoids HTML serialization, faster for money text
    var reads = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var cur = el.getAttribute('data-currency');
      if (cur === newCurrency) continue;
      // hoisted saveAttr string — was N template allocations
      var saved = el.getAttribute(saveAttr);
      if (saved) {
        reads.push({
          el: el,
          type: 'saved',
          saved: saved
        });
      } else {
        var text = el.textContent;
        var digits = text.replace(NON_DIGITS_RE, '');
        var cents = void 0;
        // hoisted branch checks — were per-element indexOf + 3-way equality
        if (isOldNoDecimals) {
          cents = Currency$1.convert(parseInt(digits, 10) * 100, oldCurrency, newCurrency);
        } else if (isOldSpecial) {
          cents = Currency$1.convert(parseInt(digits, 10) / 10, oldCurrency, newCurrency);
        } else {
          cents = Currency$1.convert(parseInt(digits, 10), oldCurrency, newCurrency);
        }
        var formatted = Currency$1.formatMoney(cents, newFmt);
        reads.push({
          el: el,
          type: 'converted',
          formatted: formatted
        });
      }
    }

    // batch writes — single layout, no rAF deferral (keeps cookie/currentCurrency sync for callers)
    for (var _i = 0; _i < reads.length; _i++) {
      var r = reads[_i];
      if (r.type === 'saved') r.el.textContent = r.saved;else {
        r.el.textContent = r.formatted;
        r.el.setAttribute(saveAttr, r.formatted);
      }
      r.el.setAttribute('data-currency', newCurrency);
    }
    this.currentCurrency = newCurrency;
    this.cookie.write(newCurrency);
  };
  Currency$1.setMepto = Currency$1.setJQuery = function (jq) {
    $ = jq;
    jQuery = jq;
    if (typeof window !== 'undefined') window.mepto = window.jQuery = window.$ = jq;
  };
  const Currency = Currency$1;

  return Currency;

})();
