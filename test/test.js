const should = require('chai').should(); // eslint-disable-line no-unused-vars
const mgrs = require('../dist/mgrs');
const { readFileSync } = require('fs');

describe('First MGRS set', () => {
  const mgrsStr = '33UXP04';
  const point = mgrs.toPoint(mgrsStr);
  const { x, y } = point;

  it('Longitude of point from MGRS correct.', () => {
    x.should.be.closeTo(16.41450, 0.000001);
  });
  it('Latitude of point from MGRS correct.', () => {
    y.should.be.closeTo(48.24949, 0.000001);
  });
  it('MGRS reference with highest accuracy correct.', () => {
    // console.log(mgrs.forward(point))
    mgrs.forward(point).should.equal('33UXP0500444997');
  });
  it('MGRS reference with 1-digit accuracy correct.', () => {
    mgrs.forward(point,1).should.equal(mgrsStr);
  });
});
describe('Second MGRS set', () => {
  const mgrsStr = '24XWT783908'; // near UTM zone border, so there are two ways to reference this
  const point = mgrs.toPoint(mgrsStr);
  const { x, y } = point;
  it('Longitude of point from MGRS correct.', () => {
    x.should.be.closeTo(-32.66433, 0.00001);
  });
  it('Latitude of point from MGRS correct.', () => {
    y.should.be.closeTo(83.62778, 0.00001);
  });
  it('MGRS reference with 3-digit accuracy correct.', () => {
    mgrs.forward(point,3).should.equal('25XEN041865');
  });
  it('MGRS reference with 5-digit accuracy, northing all zeros', () => {
    mgrs.forward({x: 0, y: 0},5).should.equal('31NAA6602100000');
  });
  it('MGRS reference with 5-digit accuracy, northing one digit', () => {
    mgrs.forward({x: 0, y: 0.00001},5).should.equal('31NAA6602100001');
  });
});

describe ('third mgrs set', () => {
  const mgrsStr = '11SPA7234911844';
  const point = { x: -115.0820944, y: 36.2361322};
  it('MGRS reference with highest accuracy correct.', () => {
    mgrs.forward(point).should.equal(mgrsStr);
  });
});

describe ('data validation', () => {
  describe('toPoint function', () => {
    it('toPoint throws an error when a blank string is passed in', () => {
      try {
        mgrs.toPoint('');
        false.should.be.true; // to make sure it errors
      } catch (error) {
        error.should.be.a('error');
        error.message.should.equal('Argument `mgrs` cannot be a blank string');
      }
    });
    it('toPoint should return the same result whether or not spaces are included in the MGRS String', () => {
      const { x: x1, y: y1 } = mgrs.toPoint("4QFJ 12345 67890");
      const { x: x2, y: y2 } = mgrs.toPoint("4QFJ1234567890");
      x1.should.equal(x2);
      y1.should.equal(y2);
    });
  });
  describe('forward function', () => {
    it('forward throws an error when longitude is outside bounds', () => {
      try {
        mgrs.forward({x: 90, y:180});
        false.should.be.true; // to make sure it errors
      } catch (error) {
        error.should.be.a('error');
        error.message.should.equal('forward received an invalid latitude of 180');
      }
    });
    it('forward throws an error when latitude is outside bounds', () => {
      try {
        mgrs.forward({x: 90, y: 270});
        false.should.be.true; // to make sure it errors
      } catch (error) {
        error.should.be.a('error');
        error.message.should.equal('forward received an invalid latitude of 270');
      }
    });
    it('forward throws an error when latitude is near the north pole', () => {
      try {
        mgrs.forward({x:45, y:88});
        false.should.be.true; // to make sure it errors
      } catch (error) {
        error.should.be.a('error');
        error.message.should.equal('forward received a latitude of 88, but this library does not support conversions of points in polar regions below 80°S and above 84°N');
      }
    });
    it('forward throws an error when latitude is near the south pole', () => {
      try {
        mgrs.forward({x:45, y: -88});
        false.should.be.true; // to make sure it errors
      } catch (error) {
        error.should.be.a('error');
        error.message.should.equal('forward received a latitude of -88, but this library does not support conversions of points in polar regions below 80°S and above 84°N');
      }
    });
  });
});

if (process.env.CHECK_GEOTRANS) {
  describe('Consistency with GEOTRANS', () => {
    it('Should be consistent with GEOTRANS', () => {
      const fileText = readFileSync('./test/testing-data.csv', 'utf8');
      const lines = fileText.split('\n').filter(Boolean);
      lines.forEach(line => {
        const [ mgrsString, expectedLatitude, expectedLongitude ] = line.split('\t');
        const [ actualLongitude, actualLatitude ] = mgrs.toPoint(mgrsString);
        try {
          actualLatitude.should.equal(expectedLatitude);
          actualLongitude.should.equal(expectedLongitude);
        } catch (error) {
          console.error('mgrsString:', mgrsString);
          throw error;
        }
      });
    });
  });
}
