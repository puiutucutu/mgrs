import { UTMtoLL } from './UTMtoLL';

export function toPoint(mgrs) {
  if (mgrs === '') {
    throw new TypeError('toPoint received a blank string');
  }
  const bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat];
  }
  return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
}
