import { LLtoUTM } from "./LLtoUTM";
import { encode } from "./encode";

/**
 * Conversion of lat/lon to MGRS.
 *
 * @param {object} ll Object literal with lat and lon properties on a
 *     WGS84 ellipsoid.
 * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
 *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
 * @return {string} the MGRS string for the given location and accuracy.
 */
function forward(ll, accuracy = 5) {
  if (!Array.isArray(ll)) {
    throw new TypeError("forward did not receive an array");
  }

  if (typeof ll[0] === "string" || typeof ll[1] === "string") {
    throw new TypeError(
      "forward received an array of strings, but it only accepts an array of numbers."
    );
  }

  const [lon, lat] = ll;
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
