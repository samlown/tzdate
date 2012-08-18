var TestUtils = require('./test-utils')
, parseISO = TestUtils.parseISO
, date = require('../src/tzdate');

describe('TZDate', function () {
  it('should async preload everything correctly', function () {

    var i = 0
    , TZDate
    , sampleTz;
    runs(function () {
      TZDate = TestUtils.getTZDate({
        loadingScheme: date.timezone.loadingSchemes.PRELOAD_ALL,
        async: true,
        callback: function () {
          //Make sure more than 1 zone is loaded
          for (var k in TZDate.timezone.loadedZones) {
            i++;
          }
          sampleTz = TZDate.timezone.getTzInfo(new Date(), 'Asia/Bangkok');
        }
      });
    });

    waitsFor(function () {
      return i > 0;
    }, 'zones should be loaded', 100);
    runs(function () {
      expect(TZDate.timezone.loadingScheme).toEqual(date.timezone.loadingSchemes.PRELOAD_ALL);

      expect(i).toEqual(TZDate.timezone.zoneFiles.length);
      expect(sampleTz).toBeDefined();
      expect(sampleTz.tzAbbr).toEqual('ICT');

    });
  });
});
