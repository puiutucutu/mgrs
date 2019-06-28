/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @private
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
function getLetterDesignator(latitude) {
  if (latitude <= 84 && latitude >= 72) {
    // the X band is 12 degrees high
    return "X";
  } else if (latitude < 72 || latitude >= -80) {
    // Latitude bands are lettered C through X, excluding I and O
    const bandLetters = "CDEFGHJKLMNPQRSTUVWX";
    const bandHeight = 8;
    const minLatitude = -80;
    const index = Math.floor((latitude - minLatitude) / bandHeight);
    return bandLetters[index];
  } else if (latitude > 84 || latitude < -80) {
    //This is here as an error flag to show that the Latitude is
    //outside MGRS limits
    return "Z";
  }
}

export { getLetterDesignator };

