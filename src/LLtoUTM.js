import { getLetterDesignator } from "./getLetterDesignator";
import { determineUtmZoneNumber } from "./determineUtmZoneNumber";

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

const sqrt = x => Math.sqrt(x);
const sin = x => Math.sin(x);
const cos = x => Math.cos(x);
const tan = x => Math.tan(x);

/**
 * @param {Number} longitude
 * @param {Number} latitude
 * @return {{easting: Number, zoneNumber: Number, zoneLetter: String, northing: Number}}
 */
function LLtoUTM(longitude, latitude) {
  const radius = 6378137.0; // ellipsis radius
  const eccentricity = 0.00669438; // ellipsoid eccentricity
  const k0 = 0.9996;
  const latRad = degToRad(latitude);
  const longRad = degToRad(longitude);
  const zoneNumber = determineUtmZoneNumber(longitude, latitude);

  const longOrigin = (zoneNumber - 1) * 6 - 180 + 3; // 3 puts origin in middle of zone
  const longOriginRad = degToRad(longOrigin);

  const eccPrimeSquared = eccentricity / (1 - eccentricity);

  const n = radius / sqrt(1 - eccentricity * sin(latRad) * sin(latRad));
  const t = tan(latRad) * tan(latRad);
  const c = eccPrimeSquared * cos(latRad) * cos(latRad);
  const a = cos(latRad) * (longRad - longOriginRad);

  const m =
    radius *
    ((1 -
      eccentricity / 4 -
      (3 * eccentricity * eccentricity) / 64 -
      (5 * eccentricity * eccentricity * eccentricity) / 256) *
      latRad -
      ((3 * eccentricity) / 8 +
        (3 * eccentricity * eccentricity) / 32 +
        (45 * eccentricity * eccentricity * eccentricity) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * eccentricity * eccentricity) / 256 +
        (45 * eccentricity * eccentricity * eccentricity) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * eccentricity * eccentricity * eccentricity) / 3072) *
        Math.sin(6 * latRad));

  const easting = k0 * n *
    (
      (a + ((1 - t + c) * a * a * a) / 6) +
      ((5 - 18 * t + t * t + 72 * c - 58 * eccPrimeSquared) * a * a * a * a * a) / 120
    ) + 500000.0
  ;

  const northing = k0 *
  (
    m + n * Math.tan(latRad) *
    (
      (a * a) / 2 +
      ((5 - t + 9 * c + 4 * c * c) * a * a * a * a) / 24 +
      ((61 - 58 * t + t * t + 600 * c - 330 * eccPrimeSquared) *
        a *
        a *
        a *
        a *
        a *
        a
      ) / 720.0
    )
  );

  const northingAdjustedForSouthernHemisphere = latitude < 0 // 10000000 meter offset for southern hemisphere
    ? northing + 10000000.0
    : northing
  ;

  return {
    northing: Math.trunc(northingAdjustedForSouthernHemisphere),
    easting: Math.trunc(easting),
    zoneLetter: getLetterDesignator(latitude),
    zoneNumber
  };
}

export { LLtoUTM };
