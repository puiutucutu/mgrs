import { get100kID } from "./get100kID";

/**
 * Encodes a UTM location as MGRS string.
 *
 * @private
 * @param {object} utm An object literal with easting, northing,
 *     zoneLetter, zoneNumber
 * @param {number} accuracy Accuracy in digits (1-5).
 * @return {string} MGRS string for the given UTM location.
 */
function encode(utm, accuracy) {
  // prepend with leading zeroes
  const seasting = "00000" + utm.easting,
    snorthing = "00000" + utm.northing;

  return (
    utm.zoneNumber +
    utm.zoneLetter +
    get100kID(utm.easting, utm.northing, utm.zoneNumber) +
    seasting.substr(seasting.length - 5, accuracy) +
    snorthing.substr(snorthing.length - 5, accuracy)
  );
}

export { encode };
