var TestUtils = require('./test-utils')
  , parseISO = TestUtils.parseISO
  , date = require('../src/tzdate')
  , TZDate = TestUtils.getTZDate({
    loadingScheme: date.timezone.loadingSchemes.PRELOAD_ALL
  });
describe('TimezoneJS', function () {
  it('should preload everything correctly', function () {
    var i = 0
      , sampleTz;
    expect(TZDate.timezone.loadingScheme).toEqual(date.timezone.loadingSchemes.PRELOAD_ALL);
    //Make sure more than 1 zone is loaded
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
