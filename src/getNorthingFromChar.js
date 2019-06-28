import { A, I, O, SET_ORIGIN_ROW_LETTERS, V } from './constants';

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

export { getNorthingFromChar }