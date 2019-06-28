import { NUM_100K_SETS } from './constants';

/**
 * Given a UTM zone number, figure out the MGRS 100K set it is in.
 *
 * @private
 * @param {number} i An UTM zone number.
 * @return {number} the 100k set the UTM zone is in.
 */
function get100kSetForZone(i) {
  let setParm = i % NUM_100K_SETS;
  if (setParm === 0) {
    setParm = NUM_100K_SETS;
  }

  return setParm;
}

export { get100kSetForZone}