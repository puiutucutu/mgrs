/**
 * Decode the UTM parameters from a MGRS string.
 *
 * @private
 * @param {string} mgrsString an UPPERCASE coordinate string is expected.
 * @return {object} An object literal with easting, northing, zoneLetter,
 *     zoneNumber and accuracy (in meters) properties.
 */
function decode(mgrsString) {

  if (mgrsString && mgrsString.length === 0) {
    throw new TypeError('MGRSPoint coverting from nothing');
  }

  //remove any spaces in MGRS String
  mgrsString = mgrsString.replace(/ /g, '');

  const { length } = mgrsString;

  let hunK = null;
  let sb = '';
  let testChar;
  let i = 0;

  // get Zone number
  while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i))) {
    if (i >= 2) {
      throw new Error(`MGRSPoint bad conversion from: ${mgrsString}`);
    }
    sb += testChar;
    i++;
  }

  const zoneNumber = parseInt(sb, 10);

  if (i === 0 || i + 3 > length) {
    // A good MGRS string has to be 4-5 digits long,
    // ##AAA/#AAA at least.
    throw new Error(`MGRSPoint bad conversion from ${mgrsString}`);
  }

  const zoneLetter = mgrsString.charAt(i++);

  // Should we check the zone letter here? Why not.
  if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O') {
    throw new Error(`MGRSPoint zone letter ${zoneLetter} not handled: ${mgrsString}`);
  }

  hunK = mgrsString.substring(i, i += 2);

  const set = get100kSetForZone(zoneNumber);

  const east100k = getEastingFromChar(hunK.charAt(0), set);
  let north100k = getNorthingFromChar(hunK.charAt(1), set);

  // We have a bug where the northing may be 2000000 too low.
  // How
  // do we know when to roll over?

  while (north100k < getMinNorthing(zoneLetter)) {
    north100k += 2000000;
  }

  // calculate the char index for easting/northing separator
  const remainder = length - i;

  if (remainder % 2 !== 0) {
    throw new Error(`MGRSPoint has to have an even number
of digits after the zone letter and two 100km letters - front
half for easting meters, second half for
northing meters ${mgrsString}`);
  }

  const sep = remainder / 2;

  let sepEasting = 0.0;
  let sepNorthing = 0.0;
  let accuracyBonus, sepEastingString, sepNorthingString;
  if (sep > 0) {
    accuracyBonus = 100000.0 / Math.pow(10, sep);
    sepEastingString = mgrsString.substring(i, i + sep);
    sepEasting = parseFloat(sepEastingString) * accuracyBonus;
    sepNorthingString = mgrsString.substring(i + sep);
    sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
  }

  const easting = sepEasting + east100k;
  const northing = sepNorthing + north100k;

  return {
    easting,
    northing,
    zoneLetter,
    zoneNumber,
    accuracy: accuracyBonus
  };
}

export { decode }