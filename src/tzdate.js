/*
 * TZDate adds timezone support to the native Date.
 *
 * Based on the timezone-js and XDate libraries, this library attempts to combine the best of both.
 *
 */

var TZDate = (function(Date, Math, Array) {

  TZDate.VERSION = "0.0.1";

  var ISO_FORMAT_STRING = "yyyy-MM-dd'T'HH:mm:ss.fff";
  var ISO_FORMAT_STRING_TZ = ISO_FORMAT_STRING + "zzz";

  var formatStringRE = new RegExp(
    "(([a-zA-Z])\\2*)|" + // 1, 2
    "(\\(" + "(('.*?'|\\(.*?\\)|.)*?)" + "\\))|" + // 3, 4, 5 (allows for 1 level of inner quotes or parens)
    "('(.*?)')" // 6, 7
  );

  // Mappings from Rails to match timezones
  var _timezoneMappings = {
        "International Date Line West" : "Pacific/Midway",
        "Midway Island"                : "Pacific/Midway",
        "American Samoa"               : "Pacific/Pago_Pago",
        "Hawaii"                       : "Pacific/Honolulu",
        "Alaska"                       : "America/Juneau",
        "Pacific Time (US & Canada)"   : "America/Los_Angeles",
        "Tijuana"                      : "America/Tijuana",
        "Mountain Time (US & Canada)"  : "America/Denver",
        "Arizona"                      : "America/Phoenix",
        "Chihuahua"                    : "America/Chihuahua",
        "Mazatlan"                     : "America/Mazatlan",
        "Central Time (US & Canada)"   : "America/Chicago",
        "Saskatchewan"                 : "America/Regina",
        "Guadalajara"                  : "America/Mexico_City",
        "Mexico City"                  : "America/Mexico_City",
        "Monterrey"                    : "America/Monterrey",
        "Central America"              : "America/Guatemala",
        "Eastern Time (US & Canada)"   : "America/New_York",
        "Indiana (East)"               : "America/Indiana/Indianapolis",
        "Bogota"                       : "America/Bogota",
        "Lima"                         : "America/Lima",
        "Quito"                        : "America/Lima",
        "Atlantic Time (Canada)"       : "America/Halifax",
        "Caracas"                      : "America/Caracas",
        "La Paz"                       : "America/La_Paz",
        "Santiago"                     : "America/Santiago",
        "Newfoundland"                 : "America/St_Johns",
        "Brasilia"                     : "America/Sao_Paulo",
        "Buenos Aires"                 : "America/Argentina/Buenos_Aires",
        "Georgetown"                   : "America/Guyana",
        "Greenland"                    : "America/Godthab",
        "Mid-Atlantic"                 : "Atlantic/South_Georgia",
        "Azores"                       : "Atlantic/Azores",
        "Cape Verde Is."               : "Atlantic/Cape_Verde",
        "Dublin"                       : "Europe/Dublin",
        "Edinburgh"                    : "Europe/London",
        "Lisbon"                       : "Europe/Lisbon",
        "London"                       : "Europe/London",
        "Casablanca"                   : "Africa/Casablanca",
        "Monrovia"                     : "Africa/Monrovia",
        "UTC"                          : "Etc/UTC",
        "Belgrade"                     : "Europe/Belgrade",
        "Bratislava"                   : "Europe/Bratislava",
        "Budapest"                     : "Europe/Budapest",
        "Ljubljana"                    : "Europe/Ljubljana",
        "Prague"                       : "Europe/Prague",
        "Sarajevo"                     : "Europe/Sarajevo",
        "Skopje"                       : "Europe/Skopje",
        "Warsaw"                       : "Europe/Warsaw",
        "Zagreb"                       : "Europe/Zagreb",
        "Brussels"                     : "Europe/Brussels",
        "Copenhagen"                   : "Europe/Copenhagen",
        "Madrid"                       : "Europe/Madrid",
        "Paris"                        : "Europe/Paris",
        "Amsterdam"                    : "Europe/Amsterdam",
        "Berlin"                       : "Europe/Berlin",
        "Bern"                         : "Europe/Berlin",
        "Rome"                         : "Europe/Rome",
        "Stockholm"                    : "Europe/Stockholm",
        "Vienna"                       : "Europe/Vienna",
        "West Central Africa"          : "Africa/Algiers",
        "Bucharest"                    : "Europe/Bucharest",
        "Cairo"                        : "Africa/Cairo",
        "Helsinki"                     : "Europe/Helsinki",
        "Kyiv"                         : "Europe/Kiev",
        "Riga"                         : "Europe/Riga",
        "Sofia"                        : "Europe/Sofia",
        "Tallinn"                      : "Europe/Tallinn",
        "Vilnius"                      : "Europe/Vilnius",
        "Athens"                       : "Europe/Athens",
        "Istanbul"                     : "Europe/Istanbul",
        "Minsk"                        : "Europe/Minsk",
        "Jerusalem"                    : "Asia/Jerusalem",
        "Harare"                       : "Africa/Harare",
        "Pretoria"                     : "Africa/Johannesburg",
        "Moscow"                       : "Europe/Moscow",
        "St. Petersburg"               : "Europe/Moscow",
        "Volgograd"                    : "Europe/Moscow",
        "Kuwait"                       : "Asia/Kuwait",
        "Riyadh"                       : "Asia/Riyadh",
        "Nairobi"                      : "Africa/Nairobi",
        "Baghdad"                      : "Asia/Baghdad",
        "Tehran"                       : "Asia/Tehran",
        "Abu Dhabi"                    : "Asia/Muscat",
        "Muscat"                       : "Asia/Muscat",
        "Baku"                         : "Asia/Baku",
        "Tbilisi"                      : "Asia/Tbilisi",
        "Yerevan"                      : "Asia/Yerevan",
        "Kabul"                        : "Asia/Kabul",
        "Ekaterinburg"                 : "Asia/Yekaterinburg",
        "Islamabad"                    : "Asia/Karachi",
        "Karachi"                      : "Asia/Karachi",
        "Tashkent"                     : "Asia/Tashkent",
        "Chennai"                      : "Asia/Kolkata",
        "Kolkata"                      : "Asia/Kolkata",
        "Mumbai"                       : "Asia/Kolkata",
        "New Delhi"                    : "Asia/Kolkata",
        "Kathmandu"                    : "Asia/Kathmandu",
        "Astana"                       : "Asia/Dhaka",
        "Dhaka"                        : "Asia/Dhaka",
        "Sri Jayawardenepura"          : "Asia/Colombo",
        "Almaty"                       : "Asia/Almaty",
        "Novosibirsk"                  : "Asia/Novosibirsk",
        "Rangoon"                      : "Asia/Rangoon",
        "Bangkok"                      : "Asia/Bangkok",
        "Hanoi"                        : "Asia/Bangkok",
        "Jakarta"                      : "Asia/Jakarta",
        "Krasnoyarsk"                  : "Asia/Krasnoyarsk",
        "Beijing"                      : "Asia/Shanghai",
        "Chongqing"                    : "Asia/Chongqing",
        "Hong Kong"                    : "Asia/Hong_Kong",
        "Urumqi"                       : "Asia/Urumqi",
        "Kuala Lumpur"                 : "Asia/Kuala_Lumpur",
        "Singapore"                    : "Asia/Singapore",
        "Taipei"                       : "Asia/Taipei",
        "Perth"                        : "Australia/Perth",
        "Irkutsk"                      : "Asia/Irkutsk",
        "Ulaan Bataar"                 : "Asia/Ulaanbaatar",
        "Seoul"                        : "Asia/Seoul",
        "Osaka"                        : "Asia/Tokyo",
        "Sapporo"                      : "Asia/Tokyo",
        "Tokyo"                        : "Asia/Tokyo",
        "Yakutsk"                      : "Asia/Yakutsk",
        "Darwin"                       : "Australia/Darwin",
        "Adelaide"                     : "Australia/Adelaide",
        "Canberra"                     : "Australia/Melbourne",
        "Melbourne"                    : "Australia/Melbourne",
        "Sydney"                       : "Australia/Sydney",
        "Brisbane"                     : "Australia/Brisbane",
        "Hobart"                       : "Australia/Hobart",
        "Vladivostok"                  : "Asia/Vladivostok",
        "Guam"                         : "Pacific/Guam",
        "Port Moresby"                 : "Pacific/Port_Moresby",
        "Magadan"                      : "Asia/Magadan",
        "Solomon Is."                  : "Asia/Magadan",
        "New Caledonia"                : "Pacific/Noumea",
        "Fiji"                         : "Pacific/Fiji",
        "Kamchatka"                    : "Asia/Kamchatka",
        "Marshall Is."                 : "Pacific/Majuro",
        "Auckland"                     : "Pacific/Auckland",
        "Wellington"                   : "Pacific/Auckland",
        "Nuku'alofa"                   : "Pacific/Tongatapu",
        "Tokelau Is."                  : "Pacific/Fakaofo",
        "Samoa"                        : "Pacific/Apia"
  };


  // Grab the ajax library from global context.
  // This can be jQuery, Zepto or fleegix.
  // You can also specify your own transport mechanism by declaring
  // `TZDate.timezone.transport` to a `function`. More details will follow
  var root = this;
  var $ = root.$ || root.jQuery || root.Zepto
    , fleegix = root.fleegix
    , EXACT_DATE_TIME = {};


  // Handle array indexOf in IE
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (el) {
      for (var i = 0; i < this.length; i++ ) {
        if (el === this[i]) return i;
      }
      return -1;
    }
  }


  /* Constructor
   -------------------------------------------------------------*/

  function TZDate() {
    return init(
      (this instanceof TZDate) ? this : new TZDate(),
      Array.prototype.slice.apply(arguments)
    );
  }

  function init(date, args) {
    var dt = null
      , tz = null
      , arr = [];

    // We support several different constructors, including all the ones from `Date` object
    // with a timezone string at the end.
    //
    // - `[tz]`: Returns object with time in `tz` specified.
    //
    // - `utcMillis`, `[tz]`: Return object with UTC time = `utcMillis`, in `tz`.
    //
    // - `Date`, `[tz]`: Returns object with UTC time = `Date.getTime()`, in `tz`.
    //
    // - `year, month, [date,] [hours,] [minutes,] [seconds,] [millis,] [tz]: Same as `Date` object
    //   with tz.
    //
    // - `Array`: Can be any combo of the above.
    //
    // If 1st argument is an array, we can use it as a list of arguments itself
    if (Object.prototype.toString.call(args[0]) === '[object Array]') {
      args = args[0];
    }
    if (isTimezone(args[args.length - 1])) {
      tz = args.pop();
    }
    if (args.length == 0) {
      dt = new Date();
    } else if ((args.length == 1) && 
        (!args[0] || isObject(args[0]) || isNumber(args[0]) ||
         isRFCDate(args[0]) || isHumanDate(args[0]))) {
      // String parsing is a bit rubbish
      dt = new Date(args[0]);
    } else {
      if (args.length == 1) {
        arr = args[0].split(/\D+/);
        arr[1] = arr[1] - 1; // fix month
      } else {
        for (var i = 0; i < 7; i++) {
          arr[i] = args[i];
        }
      }
      for (var i = 0; i < 7; i++) {
        arr[i] = parseInt(arr[i] || 0);
      }
      dt = new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]);
    }

    // Reset the date attributes
    date._useCache = false;
    date._tzInfo = {};
    date._day = 0;
    date.year = 0;
    date.month = 0;
    date.date = 0;
    date.hours = 0;
    date.minutes = 0;
    date.seconds = 0;
    date.milliseconds = 0;
    tz = _timezoneMappings[tz] || tz
    date.timezone = tz || null;

    /*
     * Tricky part:
     * For the cases where there are 1/2 arguments: `TZDate(millis, [tz])`, `TZDate(Date, [tz])`,
     * or `TZDate('2012-08-12T12:32:43Z', [tz])` we know that the dt should be in UTC.
     * Otherwise, assume we've been provided a local time to be handled as if it was
     * an array.
     */
    if (arr.length) {
       date.setFromDateObjProxy(dt);
    } else {
       date.setFromTimeProxy(dt.getTime(), tz);
    }
  }

  var proto = TZDate.prototype = {
    getDate: function () { return this.date; },
    getDay: function () { return this._day; },
    getFullYear: function () { return this.year; },
    getMonth: function () { return this.month; },
    getYear: function () { return this.year; },
    getHours: function () { return this.hours; },
    getMilliseconds: function () { return this.milliseconds; },
    getMinutes: function () { return this.minutes; },
    getSeconds: function () { return this.seconds; },
    getUTCDate: function () { return this.getUTCDateProxy().getUTCDate(); },
    getUTCDay: function () { return this.getUTCDateProxy().getUTCDay(); },
    getUTCFullYear: function () { return this.getUTCDateProxy().getUTCFullYear(); },
    getUTCHours: function () { return this.getUTCDateProxy().getUTCHours(); },
    getUTCMilliseconds: function () { return this.getUTCDateProxy().getUTCMilliseconds(); },
    getUTCMinutes: function () { return this.getUTCDateProxy().getUTCMinutes(); },
    getUTCMonth: function () { return this.getUTCDateProxy().getUTCMonth(); },
    getUTCSeconds: function () { return this.getUTCDateProxy().getUTCSeconds(); },
    // Time adjusted to user-specified timezone
    getTime: function () {
      return this._timeProxy + (this.getTimezoneOffset() * 60 * 1000);
    },
    getTimezone: function () { return this.timezone; },
    getTimezoneOffset: function () { return this.getTimezoneInfo().tzOffset; },
    getTimezoneAbbreviation: function () { return this.getTimezoneInfo().tzAbbr; },
    getTimezoneInfo: function () {
      if (this._useCache) return this._tzInfo;
      var res;
      // If timezone is specified, get the correct timezone info based on the Date given
      if (this.timezone) {
        res = TZDate.timezone.getTzInfo(this._timeProxy, this.timezone);
      }
      // If no timezone was specified, use the local browser offset
      else {
        res = { tzOffset: this.getLocalOffset(), tzAbbr: null };
      }
      this._tzInfo = res;
      this._useCache = true;
      return res
    },
    getUTCDateProxy: function () {
      var dt = new Date(this._timeProxy);
      dt.setUTCMinutes(dt.getUTCMinutes() + this.getTimezoneOffset());
      return dt;
    },
    setDate: function (n) { this.setAttribute('date', n); },
    setFullYear: function (n) { this.setAttribute('year', n); },
    setMonth: function (n) { this.setAttribute('month', n); },
    setYear: function (n) { this.setUTCAttribute('year', n); },
    setHours: function (n) { this.setAttribute('hours', n); },
    setMilliseconds: function (n) { this.setAttribute('milliseconds', n); },
    setMinutes: function (n) { this.setAttribute('minutes', n); },
    setSeconds: function (n) { this.setAttribute('seconds', n); },
    setTime: function (n) {
      if (isNaN(n)) { throw new Error('Units must be a number.'); }
      this.setFromTimeProxy(n, this.timezone);
    },
    setUTCDate: function (n) { this.setUTCAttribute('date', n); },
    setUTCFullYear: function (n) { this.setUTCAttribute('year', n); },
    setUTCHours: function (n) { this.setUTCAttribute('hours', n); },
    setUTCMilliseconds: function (n) { this.setUTCAttribute('milliseconds', n); },
    setUTCMinutes: function (n) { this.setUTCAttribute('minutes', n); },
    setUTCMonth: function (n) { this.setUTCAttribute('month', n); },
    setUTCSeconds: function (n) { this.setUTCAttribute('seconds', n); },
    setFromDateObjProxy: function (dt) {
      this.year = dt.getFullYear();
      this.month = dt.getMonth();
      this.date = dt.getDate();
      this.hours = dt.getHours();
      this.minutes = dt.getMinutes();
      this.seconds = dt.getSeconds();
      this.milliseconds = dt.getMilliseconds();
      this._day =  dt.getDay();
      this._dateProxy = dt;
      this._timeProxy = Date.UTC(this.year, this.month, this.date, this.hours, this.minutes, this.seconds, this.milliseconds);
      this._useCache = false;
      this[0] = this._dateProxy; // for pretty console output
    },
    setFromTimeProxy: function (utcMillis, tz) {
      var dt = new Date(utcMillis);
      var tzOffset;
      tzOffset = tz ? TZDate.timezone.getTzInfo(dt, tz).tzOffset : dt.getTimezoneOffset();
      dt.setTime(utcMillis + (dt.getTimezoneOffset() - tzOffset) * 60000);
      this.setFromDateObjProxy(dt);
    },
    setAttribute: function (unit, n) {
      if (isNaN(n)) { throw new Error('Units must be a number.'); }
      var dt = this._dateProxy;
      var meth = unit === 'year' ? 'FullYear' : unit.substr(0, 1).toUpperCase() + unit.substr(1);
      dt['set' + meth](n);
      this.setFromDateObjProxy(dt);
    },
    setUTCAttribute: function (unit, n) {
      if (isNaN(n)) { throw new Error('Units must be a number.'); }
      var meth = unit === 'year' ? 'FullYear' : unit.substr(0, 1).toUpperCase() + unit.substr(1);
      var dt = this.getUTCDateProxy();
      dt['setUTC' + meth](n);
      dt.setUTCMinutes(dt.getUTCMinutes() - this.getTimezoneOffset());
      this.setFromTimeProxy(dt.getTime() + this.getTimezoneOffset() * 60000, this.timezone);
    },
    setTimezone: function (tz) {
      var previousOffset = this.getTimezoneInfo().tzOffset;
      this.timezone = _timezoneMappings[tz] || tz;
      this._useCache = false;
      // Set UTC minutes offsets by the delta of the two timezones
      this.setUTCMinutes(this.getUTCMinutes() - this.getTimezoneInfo().tzOffset + previousOffset);
    },
    removeTimezone: function () {
      this.timezone = null;
      this._useCache = false;
    },
    valueOf: function () { return this.getTime(); },
    clone: function () {
      return this.timezone ? new TZDate(this.getTime(), this.timezone) : new TZDate(this.getTime());
    },
    toGMTString: function () { return this.toString('ddd, dd MMM yyyy HH:mm:ss Z', 'Etc/GMT'); },
    toLocaleString: function () {},
    toLocaleDateString: function () {},
    toLocaleTimeString: function () {},
    toSource: function () {},
    toISOString: function () { return this.toString(ISO_FORMAT_STRING_TZ, 'Etc/UTC'); },
    toJSON: function () { return this.toISOString(); },
    toUTCString: function (format, locale) { return (format ? this.toString(format, 'Etc/UTC', locale) : this.toGMTString()); },
    civilToJulianDayNumber: function (y, m, d) {
      var a;
      // Adjust for zero-based JS-style array
      m++;
      if (m > 12) {
        a = parseInt(m/12, 10);
        m = m % 12;
        y += a;
      }
      if (m <= 2) {
        y -= 1;
        m += 12;
      }
      a = Math.floor(y / 100);
      var b = 2 - a + Math.floor(a / 4)
        , jDt = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;
      return jDt;
    },
    getLocalOffset: function () {
      return this._dateProxy.getTimezoneOffset();
    }
  };

  // Pretty output handling for Firebug and WebInspector
  proto.length = 1;
  proto.splice = Array.prototype.splice;


  /* Formatting
  ---------------------------------------------------------------------------------*/


  proto.toString = function(formatString, timezone, locale) {
    if (formatString === undefined) {
      return format(this, 'yyyy-MM-dd HH:mm:ss');
    } else {
      return format(this, formatString, timezone, locale);
    }
  };

  // Prepare base definition of month names
  TZDate.defaultLocale = '';
  TZDate.locales = {
    '': {
      monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      amDesignator: 'AM',
      pmDesignator: 'PM'
    }
  };
  // The 'base' definition must not be changed as it is used for timezone parsing.
  TZDate.baseLocaleSettings = TZDate.locales[''];

  TZDate.formatters = {
    i: ISO_FORMAT_STRING,
    u: ISO_FORMAT_STRING_TZ
  };

  function format(date, formatString, timezone, locale) {

    var locales = TZDate.locales;
    var defaultLocaleSettings = locales[TZDate.defaultLocale] || {};

    // Do we need a new date in the specified timezone?
    if (timezone) {
      date = date.clone();
      date.setTimezone(timezone)
    }
    timezone = date.getTimezoneInfo();

    locale = (isString(locale) ? locales[locale] : locale) || {};

    function getSetting(name) {
      return locale[name] || defaultLocaleSettings[name];
    }

    return _format(date, formatString, timezone, getSetting);
  }


  function _format(date, formatString, timezone, getSetting) {
    var m;
    var subout;
    var out = '';
    while (m = formatString.match(formatStringRE)) {
      out += formatString.substr(0, m.index);
      if (m[1]) { // consecutive alphabetic characters
        out += processTokenString(date, m[1], timezone, getSetting);
      }
      else if (m[3]) { // parenthesis
        subout = _format(date, m[4], timezone, getSetting);
        if (parseInt(subout.replace(/\D/g, ''), 10)) { // if any of the numbers are non-zero. or no numbers at all
          out += subout;
        }
      }
      else { // else if (m[6]) { // single quotes
        out += m[7] || "'"; // if inner is blank, meaning 2 consecutive quotes = literal single quote
      }
      formatString = formatString.substr(m.index + m[0].length);
    }
    return out + formatString;
  }


  function processTokenString(date, tokenString, timezone, getSetting) {
    var end = tokenString.length;
    var replacement;
    var out = '';
    while (end > 0) {
      replacement = getTokenReplacement(date, tokenString.substr(0, end), timezone, getSetting);
      if (replacement !== undefined) {
        out += replacement;
        tokenString = tokenString.substr(end);
        end = tokenString.length;
      } else {
        end--;
      }
    }
    return out + tokenString;
  }


  function getTokenReplacement(date, token, timezone, getSetting) {
    var formatter = TZDate.formatters[token];
    if (isString(formatter)) {
      return _format(date, formatter, timezone, getSetting);
    }
    else if (isFunction(formatter)) {
      return formatter(date, timezone, getSetting);
    }
    switch (token) {
      case 'fff'  : return zeroPad(date.getMilliseconds(), 3);
      case 's'    : return date.getSeconds();
      case 'ss'   : return zeroPad(date.getSeconds());
      case 'm'    : return date.getMinutes();
      case 'mm'   : return zeroPad(date.getMinutes());
      case 'h'    : return date.getHours() % 12 || 12;
      case 'hh'   : return zeroPad(date.getHours() % 12 || 12);
      case 'H'    : return date.getHours();
      case 'HH'   : return zeroPad(date.getHours());
      case 'd'    : return date.getDate();
      case 'dd'   : return zeroPad(date.getDate());
      case 'ddd'  : return getSetting('dayNamesShort')[date.getDay()] || '';
      case 'dddd' : return getSetting('dayNames')[date.getDay()] || '';
      case 'M'    : return date.getMonth() + 1;
      case 'MM'   : return zeroPad(date.getMonth() + 1);
      case 'MMM'  : return getSetting('monthNamesShort')[date.getMonth()] || '';
      case 'MMMM' : return getSetting('monthNames')[date.getMonth()] || '';
      case 'yy'   : return (date.getFullYear()+'').substring(2);
      case 'yyyy' : return date.getFullYear();
      case 't'    : return _getDesignator(date, getSetting).substr(0, 1).toLowerCase();
      case 'tt'   : return _getDesignator(date, getSetting).toLowerCase();
      case 'T'    : return _getDesignator(date, getSetting).substr(0, 1);
      case 'TT'   : return _getDesignator(date, getSetting);
      case 'z'    :
      case 'zz'   :
      case 'zzz'  : return timezone.tzAbbr == 'UTC' ? 'Z' : _getTZString(date, token);
      case 'Z'    : return timezone.tzAbbr;
      case 'S'    :
        var d = date.getDate();
        if (d > 10 && d < 20) return 'th';
        return ['st', 'nd', 'rd'][d % 10 - 1] || 'th';
    }
  }


  function _getTZString(date, token, timezone) {
    var tzo = date.getTimezoneOffset();
    var sign = tzo < 0 ? '+' : '-';
    var hours = Math.floor(Math.abs(tzo) / 60);
    var minutes = Math.abs(tzo) % 60;
    var out = hours;
    if (token == 'zz') {
      out = zeroPad(hours);
    }
    else if (token == 'zzz') {
      out = zeroPad(hours) + ':' + zeroPad(minutes);
    }
    return sign + out;
  }


  function _getDesignator(date, getSetting) {
    return date.getHours() < 12 ? getSetting('amDesignator') : getSetting('pmDesignator');
  }



  /* Time Zone
   -------------------------------------------*/

  TZDate.timezone = new function () {
    var _this = this
      , regionMap = {'Etc':'etcetera','EST':'northamerica','MST':'northamerica','HST':'northamerica','EST5EDT':'northamerica','CST6CDT':'northamerica','MST7MDT':'northamerica','PST8PDT':'northamerica','America':'northamerica','Pacific':'australasia','Atlantic':'europe','Africa':'africa','Indian':'africa','Antarctica':'antarctica','Asia':'asia','Australia':'australasia','Europe':'europe','WET':'europe','CET':'europe','MET':'europe','EET':'europe'}
      , regionExceptions = {'Pacific/Honolulu':'northamerica','Atlantic/Bermuda':'northamerica','Atlantic/Cape_Verde':'africa','Atlantic/St_Helena':'africa','Indian/Kerguelen':'antarctica','Indian/Chagos':'asia','Indian/Maldives':'asia','Indian/Christmas':'australasia','Indian/Cocos':'australasia','America/Danmarkshavn':'europe','America/Scoresbysund':'europe','America/Godthab':'europe','America/Thule':'europe','Asia/Yekaterinburg':'europe','Asia/Omsk':'europe','Asia/Novosibirsk':'europe','Asia/Krasnoyarsk':'europe','Asia/Irkutsk':'europe','Asia/Yakutsk':'europe','Asia/Vladivostok':'europe','Asia/Sakhalin':'europe','Asia/Magadan':'europe','Asia/Kamchatka':'europe','Asia/Anadyr':'europe','Africa/Ceuta':'europe','America/Argentina/Buenos_Aires':'southamerica','America/Argentina/Cordoba':'southamerica','America/Argentina/Tucuman':'southamerica','America/Argentina/La_Rioja':'southamerica','America/Argentina/San_Juan':'southamerica','America/Argentina/Jujuy':'southamerica','America/Argentina/Catamarca':'southamerica','America/Argentina/Mendoza':'southamerica','America/Argentina/Rio_Gallegos':'southamerica','America/Argentina/Ushuaia':'southamerica','America/Aruba':'southamerica','America/La_Paz':'southamerica','America/Noronha':'southamerica','America/Belem':'southamerica','America/Fortaleza':'southamerica','America/Recife':'southamerica','America/Araguaina':'southamerica','America/Maceio':'southamerica','America/Bahia':'southamerica','America/Sao_Paulo':'southamerica','America/Campo_Grande':'southamerica','America/Cuiaba':'southamerica','America/Porto_Velho':'southamerica','America/Boa_Vista':'southamerica','America/Manaus':'southamerica','America/Eirunepe':'southamerica','America/Rio_Branco':'southamerica','America/Santiago':'southamerica','Pacific/Easter':'southamerica','America/Bogota':'southamerica','America/Curacao':'southamerica','America/Guayaquil':'southamerica','Pacific/Galapagos':'southamerica','Atlantic/Stanley':'southamerica','America/Cayenne':'southamerica','America/Guyana':'southamerica','America/Asuncion':'southamerica','America/Lima':'southamerica','Atlantic/South_Georgia':'southamerica','America/Paramaribo':'southamerica','America/Port_of_Spain':'southamerica','America/Montevideo':'southamerica','America/Caracas':'southamerica'};

    function invalidTZError(t) { throw new Error('Timezone "' + t + '" is either incorrect, or not loaded in the timezone registry.'); }

    function builtInLoadZoneFile(fileName, opts) {
      var url = _this.zoneFileBasePath + '/' + fileName;
      return !opts || !opts.async
      ? _this.parseZones(_this.transport({ url : url, async : false }))
      : _this.transport({
        async: true,
        url : url,
        success : function (str) {
          if (_this.parseZones(str) && typeof opts.callback === 'function') {
            opts.callback();
          }
          return true;
        },
        error : function () {
          throw new Error('Error retrieving "' + url + '" zoneinfo files');
        }
      });
    }

    function getRegionForTimezone(tz) {
      var exc = regionExceptions[tz]
        , reg
        , ret;
      if (exc) return exc;
      reg = tz.split('/')[0];
      ret = regionMap[reg];
      // If there's nothing listed in the main regions for this TZ, check the 'backward' links
      if (ret) return ret;
      var link = _this.zones[tz];
      if (typeof link === 'string') {
        return getRegionForTimezone(link);
      }
      // Backward-compat file hasn't loaded yet, try looking in there
      if (!_this.loadedZones.backward) {
        // This is for obvious legacy zones (e.g., Iceland) that don't even have a prefix like "America/" that look like normal zones
        _this.loadZoneFile('backward');
        return getRegionForTimezone(tz);
      }
      invalidTZError(tz);
    }

    function parseTimeString(str) {
      var pat = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
      var hms = str.match(pat);
      hms[1] = parseInt(hms[1], 10);
      hms[2] = hms[2] ? parseInt(hms[2], 10) : 0;
      hms[3] = hms[3] ? parseInt(hms[3], 10) : 0;

      return hms;
    }

    function processZone(z) {
      if (!z[3]) { return; }
      var yea = parseInt(z[3], 10);
      var mon = 11;
      var dat = 31;
      if (z[4]) {
        // TODO : THIS IS WRONG!
        mon = TZDate.baseLocaleSettings.monthNamesShort.indexOf(z[4].substr(0, 3));
        dat = parseInt(z[5], 10) || 1;
      }
      var string = z[6] ? z[6] : '00:00:00'
        , t = parseTimeString(string);
      return [yea, mon, dat, t[1], t[2], t[3]];
    }

    function getZone(dt, tz) {
      var utcMillis = typeof dt === 'number' ? dt : new Date(dt).getTime();
      var t = tz;
      var zoneList = _this.zones[t];
      // Follow links to get to an actual zone
      while (typeof zoneList === "string") {
        t = zoneList;
        zoneList = _this.zones[t];
      }
      if (!zoneList) {
        // Backward-compat file hasn't loaded yet, try looking in there
        if (!_this.loadedZones.backward) {
          //This is for backward entries like "America/Fort_Wayne" that
          // getRegionForTimezone *thinks* it has a region file and zone
          // for (e.g., America => 'northamerica'), but in reality it's a
          // legacy zone we need the backward file for.
          _this.loadZoneFile('backward');
          return getZone(dt, tz);
        }
        invalidTZError(t);
      }
      if (zoneList.length === 0) {
        throw new Error('No Zone found for "' + tz + '" on ' + dt);
      }
      //Do backwards lookup since most use cases deal with newer dates.
      for (var i = zoneList.length - 1; i >= 0; i--) {
        var z = zoneList[i];
        if (z[3] && utcMillis > z[3]) break;
      }
      return zoneList[i+1];
    }

    function getBasicOffset(time) {
      var off = parseTimeString(time)
        , adj = time.indexOf('-') === 0 ? -1 : 1;
      off = adj * (((off[1] * 60 + off[2]) * 60 + off[3]) * 1000);
      return off/60/1000;
    }

    //if isUTC is true, date is given in UTC, otherwise it's given
    // in local time (ie. date.getUTC*() returns local time components)
    function getRule(dt, zone, isUTC) {
      var date = typeof dt === 'number' ? new Date(dt) : dt;
      var ruleset = zone[1];
      var basicOffset = zone[0];

      // Convert a date to UTC. Depending on the 'type' parameter, the date
      // parameter may be:
      //
      // - `u`, `g`, `z`: already UTC (no adjustment).
      //
      // - `s`: standard time (adjust for time zone offset but not for DST)
      //
      // - `w`: wall clock time (adjust for both time zone and DST offset).
      //
      // DST adjustment is done using the rule given as third argument.
      var convertDateToUTC = function (date, type, rule) {
        var offset = 0;

        if (type === 'u' || type === 'g' || type === 'z') { // UTC
          offset = 0;
        } else if (type === 's') { // Standard Time
          offset = basicOffset;
        } else if (type === 'w' || !type) { // Wall Clock Time
          offset = getAdjustedOffset(basicOffset, rule);
        } else {
          throw("unknown type " + type);
        }
        offset *= 60 * 1000; // to millis

        return new Date(date.getTime() + offset);
      };

      //Step 1:  Find applicable rules for this year.
      //
      //Step 2:  Sort the rules by effective date.
      //
      //Step 3:  Check requested date to see if a rule has yet taken effect this year.  If not,
      //
      //Step 4:  Get the rules for the previous year.  If there isn't an applicable rule for last year, then
      // there probably is no current time offset since they seem to explicitly turn off the offset
      // when someone stops observing DST.
      //
      // FIXME if this is not the case and we'll walk all the way back (ugh).
      //
      //Step 5:  Sort the rules by effective date.
      //Step 6:  Apply the most recent rule before the current time.
      var convertRuleToExactDateAndTime = function (yearAndRule, prevRule) {
        var year = yearAndRule[0]
          , rule = yearAndRule[1];
          // Assume that the rule applies to the year of the given date.

        var hms = rule[5];
        var effectiveDate;

        if (!EXACT_DATE_TIME[year])
          EXACT_DATE_TIME[year] = {};

        // Result for given parameters is already stored
        if (EXACT_DATE_TIME[year][rule])
          effectiveDate = EXACT_DATE_TIME[year][rule];
        else {
          //If we have a specific date, use that!
          if (!isNaN(rule[4])) {
            effectiveDate = new Date(Date.UTC(year, TZDate.baseLocaleSettings.monthNamesShort.indexOf(rule[3]), rule[4], hms[1], hms[2], hms[3], 0));
          }
          //Let's hunt for the date.
          else {
            var targetDay
              , operator;
            //Example: `lastThu`
            if (rule[4].substr(0, 4) === "last") {
              // Start at the last day of the month and work backward.
              effectiveDate = new Date(Date.UTC(year, TZDate.baseLocaleSettings.monthNamesShort.indexOf(rule[3]) + 1, 1, hms[1] - 24, hms[2], hms[3], 0));
              targetDay = TZDate.baseLocaleSettings.dayNamesShort.indexOf(rule[4].substr(4, 3));
              operator = "<=";
            }
            //Example: `Sun>=15`
            else {
              //Start at the specified date.
              effectiveDate = new Date(Date.UTC(year, TZDate.baseLocaleSettings.monthNamesShort.indexOf(rule[3]), rule[4].substr(5), hms[1], hms[2], hms[3], 0));
              targetDay = TZDate.baseLocaleSettings.dayNamesShort.indexOf(rule[4].substr(0, 3));
              operator = rule[4].substr(3, 2);
            }
            var ourDay = effectiveDate.getUTCDay();
            //Go forwards.
            if (operator === ">=") {
              effectiveDate.setUTCDate(effectiveDate.getUTCDate() + (targetDay - ourDay + ((targetDay < ourDay) ? 7 : 0)));
            }
            //Go backwards.  Looking for the last of a certain day, or operator is "<=" (less likely).
            else {
              effectiveDate.setUTCDate(effectiveDate.getUTCDate() + (targetDay - ourDay - ((targetDay > ourDay) ? 7 : 0)));
            }
          }
          EXACT_DATE_TIME[year][rule] = effectiveDate;
        }


        //If previous rule is given, correct for the fact that the starting time of the current
        // rule may be specified in local time.
        if (prevRule) {
          effectiveDate = convertDateToUTC(effectiveDate, hms[4], prevRule);
        }
        return effectiveDate;
      };

      var findApplicableRules = function (year, ruleset) {
        var applicableRules = [];
        for (var i = 0; ruleset && i < ruleset.length; i++) {
          //Exclude future rules.
          if (ruleset[i][0] <= year &&
              (
                // Date is in a set range.
                ruleset[i][1] >= year ||
                // Date is in an "only" year.
                  (ruleset[i][0] === year && ruleset[i][1] === "only") ||
                //We're in a range from the start year to infinity.
                    ruleset[i][1] === "max"
          )
             ) {
               //It's completely okay to have any number of matches here.
               // Normally we should only see two, but that doesn't preclude other numbers of matches.
               // These matches are applicable to this year.
               applicableRules.push([year, ruleset[i]]);
             }
        }
        return applicableRules;
      };

      var compareDates = function (a, b, prev) {
        var year, rule;
        if (a.constructor !== Date) {
          year = a[0];
          rule = a[1];
          a = (!prev && EXACT_DATE_TIME[year] && EXACT_DATE_TIME[year][rule])
            ? EXACT_DATE_TIME[year][rule]
            : convertRuleToExactDateAndTime(a, prev);
        } else if (prev) {
          a = convertDateToUTC(a, isUTC ? 'u' : 'w', prev);
        }
        if (b.constructor !== Date) {
          year = b[0];
          rule = b[1];
          b = (!prev && EXACT_DATE_TIME[year] && EXACT_DATE_TIME[year][rule]) ? EXACT_DATE_TIME[year][rule]
            : convertRuleToExactDateAndTime(b, prev);
        } else if (prev) {
          b = convertDateToUTC(b, isUTC ? 'u' : 'w', prev);
        }
        a = Number(a);
        b = Number(b);
        return a - b;
      };

      var year = date.getUTCFullYear();
      var applicableRules;

      applicableRules = findApplicableRules(year, _this.rules[ruleset]);
      applicableRules.push(date);
      //While sorting, the time zone in which the rule starting time is specified
      // is ignored. This is ok as long as the timespan between two DST changes is
      // larger than the DST offset, which is probably always true.
      // As the given date may indeed be close to a DST change, it may get sorted
      // to a wrong position (off by one), which is corrected below.
      applicableRules.sort(compareDates);

      //If there are not enough past DST rules...
      if (applicableRules.indexOf(date) < 2) {
        applicableRules = applicableRules.concat(findApplicableRules(year-1, _this.rules[ruleset]));
        applicableRules.sort(compareDates);
      }
      var pinpoint = applicableRules.indexOf(date);
      if (pinpoint > 1 && compareDates(date, applicableRules[pinpoint-1], applicableRules[pinpoint-2][1]) < 0) {
        //The previous rule does not really apply, take the one before that.
        return applicableRules[pinpoint - 2][1];
      } else if (pinpoint > 0 && pinpoint < applicableRules.length - 1 && compareDates(date, applicableRules[pinpoint+1], applicableRules[pinpoint-1][1]) > 0) {

        //The next rule does already apply, take that one.
        return applicableRules[pinpoint + 1][1];
      } else if (pinpoint === 0) {
        //No applicable rule found in this and in previous year.
        return null;
      }
      return applicableRules[pinpoint - 1][1];
    }

    function getAdjustedOffset(off, rule) {
      return -Math.ceil(rule[6] - off);
    }

    function getAbbreviation(zone, rule) {
      var res;
      var base = zone[2];
      if (base.indexOf('%s') > -1) {
        var repl;
        if (rule) {
          repl = rule[7] === '-' ? '' : rule[7];
        }
        //FIXME: Right now just falling back to Standard --
        // apparently ought to use the last valid rule,
        // although in practice that always ought to be Standard
        else {
          repl = 'S';
        }
        res = base.replace('%s', repl);
      }
      else if (base.indexOf('/') > -1) {
        //Chose one of two alternative strings.
        res = base.split("/", 2)[rule[6] ? 1 : 0];
      } else {
        res = base;
      }
      return res;
    }

    this.zoneFileBasePath;
    this.zoneFiles = ['africa', 'antarctica', 'asia', 'australasia', 'backward', 'etcetera', 'europe', 'northamerica', 'pacificnew', 'southamerica'];
    this.loadingSchemes = {
      PRELOAD_ALL: 'preloadAll',
      LAZY_LOAD: 'lazyLoad',
      MANUAL_LOAD: 'manualLoad'
    };
    this.loadingScheme = this.loadingSchemes.LAZY_LOAD;
    this.loadedZones = {};
    this.zones = {};
    this.rules = {};

    this.init = function (o) {
      var opts = { async: true }
        , done = 0
        , callbackFn
        , def;

      if (!this.defaultZoneFile) {
        def = this.defaultZoneFile = (this.loadingScheme === this.loadingSchemes.PRELOAD_ALL
            ? this.zoneFiles
            : 'northamerica')
      } else {
        def = this.defaultZoneFile
      }

      // Override default with any passed-in opts
      for (var p in o) {
        opts[p] = o[p];
      }
      if (typeof def === 'string') {
        return this.loadZoneFile(def, opts);
      }

      // Wraps callback function in another one that makes
      // sure all files have been loaded.
      callbackFn = opts.callback;
      opts.callback = function () {
        done++;
        (done === def.length) && typeof callbackFn === 'function' && callbackFn();
      };
      for (var i = 0; i < def.length; i++) {
        this.loadZoneFile(def[i], opts);
      }
    };

    //Get the zone files via XHR -- if the sync flag
    // is set to true, it's being called by the lazy-loading
    // mechanism, so the result needs to be returned inline.
    this.loadZoneFile = function (fileName, opts) {
      if (typeof this.zoneFileBasePath === 'undefined') {
        throw new Error('Please define a base path to your zone file directory -- TZDate.timezone.zoneFileBasePath.');
      }
      //Ignore already loaded zones.
      if (this.loadedZones[fileName]) {
        return;
      }
      this.loadedZones[fileName] = true;
      return builtInLoadZoneFile(fileName, opts);
    };
    this.loadZoneJSONData = function (url, sync) {
      var processData = function (data) {
        data = eval('('+ data +')');
        for (var z in data.zones) {
          _this.zones[z] = data.zones[z];
        }
        for (var r in data.rules) {
          _this.rules[r] = data.rules[r];
        }
      };
      return sync
      ? processData(_this.transport({ url : url, async : false }))
      : _this.transport({ url : url, success : processData });
    };
    this.loadZoneDataFromObject = function (data) {
      if (!data) { return; }
      for (var z in data.zones) {
        _this.zones[z] = data.zones[z];
      }
      for (var r in data.rules) {
        _this.rules[r] = data.rules[r];
      }
    };
    this.getAllZones = function () {
      var arr = [];
      for (var z in this.zones) { arr.push(z); }
      return arr.sort();
    };
    this.parseZones = function (str) {
      var lines = str.split('\n')
        , arr = []
        , chunk = ''
        , l
        , zone = null
        , rule = null;
      for (var i = 0; i < lines.length; i++) {
        l = lines[i];
        if (l.match(/^\s/)) {
          l = "Zone " + zone + l;
        }
        l = l.split("#")[0];
        if (l.length > 3) {
          arr = l.split(/\s+/);
          chunk = arr.shift();
          //Ignore Leap.
          switch (chunk) {
            case 'Zone':
              zone = arr.shift();
              if (!_this.zones[zone]) {
                _this.zones[zone] = [];
              }
              if (arr.length < 3) break;
              //Process zone right here and replace 3rd element with the processed array.
              arr.splice(3, arr.length, processZone(arr));
              if (arr[3]) arr[3] = Date.UTC.apply(null, arr[3]);
              arr[0] = -getBasicOffset(arr[0]);
              _this.zones[zone].push(arr);
              break;
            case 'Rule':
              rule = arr.shift();
              if (!_this.rules[rule]) {
                _this.rules[rule] = [];
              }
              //Parse int FROM year and TO year
              arr[0] = parseInt(arr[0], 10);
              arr[1] = parseInt(arr[1], 10) || arr[1];
              //Parse time string AT
              arr[5] = parseTimeString(arr[5]);
              //Parse offset SAVE
              arr[6] = getBasicOffset(arr[6]);
              _this.rules[rule].push(arr);
              break;
            case 'Link':
              //No zones for these should already exist.
              if (_this.zones[arr[1]]) {
                throw new Error('Error with Link ' + arr[1] + '. Cannot create link of a preexisted zone.');
              }
              //Create the link.
              _this.zones[arr[1]] = arr[0];
              break;
          }
        }
      }
      return true;
    };

    // Expose transport mechanism and allow overwrite.
    this.transport = function (opts) {
      if ((!fleegix || typeof fleegix.xhr === 'undefined') && (!$ || typeof $.ajax === 'undefined')) {
        throw new Error('Please use the Fleegix.js XHR module, jQuery ajax, Zepto ajax, or define your own transport mechanism for downloading zone files.');
      }
      if (!opts) return;
      if (!opts.url) throw new Error ('URL must be specified');
      if (!('async' in opts)) opts.async = true;
      if (!opts.async) {
        return fleegix && fleegix.xhr
        ? fleegix.xhr.doReq({ url: opts.url, async: false })
        : $.ajax({ url : opts.url, async : false }).responseText;
      }
      return fleegix && fleegix.xhr
      ? fleegix.xhr.send({
        url : opts.url,
        method : 'get',
        handleSuccess : opts.success,
        handleErr : opts.error
      })
      : $.ajax({
        url : opts.url,
        dataType: 'text',
        method : 'GET',
        error : opts.error,
        success : opts.success
      });
    };


    this.getTzInfo = function (dt, tz, isUTC) {
      // Lazy-load any zones not yet loaded.
      if (this.loadingScheme === this.loadingSchemes.LAZY_LOAD) {
        // Get the correct region for the zone.
        var zoneFile = getRegionForTimezone(tz);
        if (!zoneFile) {
          throw new Error('Not a valid timezone ID.');
        }
        if (!this.loadedZones[zoneFile]) {
          //Get the file and parse it -- use synchronous XHR.
          this.loadZoneFile(zoneFile);
        }
      }
      var z = getZone(dt, tz);
      var off = z[0];
      //See if the offset needs adjustment.
      var rule = getRule(dt, z, isUTC);
      if (rule) {
        off = getAdjustedOffset(off, rule);
      }
      var abbr = getAbbreviation(z, rule);
      return { tzOffset: off, tzAbbr: abbr };
    };
  };



  /* General Utilities
  --------------------------------------------------------------*/

  function methodize(f) {
    return function() {
      return f.apply(undefined, [this].concat(slice(arguments)));
    };
  }


  function slice(a, start, end) {
    return Array.prototype.slice.call(
      a,
      start || 0, // start and end cannot be undefined for IE
      end===undefined ? a.length : end
    );
  }


  function each(a, f) {
    for (var i=0; i<a.length; i++) {
      f(a[i], i);
    };
  }


  function isString(arg) {
    return typeof arg == 'string';
  }


  function isNumber(arg) {
    return typeof arg == 'number';
  }


  function isBoolean(arg) {
    return typeof arg == 'boolean';
  }

  function isObject(arg) {
    return typeof arg == 'object';
  }

  function isFunction(arg) {
    return typeof arg == 'function';
  }

  function isTimezone(string) {
    return (typeof string === 'string' && /^[A-Z][a-zA-Z]+/g.test(string));
  }

  // Check if the string is an RFC time.
  function isRFCDate(string) {
    return isString(string) && string.match(/T|(Z|[+\-]\d{2}:\d{2})$/);
  }

  // A date that contains human characters such as day names, months, and time zones.
  // Basically when there is more than one non-numbers together.
  //
  // For example, this is human:
  //
  //    new Date("Mon Oct 01 2012 20:00:00 GMT") // Parsed by browser
  //
  // This is not:
  //
  //    new Date("2012-10-01 20:00") // invalid date
  //
  // This is to get round problems with some browsers that know
  // how to parse human strings, but not others.
  //
  function isHumanDate(string) {
    return isString(string) && string.match(/\D\D/);
  }


  function zeroPad(n, len) {
    len = len || 2;
    n += '';
    while (n.length < len) {
      n = '0' + n;
    }
    return n;
  }


  // Node export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TZDate;
  }

  return TZDate;

})(Date, Math, Array);
