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
  const { northing, easting, zoneLetter, zoneNumber } = utm;

  // prepend with leading zeroes
  const seasting = "00000" + easting,
    snorthing = "00000" + northing;

  return (
    zoneNumber +
    zoneLetter +
    get100kID(easting, northing, zoneNumber) +
    seasting.substr(seasting.length - 5, accuracy) +
    snorthing.substr(snorthing.length - 5, accuracy)
  );
}

export { encode };
