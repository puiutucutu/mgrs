import { UTMtoLL } from "./UTMtoLL";
import { decode } from "./decode";

/**
 * Converts an MGRS string to longitude and latitude.
 *
 * @param {String} mgrs
 * @return {*[]} An array with left (longitude), bottom (latitude), right
 * (longitude) and top (latitude) values in WGS84, representing the bounding
 * box for the provided MGRS reference.
 */
function inverse(mgrs) {
  const bbox = UTMtoLL(decode(mgrs.toUpperCase()));

  return bbox.lat && bbox.lon
    ? [bbox.lon, bbox.lat, bbox.lon, bbox.lat]
    : [bbox.left, bbox.bottom, bbox.right, bbox.top]
  ;
}

export { inverse };
