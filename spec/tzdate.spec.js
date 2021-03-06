var TestUtils = require('./test-utils')
, TZDate = TestUtils.getTZDate();

describe('TZDate', function () {
  it('should have correct format when initialized', function () {
    var date = new TZDate();
    expect(date.toString()).toMatch(/[\d]{4}(-[\d]{2}){2} ([\d]{2}:){2}[\d]{2}/);
  });

  it('should format string correctly in toISOString', function () {
    var date = new TZDate();
    expect(date.toISOString()).toMatch(/[\d]{4}(-[\d]{2}){2}T([\d]{2}:){2}[\d]{2}.[\d]{3}/);
  });

  describe('#toUTCString', function() {
    it('should provide GMT style string by default', function() {
      var date = new TZDate(2012, 7, 20, 15, 51, 30, "Europe/Madrid");
      expect(date.toUTCString()).toEqual('Mon, 20 Aug 2012 13:51:30 GMT');
    });
    it ('should accept format if required', function() {
      var date = new TZDate(2012, 7, 20, 15, 51, 30, "Europe/Madrid");
      expect(date.toUTCString('yyyy MMM dd, HH:mm')).toEqual("2012 Aug 20, 13:51");
    });
  });

  it('should get date correctly from UTC (2011-10-28T12:44:22.172000000)', function () {
    var date = new TZDate(2011, 9, 28, 12, 44, 22, 172,'Etc/UTC');
    expect(date.getTime()).toEqual(1319805862172);
    expect(date.toString()).toEqual('2011-10-28 12:44:22');
    expect(date.toString('yyyy-MM-dd')).toEqual('2011-10-28');
  });

  it('should receive date in UTC for Time zone', function() {
    var date = new TZDate("2012-08-19T07:50:16.272Z", "Europe/Madrid")
    expect(date.toString()).toEqual("2012-08-19 09:50:16")
  });

  it('should format 2011-10-28T12:44:22.172 UTC to different formats correctly', function () {
    var date = new TZDate(2011,9,28,12,44,22,172,'Etc/UTC');
    expect(date.toString('MMM dd yyyy')).toEqual('Oct 28 2011');
    expect(date.toString('MMM dd yyyy HH:mm:ss TT')).toEqual('Oct 28 2011 12:44:22 PM');
    expect(date.toString('MMM dd yyyy HH:mm:ss TT Z')).toEqual('Oct 28 2011 12:44:22 PM UTC');
  });

  it('should format 2011-10-28T12:44:22.172 UTC to different formats and tz correctly', function () {
    var date = new TZDate(2011,9,28,12,44,22,172,'Etc/UTC');
    expect(date.toString('MMM dd yyyy', 'America/New_York')).toEqual('Oct 28 2011');
    expect(date.toString('MMM dd yyyy hh:mm:ss TT Z', 'Asia/Shanghai')).toEqual('Oct 28 2011 08:44:22 PM CST');
    expect(date.toString('MMM dd yyyy hh:mm:ss TT Z', 'America/New_York')).toEqual('Oct 28 2011 08:44:22 AM EDT');
  });

  it('should format 2011-02-28T12:44:22.172 UTC (before daylight) to different formats and tz correctly', function () {
    var date = new TZDate(2011,1,28,12,44,22,172,'Etc/UTC');
    expect(date.toString('MMM dd yyyy hh:mm:ss TT Z', 'America/New_York')).toEqual('Feb 28 2011 07:44:22 AM EST');
    expect(date.toString('MMM dd yyyy hh:mm:ss TT Z', 'Indian/Cocos')).toEqual('Feb 28 2011 07:14:22 PM CCT');
  });

  it('should convert dates from UTC to a timezone correctly', function () {
    var date = new TZDate(2011,1,28,12,44,22,172,'Etc/UTC');
    date.setTimezone('America/Los_Angeles');
    expect(date.toString('MMM dd yyyy hh:mm:ss TT Z')).toEqual('Feb 28 2011 04:44:22 AM PST');
    expect(date.getTime()).toEqual(1298897062172);
    expect(date.getHours()).toEqual(4);
  });

  it('should convert dates from a timezone to UTC correctly', function () {
    var date = new TZDate(2007, 9, 31, 10, 30, 22, 'America/Los_Angeles');
    date.setTimezone('Etc/UTC');
    expect(date.getTime()).toEqual(1193851822000);
    expect(date.toString('MMM dd yyyy hh:mm:ss TT Z')).toEqual('Oct 31 2007 05:30:22 PM UTC');
    expect(date.getHours()).toEqual(17);
  });

  it('should convert dates from one timezone to another correctly', function () {
    var dtA = new TZDate(2007, 9, 31, 10, 30, 'America/Los_Angeles');

    dtA.setTimezone('America/Chicago');
    expect(dtA.getTime()).toEqual(1193851800000);
    expect(dtA.toString()).toEqual('2007-10-31 12:30:00');
  });

  it('should convert dates from unix time properly', function () {
    var dtA = new TZDate(1193851800000);

    dtA.setTimezone('America/Chicago');
    expect(dtA.getTime()).toEqual(1193851800000);
    expect(dtA.toString()).toEqual('2007-10-31 12:30:00');
  });


  it('should output toISOString correctly', function () {
    var dtA = new Date()
    , dt = new TZDate();

    dtA.setTime(dtA.getTime());
    expect(dt.getTime()).toEqual(dtA.getTime());
    expect(dt.toISOString()).toEqual(dtA.toISOString());
  });

  it('should output toGMTString correctly', function () {
    var dtA = new Date()
    , dt = new TZDate();

    dtA.setTime(dtA.getTime());
    expect(dt.getTime()).toEqual(dtA.getTime());
    expect(dt.toGMTString()).toEqual(dtA.toGMTString());
  });


  it('should output toJSON correctly', function () {
    var dtA = new Date()
    , dt = new TZDate();

    dtA.setTime(dtA.getTime());
    expect(dt.getTime()).toEqual(dtA.getTime());
    expect(dt.toJSON()).toEqual(dtA.toJSON());
  });

  it('should take in millis as constructor', function () {
    var dtA = new Date(0)
    , dt = new TZDate(dtA.getTime());

    expect(dt.getTime()).toEqual(dtA.getTime());
    expect(dt.toJSON()).toEqual(dtA.toJSON());
  });

  it('should take in Date object as constructor', function () {
    var dtA = new Date(0)
    , dt = new TZDate(dtA);

    expect(dt.getTime()).toEqual(dtA.getTime());
    expect(dt.toJSON()).toEqual(dtA.toJSON());
  });

  it('should take in millis and tz as constructor', function () {
    var dtA = new Date(0)
    , dt = new TZDate(dtA.getTime(), 'Asia/Bangkok');

    expect(dt.getTime()).toEqual(0);
  });

  it('should take in Date object as constructor', function () {
    var dtA = new Date(0)
    , dt = new TZDate(dtA, 'Asia/Bangkok');

    expect(dt.getTime()).toEqual(0);
  });

  it('should take in null object in constructor', function () {
    var dtA = new Date(0)
      , dtB = new TZDate(null);
    expect(dtA.getTime()).toEqual(dtB.getTime());
  });


  it('should accept local date in string and array with same result', function () {
    var dtA = new TZDate('2012-01-01 15:00:00', 'Asia/Bangkok')
    var dtB = new TZDate(2012, 0, 1, 15, 0, 0, 'Asia/Bangkok')
    expect(dtA.toString()).toEqual(dtB.toString());
  });

  it('should take in String and Asia/Bangkok as constructor', function () {
    // This is a RFC 3339 UTC string format
    var dt = new TZDate('2012-01-01T15:00:00.000', 'Asia/Bangkok');

    expect(dt.toString()).toEqual('2012-01-01 22:00:00');
    expect(dt.toString("yyyy-MM-dd'T'HH:mm:ss.fff", 'America/New_York')).toEqual('2012-01-01T10:00:00.000');
    expect(dt.toString("yyyy-MM-dd'T'HH:mm:ss.fff")).toEqual('2012-01-01T22:00:00.000');
  });

  it('should take in String and Etc/UTC as constructor', function () {
    var dt = new TZDate('2012-01-01T15:00:00.000', 'Etc/UTC');

    expect(dt.toString("yyyy-MM-dd'T'HH:mm:ss.fff", 'America/New_York')).toEqual('2012-01-01T10:00:00.000');
    expect(dt.toString("yyyy-MM-dd'T'HH:mm:ss.fff")).toEqual('2012-01-01T15:00:00.000');

  });

  it('should take in String as constructor', function () {
    var dtA = new Date()
    , dt = new TZDate(dtA.toJSON());

    expect(dt.toJSON()).toEqual(dtA.toJSON());
  });


  it('should be able to set hours', function () {
    var dtA = new Date(0)
    , dt = new TZDate(0, 'Etc/UTC');

    dt.setHours(6);
    expect(dt.getHours()).toEqual(6);
  });

  it('should be able to set date without altering others', function () {
    var dt = new TZDate(2012, 2, 2, 5, 0, 0, 0, 'America/Los_Angeles')
    , dt2 = new TZDate(2011, 4, 15, 23, 0, 0, 0, 'Asia/Bangkok');

    var hours = dt.getHours();
    dt.setDate(1);
    expect(dt.getHours()).toEqual(hours);

    hours = dt2.getHours();
    dt2.setDate(2);
    expect(dt2.getHours()).toEqual(hours);
  });

  it('should be able to set UTC date without altering others', function () {
    var dt = new TZDate(2012, 2, 2, 5, 0, 0, 0, 'America/Los_Angeles');

    var hours = dt.getUTCHours();
    dt.setUTCDate(1);
    expect(dt.getUTCHours()).toEqual(hours);
  });


  it('should adjust daylight saving correctly', function () {
    var dt1 = new TZDate(2012, 2, 11, 3, 0, 0, 'America/Chicago');
    expect(dt1.getTimezoneAbbreviation()).toEqual('CDT');
    expect(dt1.getTimezoneOffset()).toEqual(300);
    var dt2 = new TZDate(2012, 2, 11, 1, 59, 59, 'America/Chicago');

    expect(dt2.getTimezoneAbbreviation()).toEqual('CST');
    expect(dt2.getTimezoneOffset()).toEqual(360);
  });

  it('should be able to clone itself', function () {
    var dt = new TZDate(0, 'America/Chicago')
    , dtA = dt.clone();

    expect(dt.getTime()).toEqual(dtA.getTime());
    expect(dt.toString()).toEqual(dtA.toString());
    expect(dt.getTimezoneOffset()).toEqual(dtA.getTimezoneOffset());
    expect(dt.getTimezoneAbbreviation()).toEqual(dtA.getTimezoneAbbreviation());
  });


  it('should output 1955-10-30 00:00:00 America/New_York as EDT', function () {
    var dt = new TZDate(1955, 9, 30, 0, 0, 0, 'America/New_York');
    expect(dt.getTimezoneOffset()).toEqual(240);
  });

  it('should handle Pacific/Apia correctly', function () {
    var dt = new TZDate(2011, 11, 29, 23, 59, 59, 'Pacific/Apia');
    var t = dt.getTime() + 1000;
    dt.setTime(t);
    expect(dt.toString()).toEqual('2011-12-31 00:00:00');
    expect(dt.getTime()).toEqual(t);
  });


  describe("Rails mappings", function() {

    it('should handle mappings correctly', function() {
      var dt = new TZDate(2011, 7, 18, 12, 00, 00, 'Madrid');
      expect(dt.timezone).toEqual('Europe/Madrid');
      expect(dt.toString()).toEqual('2011-08-18 12:00:00');
      dt.setTimezone('Mexico City')
      expect(dt.timezone).toEqual('America/Mexico_City');
      expect(dt.toString()).toEqual('2011-08-18 05:00:00');
    });

    it('should handle mappings with spaces correctly', function() {
      var dt = new TZDate(2011, 7, 18, 12, 00, 00, 'Mexico City');
      expect(dt.timezone).toEqual('America/Mexico_City');
    });

  });


  // Speed tests

  it('should convert timezone quickly', function () {
    var start = Date.now()
    , yearToMillis = 5 * 365 * 24 * 3600 * 1000
    , date;
    for (var i = 0; i < 5000; i++) {
      date = new TZDate(start - Math.random() * yearToMillis, 'America/New_York');
      date.setTimezone('Europe/Minsk');
    }
    console.log('Took ' + (Date.now() - start) + 'ms to convert 5000 dates');
  });

});
