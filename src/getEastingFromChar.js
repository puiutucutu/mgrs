import { A, I, O, SET_ORIGIN_COLUMN_LETTERS, Z } from './constants';

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

export { getEastingFromChar}