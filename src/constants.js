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

export {
  NUM_100K_SETS,
  SET_ORIGIN_COLUMN_LETTERS,
  SET_ORIGIN_ROW_LETTERS,
  A,
  I,
  O,
  V,
  Z
};
