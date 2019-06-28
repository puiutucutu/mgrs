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

export { determineUtmZoneNumber };