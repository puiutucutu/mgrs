import { UTMtoLL } from "./UTMtoLL";
import { decode } from "./decode";

const compose = f => g => x => f(g(x));

const add = x => y => x + y;
const divide = divisor => operand => operand / divisor;
const divideByTwo = divide(2);

/**
 * @param {String} mgrs
 * @return {*}
 */
function toPoint(mgrs) {
  if (mgrs === "") {
    throw new TypeError("Arg `mgrs` cannot be a blank string");
  }

  const { lon, lat, left, right, top, bottom } = UTMtoLL(
    decode(mgrs.toUpperCase())
  );

  return lon && lat
    ? { x: lon, y: lat }
    : {
        x: compose (divideByTwo) (add(left)) (right),
        y: compose (divideByTwo) (add(top)) (bottom)
      }
    ;
}

export { toPoint };
