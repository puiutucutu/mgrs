/**
 * Get the two letter 100k designator for a given UTM easting,
 * northing and zone number value.
 *
 * @private
 * @param {number} easting
 * @param {number} northing
 * @param {number} zoneNumber
 * @return {string} the two letter 100k designator for the given UTM location.
 */
function get100kID(easting, northing, zoneNumber) {
  const setParm = get100kSetForZone(zoneNumber);
  const setColumn = Math.floor(easting / 100000);
  const setRow = Math.floor(northing / 100000) % 20;
  return getLetter100kID(setColumn, setRow, setParm);
}

export { get100kID }