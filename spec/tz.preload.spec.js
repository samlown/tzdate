var TestUtils = require('./test-utils')
  , parseISO = TestUtils.parseISO
  , date = require('../src/tzdate')
  , TZDate;

describe('TZDate.timezone', function () {

  describe('with preload scheme', function() {

    beforeEach(function() {
      TZDate = TestUtils.getTZDate({
        loadingScheme: date.timezone.loadingSchemes.PRELOAD_ALL
      });
    });

    it('should preload everything correctly', function () {
      var i = 0
        , sampleTz;
      expect(TZDate.timezone.loadingScheme).toEqual(date.timezone.loadingSchemes.PRELOAD_ALL);
      // Make sure more than 1 zone is loaded
      for (var k in TZDate.timezone.loadedZones) {
        i++;
      }
      expect(i).toEqual(TZDate.timezone.zoneFiles.length);
      i = 0;
      sampleTz = TZDate.timezone.getTzInfo(new Date(), 'Asia/Bangkok');
      expect(sampleTz).toBeDefined();
      expect(sampleTz.tzAbbr).toEqual('ICT');
    });
  });

  describe('defaultZoneFile', function() {

    it('should set default as northamerica', function() {
      TZDate = TestUtils.getTZDate();
      expect(TZDate.timezone.loadedZones.northamerica).toBeTruthy();
      expect(TZDate.timezone.loadedZones.europe).toBeFalsy();
    });

    it('should be overridable with single zone', function() {
      TZDate = TestUtils.getTZDate(null, {
        defaultZoneFile: 'europe'
      });
      expect(TZDate.timezone.loadedZones.europe).toBeTruthy();
      expect(TZDate.timezone.loadedZones.southamerica).toBeFalsy();
    });

    it('should be overridable with multiple zones', function() {
      TZDate = TestUtils.getTZDate(null, {
        defaultZoneFile: ['europe', 'southamerica']
      });
      expect(TZDate.timezone.loadedZones.europe).toBeTruthy();
      expect(TZDate.timezone.loadedZones.southamerica).toBeTruthy();
      expect(TZDate.timezone.loadedZones.northamerica).toBeFalsy();
    });

  });
});
