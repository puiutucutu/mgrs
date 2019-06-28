import { getLetterDesignator } from "./getLetterDesignator";
import { determineUtmZoneNumber } from "./determineUtmZoneNumber";

const degToRad = degrees => (degrees * Math.PI) / 180;
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

export { LLtoUTM };
