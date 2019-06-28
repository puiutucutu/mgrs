/**
 * UTM zones are grouped, and assigned to one of a group of 6
 * sets.
 *
 * {int} @private
 */
const NUM_100K_SETS = 6;

/**
 * The column letters (for easting) of the lower left value, per
 * set.
 *
 * {string} @private
 */
const SET_ORIGIN_COLUMN_LETTERS = "AJSAJS";

/**
 * The row letters (for northing) of the lower left value, per
 * set.
 *
 * {string} @private
 */
const SET_ORIGIN_ROW_LETTERS = "AFAFAF";

const A = 65; // A
const I = 73; // I
const O = 79; // O
const V = 86; // V
const Z = 90; // Z
