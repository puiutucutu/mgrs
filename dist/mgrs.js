(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.mgrs = {}));
}(this, function (exports) { 'use strict';

  /**
   * Calculates the MGRS letter designator for the given latitude.
   *
   * @private
   * @param {number} lat The latitude in WGS84 to get the letter designator
   *     for.
   * @return {char} The letter designator.
   */
  function getLetterDesignator(latitude) {
    if (latitude <= 84 && latitude >= 72) {
      // the X band is 12 degrees high
      return "X";
    } else if (latitude < 72 || latitude >= -80) {
      // Latitude bands are lettered C through X, excluding I and O
      const bandLetters = "CDEFGHJKLMNPQRSTUVWX";
      const bandHeight = 8;
      const minLatitude = -80;
      const index = Math.floor((latitude - minLatitude) / bandHeight);
      return bandLetters[index];
    } else if (latitude > 84 || latitude < -80) {
      //This is here as an error flag to show that the Latitude is
      //outside MGRS limits
      return "Z";
    }
  }

  /**
   * @see Extracted from https://github.com/proj4js/mgrs/blob/master/mgrs.js#L111
   *
   * @param {Number} longitude
   * @param {Number} latitude
   * @return {Number} An integer
   */
  function determineUtmZoneNumber(longitude, latitude) {
    // ensure the longitude 180.00 is in Zone 60
    if (longitude === 180) {
      return 60;
    }

    // special zone for Norway
    if (
      latitude >= 56.0 &&
      latitude < 64.0 &&
      longitude >= 3.0 &&
      longitude < 12.0
    ) {
      return 32;
    }

    // special zones for Svalbard
    if (latitude >= 72.0 && latitude < 84.0) {
      if (longitude >= 0.0 && longitude < 9.0) {
        return 31;
      } else if (longitude >= 9.0 && longitude < 21.0) {
        return 33;
      } else if (longitude >= 21.0 && longitude < 33.0) {
        return 35;
      } else if (longitude >= 33.0 && longitude < 42.0) {
        return 37;
      }
    }

    // for all other non-special zones
    return Math.floor((longitude + 180) / 6) + 1;
  }

  const degToRad = degrees => degrees * (Math.PI / 180.0);

  const sqrt = x => Math.sqrt(x);
  const sin = x => Math.sin(x);
  const cos = x => Math.cos(x);
  const tan = x => Math.tan(x);

  /**
   * Apply a 10,000,000 meter offset for southern hemisphere.
   *
   * @param {Number} latitude
   * @param {Number} northing
   * @return {Number}
   */
  function adjustNorthingForSouthernHemisphere(latitude, northing) {
    return latitude < 0 ? northing + 10000000.0 : northing;
  }

  /**
   * Converts a set of Longitude and Latitude co-ordinates to UTM using the WGS84 ellipsoid.
   *
   * @param {Number} longitude
   * @param {Number} latitude
   * @return {{easting: Number, zoneNumber: Number, zoneLetter: String, northing: Number}}
   * @see https://pubs.usgs.gov/bul/1532/report.pdf Page 84
   */
  function LLtoUTM(longitude, latitude)
  {
    const a = 6378137.0; // ellipsis radius
    const k0 = 0.9996;
    const zoneNumber = determineUtmZoneNumber(longitude, latitude);

    const latRad = degToRad(latitude);
    const longRad = degToRad(longitude);
    const longOrigin = (zoneNumber - 1) * 6 - 180 + 3; // 3 puts origin in middle of zone
    const longOriginRad = degToRad(longOrigin);

    const eccentricity = 0.00669438; // ellipsoid eccentricity
    const eccPrimeSquared = eccentricity / (1 - eccentricity);
    const N = a / sqrt(1 - eccentricity * sin(latRad) * sin(latRad));
    const T = tan(latRad) * tan(latRad);
    const C = eccPrimeSquared * cos(latRad) * cos(latRad);
    const A = cos(latRad) * (longRad - longOriginRad);

    const M = a *
    (
      (
        (1) -
        (eccentricity / 4) -
        ((3 * eccentricity * eccentricity) / 64) -
        ((5 * eccentricity * eccentricity * eccentricity) / 256)
      )
      * latRad
      - ((3 * eccentricity) / 8 + (3 * eccentricity * eccentricity) / 32 + (45 * eccentricity * eccentricity * eccentricity) / 1024)
      * sin(2 * latRad)
      + ((15 * eccentricity * eccentricity) / 256 + (45 * eccentricity * eccentricity * eccentricity) / 1024)
      * sin(4 * latRad)
      - ((35 * eccentricity * eccentricity * eccentricity) / 3072)
      * sin(6 * latRad)
    );

    const easting = k0 * N *
      (
        (A + ((1 - T + C) * A * A * A) / 6) +
        ((5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A) / 120
      ) + 500000.0
    ;

    const northing = k0 *
    (
      M + N * tan(latRad) *
      (
        (A * A) / 2 +
        ((5 - T + 9 * C + 4 * C * C) * A * A * A * A) / 24 +
        ((61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) *
          A *
          A *
          A *
          A *
          A *
          A
        ) / 720.0
      )
    );

    return {
      northing: Math.trunc(adjustNorthingForSouthernHemisphere(northing)),
      easting: Math.trunc(easting),
      zoneLetter: getLetterDesignator(latitude),
      zoneNumber
    };
  }

  /**
   * Conversion of lat/lon to MGRS.
   *
   * @param {object} ll Object literal with lat and lon properties on a
   *     WGS84 ellipsoid.
   * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
   *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
   * @return {string} the MGRS string for the given location and accuracy.
   */
  function forward(ll, accuracy) {
    accuracy = accuracy || 5; // default accuracy 1m

    if (!Array.isArray(ll)) {
      throw new TypeError("forward did not receive an array");
    }

    if (typeof ll[0] === "string" || typeof ll[1] === "string") {
      throw new TypeError(
        "forward received an array of strings, but it only accepts an array of numbers."
      );
    }

    const [lon, lat] = ll;
    if (lon < -180 || lon > 180) {
      throw new TypeError(`forward received an invalid longitude of ${lon}`);
    }
    if (lat < -90 || lat > 90) {
      throw new TypeError(`forward received an invalid latitude of ${lat}`);
    }

    if (lat < -80 || lat > 84) {
      throw new TypeError(
        `forward received a latitude of ${lat}, but this library does not support conversions of points in polar regions below 80°S and above 84°N`
      );
    }

    return encode(LLtoUTM({ lat, lon }), accuracy);
  }

  /**
   * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a
   * convenience class where the Zone can be specified as a single string
   * eg."60N" which is then broken down into the ZoneNumber and ZoneLetter.
   *
   * @private
   * @param {object} utm An object literal with northing, easting, zoneNumber
   *     and zoneLetter properties. If an optional accuracy property is
   *     provided (in meters), a bounding box will be returned instead of
   *     latitude and longitude.
   * @return {object} An object literal containing either lat and lon values
   *     (if no accuracy was provided), or top, right, bottom and left values
   *     for the bounding box calculated according to the provided accuracy.
   *     Returns null if the conversion failed.
   */
  function UTMtoLL(utm) {

    const UTMNorthing = utm.northing;
    const UTMEasting = utm.easting;
    const { zoneLetter, zoneNumber } = utm;
    // check the ZoneNummber is valid
    if (zoneNumber < 0 || zoneNumber > 60) {
      return null;
    }

    const k0 = 0.9996;
    const a = 6378137.0; //ellip.radius;
    const eccSquared = 0.00669438; //ellip.eccsq;
    const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));

    // remove 500,000 meter offset for longitude
    const x = UTMEasting - 500000.0;
    let y = UTMNorthing;

    // We must know somehow if we are in the Northern or Southern
    // hemisphere, this is the only time we use the letter So even
    // if the Zone letter isn't exactly correct it should indicate
    // the hemisphere correctly
    if (zoneLetter < 'N') {
      y -= 10000000.0; // remove 10,000,000 meter offset used
      // for southern hemisphere
    }

    // There are 60 zones with zone 1 being at West -180 to -174
    const LongOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
    // in middle of
    // zone

    const eccPrimeSquared = (eccSquared) / (1 - eccSquared);

    const M = y / k0;
    const mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

    const phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
    // double phi1 = ProjMath.radToDeg(phi1Rad);

    const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
    const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
    const C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
    const R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
    const D = x / (N1 * k0);

    let lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
    lat = radToDeg(lat);

    let lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
    lon = LongOrigin + radToDeg(lon);

    let result;
    if (utm.accuracy) {
      const topRight = UTMtoLL({
        northing: utm.northing + utm.accuracy,
        easting: utm.easting + utm.accuracy,
        zoneLetter: utm.zoneLetter,
        zoneNumber: utm.zoneNumber
      });
      result = {
        top: topRight.lat,
        right: topRight.lon,
        bottom: lat,
        left: lon
      };
    } else {
      result = {
        lat,
        lon
      };
    }
    return result;
  }

  /**
   * The function getMinNorthing returns the minimum northing value of a MGRS
   * zone.
   *
   * Ported from Geotrans' c Lattitude_Band_Value structure table.
   *
   * @private
   * @param {char} zoneLetter The MGRS zone to get the min northing for.
   * @return {number}
   */
  function getMinNorthing(zoneLetter) {
    let northing;
    switch (zoneLetter) {
      case 'C':
        northing = 1100000.0;
        break;
      case 'D':
        northing = 2000000.0;
        break;
      case 'E':
        northing = 2800000.0;
        break;
      case 'F':
        northing = 3700000.0;
        break;
      case 'G':
        northing = 4600000.0;
        break;
      case 'H':
        northing = 5500000.0;
        break;
      case 'J':
        northing = 6400000.0;
        break;
      case 'K':
        northing = 7300000.0;
        break;
      case 'L':
        northing = 8200000.0;
        break;
      case 'M':
        northing = 9100000.0;
        break;
      case 'N':
        northing = 0.0;
        break;
      case 'P':
        northing = 800000.0;
        break;
      case 'Q':
        northing = 1700000.0;
        break;
      case 'R':
        northing = 2600000.0;
        break;
      case 'S':
        northing = 3500000.0;
        break;
      case 'T':
        northing = 4400000.0;
        break;
      case 'U':
        northing = 5300000.0;
        break;
      case 'V':
        northing = 6200000.0;
        break;
      case 'W':
        northing = 7000000.0;
        break;
      case 'X':
        northing = 7900000.0;
        break;
      default:
        northing = -1.0;
    }
    if (northing >= 0.0) {
      return northing;
    }
    else {
      throw new TypeError(`Invalid zone letter: ${zoneLetter}`);
    }

  }

  /**
   * UTM zones are grouped, and assigned to one of a group of 6 sets.
   *
   * @type {Number}
   */
  const NUM_100K_SETS = 6;

  /**
   * The column letters (for easting) of the lower left value, per set.
   *
   * @type {String}
   */
  const SET_ORIGIN_COLUMN_LETTERS = "AJSAJS";

  /**
   * The row letters (for northing) of the lower left value, per set.
   *
   * @type {String}
   */
  const SET_ORIGIN_ROW_LETTERS = "AFAFAF";

  const A = 65;
  const I = 73;
  const O = 79;
  const V = 86;
  const Z = 90;

  /**
   * Given a UTM zone number, figure out the MGRS 100K set it is in.
   *
   * @private
   * @param {number} i An UTM zone number.
   * @return {number} the 100k set the UTM zone is in.
   */
  function get100kSetForZone(i) {
    let setParm = i % NUM_100K_SETS;
    if (setParm === 0) {
      setParm = NUM_100K_SETS;
    }

    return setParm;
  }

  /**
   * Given the first letter from a two-letter MGRS 100k zone, and given the
   * MGRS table set for the zone number, figure out the easting value that
   * should be added to the other, secondary easting value.
   *
   * @private
   * @param {char} e The first letter from a two-letter MGRS 100´k zone.
   * @param {number} set The MGRS table set for the zone number.
   * @return {number} The easting value for the given letter and set.
   */
  function getEastingFromChar(e, set) {
    // colOrigin is the letter at the origin of the set for the
    // column
    let curCol = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
    let eastingValue = 100000.0;
    let rewindMarker = false;

    while (curCol !== e.charCodeAt(0)) {
      curCol++;
      if (curCol === I) {
        curCol++;
      }
      if (curCol === O) {
        curCol++;
      }
      if (curCol > Z) {
        if (rewindMarker) {
          throw new Error(`Bad character: ${e}`);
        }
        curCol = A;
        rewindMarker = true;
      }
      eastingValue += 100000.0;
    }

    return eastingValue;
  }

  /**
   * Given the second letter from a two-letter MGRS 100k zone, and given the
   * MGRS table set for the zone number, figure out the northing value that
   * should be added to the other, secondary northing value. You have to
   * remember that Northings are determined from the equator, and the vertical
   * cycle of letters mean a 2000000 additional northing meters. This happens
   * approx. every 18 degrees of latitude. This method does *NOT* count any
   * additional northings. You have to figure out how many 2000000 meters need
   * to be added for the zone letter of the MGRS coordinate.
   *
   * @private
   * @param {char} n Second letter of the MGRS 100k zone
   * @param {number} set The MGRS table set number, which is dependent on the
   *     UTM zone number.
   * @return {number} The northing value for the given letter and set.
   */
  function getNorthingFromChar(n, set) {

    if (n > 'V') {
      throw new TypeError(`MGRSPoint given invalid Northing ${n}`);
    }

    // rowOrigin is the letter at the origin of the set for the
    // column
    let curRow = SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
    let northingValue = 0.0;
    let rewindMarker = false;

    while (curRow !== n.charCodeAt(0)) {
      curRow++;
      if (curRow === I) {
        curRow++;
      }
      if (curRow === O) {
        curRow++;
      }
      // fixing a bug making whole application hang in this loop
      // when 'n' is a wrong character
      if (curRow > V) {
        if (rewindMarker) { // making sure that this loop ends
          throw new Error(`Bad character: ${n}`);
        }
        curRow = A;
        rewindMarker = true;
      }
      northingValue += 100000.0;
    }

    return northingValue;
  }

  /**
   * Decode the UTM parameters from a MGRS string.
   *
   * @private
   * @param {string} mgrsString an UPPERCASE coordinate string is expected.
   * @return {object} An object literal with easting, northing, zoneLetter,
   *     zoneNumber and accuracy (in meters) properties.
   */

  function decode(mgrsString) {
    if (mgrsString && mgrsString.length === 0) {
      throw new TypeError("MGRSPoint coverting from nothing");
    }

    //remove any spaces in MGRS String
    mgrsString = mgrsString.replace(/ /g, "");

    const { length } = mgrsString;

    let hunK = null;
    let sb = "";
    let testChar;
    let i = 0;

    // get Zone number
    while (!/[A-Z]/.test((testChar = mgrsString.charAt(i)))) {
      if (i >= 2) {
        throw new Error(`MGRSPoint bad conversion from: ${mgrsString}`);
      }
      sb += testChar;
      i++;
    }

    const zoneNumber = parseInt(sb, 10);

    if (i === 0 || i + 3 > length) {
      // A good MGRS string has to be 4-5 digits long,
      // ##AAA/#AAA at least.
      throw new Error(`MGRSPoint bad conversion from ${mgrsString}`);
    }

    const zoneLetter = mgrsString.charAt(i++);

    // Should we check the zone letter here? Why not.
    if (
      zoneLetter <= "A" ||
      zoneLetter === "B" ||
      zoneLetter === "Y" ||
      zoneLetter >= "Z" ||
      zoneLetter === "I" ||
      zoneLetter === "O"
    ) {
      throw new Error(
        `MGRSPoint zone letter ${zoneLetter} not handled: ${mgrsString}`
      );
    }

    hunK = mgrsString.substring(i, (i += 2));

    const set = get100kSetForZone(zoneNumber);

    const east100k = getEastingFromChar(hunK.charAt(0), set);
    let north100k = getNorthingFromChar(hunK.charAt(1), set);

    // We have a bug where the northing may be 2000000 too low.
    // How
    // do we know when to roll over?

    while (north100k < getMinNorthing(zoneLetter)) {
      north100k += 2000000;
    }

    // calculate the char index for easting/northing separator
    const remainder = length - i;

    if (remainder % 2 !== 0) {
      throw new Error(`MGRSPoint has to have an even number
of digits after the zone letter and two 100km letters - front
half for easting meters, second half for
northing meters ${mgrsString}`);
    }

    const sep = remainder / 2;

    let sepEasting = 0.0;
    let sepNorthing = 0.0;
    let accuracyBonus, sepEastingString, sepNorthingString;
    if (sep > 0) {
      accuracyBonus = 100000.0 / Math.pow(10, sep);
      sepEastingString = mgrsString.substring(i, i + sep);
      sepEasting = parseFloat(sepEastingString) * accuracyBonus;
      sepNorthingString = mgrsString.substring(i + sep);
      sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
    }

    const easting = sepEasting + east100k;
    const northing = sepNorthing + north100k;

    return {
      easting,
      northing,
      zoneLetter,
      zoneNumber,
      accuracy: accuracyBonus
    };
  }

  /**
   * Converts an MGRS string to longitude and latitude.
   *
   * @param {String} mgrs
   * @return {*[]} An array with left (longitude), bottom (latitude), right
   * (longitude) and top (latitude) values in WGS84, representing the bounding
   * box for the provided MGRS reference.
   */
  function inverse(mgrs) {
    const bbox = UTMtoLL(decode(mgrs.toUpperCase()));

    return bbox.lat && bbox.lon
      ? [bbox.lon, bbox.lat, bbox.lon, bbox.lat]
      : [bbox.left, bbox.bottom, bbox.right, bbox.top]
    ;
  }

  /**
   * @param {String} mgrs
   * @return {*}
   */
  function toPoint(mgrs) {
    if (mgrs === "") {
      throw new TypeError("toPoint received a blank string");
    }

    const bbox = UTMtoLL(decode(mgrs.toUpperCase()));

    return bbox.lat && bbox.lon
      ? [bbox.lon, bbox.lat]
      : [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2]
    ;
  }

  exports.forward = forward;
  exports.inverse = inverse;
  exports.toPoint = toPoint;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
