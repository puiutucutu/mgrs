import { UTMtoLL } from "./UTMtoLL";
import { decode } from "./decode";

function toPoint(mgrs) {
  if (mgrs === "") {
    throw new TypeError("toPoint received a blank string");
  }

  const bbox = UTMtoLL(decode(mgrs.toUpperCase()));

  return bbox.lat && bbox.lon
    ? [bbox.lon, bbox.lat]
    : [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2]
  ;
}

export { toPoint };
