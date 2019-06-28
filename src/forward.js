import { LLtoUTM } from "./LLtoUTM";
import { encode } from "./encode";

/**
 * Conversion of longitude and latitude to MGRS.
 *
 * @param {Object} LL Object literal with lat and lon properties on a WGS84 ellipsoid.
 * @param {Number} [accuracy=5] Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for 100 m, 2 for 1,000 m or 1 for 10,000 m).
 * @return {string} the MGRS  string for the given location and accuracy.
 */
function forward(LL, accuracy = 5) {
  if (!Array.isArray(LL)) {
    throw new TypeError("forward did not receive an array");
  }

  if (typeof LL[0] === "string" || typeof LL[1] === "string") {
    throw new TypeError(
      "forward received an array of strings, but it only accepts an array of numbers."
    );
  }

  const [lon, lat] = LL;
  if (lon < -180 || lon > 180) {
    throw new TypeError(`forward received an invalid longitude of ${lon}`);
  }
  if (lat < -90 || lat > 90) {
    throw new TypeError(`forward received an invalid latitude of ${lat}`);
  }

  if (lat < -80 || lat > 84) {
    throw new TypeError(
      `forward received a latitude of ${lat}, but this library does not support conversions of points in polar regions below 80°S and above 84°N`
    );
  }

  return encode(LLtoUTM(lon, lat), accuracy);
}

export { forward };
