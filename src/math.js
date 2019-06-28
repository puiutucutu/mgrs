const degToRad = degrees => degrees * (Math.PI / 180.0);
const radToDeg = radians => 180.0 * (radians / Math.PI);

const sqrt = x => Math.sqrt(x);
const sin = x => Math.sin(x);
const cos = x => Math.cos(x);
const tan = x => Math.tan(x);

export { degToRad, radToDeg, sqrt, sin, cos, tan };
