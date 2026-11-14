// good defaults for the NTT logo
const DEFAULTS = {
  a: 2.58,
  b: 1,
  n: 1.57, // pi/2 to rotate 90 degrees
  scale: 100,
  weight: 50
};

const NTTBLUE = "#0072bc";
const NTTDARKBLUE = "#001973";
const CURVE_STEPS = 720;

const limacon = { ...DEFAULTS };
const inputs = {};
let showConstruction = true;
let theta = 0;
let curvePoints = [];
let offset = { x: 0, y: 0 };
let reduceMotion = false;

// Limaçon formula itself (polar radius, then cartesian)
function limaconRadius(angle) {
  return limacon.b + limacon.a * Math.cos(angle - limacon.n);
}

function limaconXY(angle) {
  const r = limacon.scale * limaconRadius(angle);
  return [r * Math.cos(angle), r * Math.sin(angle)];
}

function classifyCurve(a, b) {
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  if (absA < 1e-6 && absB < 1e-6) return "A single point";
  if (absA < 1e-6) return "Circle";
  const ratio = absB / absA;
  if (Math.abs(ratio - 1) < 0.005) return "Cardioid";
  if (ratio < 1) return "Inner loop · the NTT shape";
  if (ratio < 2) return "Dimpled limaçon";
  return "Convex limaçon";
}

function fmt(value) {
  return Number(value).toFixed(2);
}

function updateFill(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty("--fill", pct + "%");
}

function readInputs() {
  limacon.a = Number(inputs.a.value);
  limacon.b = Number(inputs.b.value);
  limacon.n = Number(inputs.n.value);
  limacon.scale = Number(inputs.scale.value);
  limacon.weight = Number(inputs.weight.value);

  document.getElementById("a-out").textContent = fmt(limacon.a);
  document.getElementById("b-out").textContent = fmt(limacon.b);
  document.getElementById("n-out").textContent =
    fmt(limacon.n) + " · " + Math.round((limacon.n * 180) / Math.PI) + "°";
  document.getElementById("scale-out").textContent = limacon.scale;
  document.getElementById("weight-out").textContent = limacon.weight;

  const sign = limacon.a < 0 ? " − " : " + ";
  document.getElementById("equation").textContent =
    "r = " + fmt(limacon.b) + sign + fmt(Math.abs(limacon.a)) + " cos(θ − " + fmt(limacon.n) + ")";
  document.getElementById("curve-type").textContent = classifyCurve(limacon.a, limacon.b);

  Object.values(inputs).forEach(updateFill);
  computeCurve();
  if (reduceMotion) redraw();
}

// Precompute the curve and centre its bounding box on the canvas
function computeCurve() {
  curvePoints = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let k = 0; k <= CURVE_STEPS; k++) {
    const [x, y] = limaconXY((k / CURVE_STEPS) * Math.PI * 2);
    curvePoints.push([x, y]);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  offset = { x: -(minX + maxX) / 2, y: -(minY + maxY) / 2 };
}

function reset() {
  inputs.a.value = DEFAULTS.a;
  inputs.b.value = DEFAULTS.b;
  inputs.n.value = DEFAULTS.n;
  inputs.scale.value = DEFAULTS.scale;
  inputs.weight.value = DEFAULTS.weight;
  readInputs();
}

function stageSize() {
  const el = document.getElementById("sketch-div");
  return [el.clientWidth, el.clientHeight];
}

// setup p5.js
function setup() {
  const [w, h] = stageSize();
  const canvas = createCanvas(w, h);
  canvas.parent("sketch-div");

  ["a", "b", "n", "scale", "weight"].forEach((id) => {
    inputs[id] = document.getElementById(id);
    inputs[id].addEventListener("input", readInputs);
  });
  document.getElementById("reset").addEventListener("click", reset);

  const toggle = document.getElementById("construction");
  showConstruction = toggle.checked;
  toggle.addEventListener("change", () => {
    showConstruction = toggle.checked;
    if (reduceMotion) redraw();
  });

  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) noLoop();

  readInputs();
}

function windowResized() {
  const [w, h] = stageSize();
  resizeCanvas(w, h);
}

function drawAxes(originX, originY) {
  stroke(0, 25, 115, 28);
  strokeWeight(1);
  line(0, originY, width, originY);
  line(originX, 0, originX, height);
}

// primary p5.js draw routine
function draw() {
  clear();

  const cx = width / 2 + offset.x;
  const cy = height / 2 + offset.y;

  if (showConstruction) drawAxes(cx, cy);

  push();
  translate(cx, cy);

  // the limaçon itself
  noFill();
  stroke(NTTBLUE);
  strokeWeight(limacon.weight);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  if (limacon.weight > 0) {
    beginShape();
    curvePoints.forEach(([x, y]) => vertex(x, y));
    endShape();
  }

  // the animated tracer
  const [tx, ty] = limaconXY(theta);
  if (showConstruction) {
    stroke(NTTDARKBLUE);
    strokeWeight(1.5);
    drawingContext.setLineDash([4, 4]);
    line(0, 0, tx, ty);
    drawingContext.setLineDash([]);
    noStroke();
    fill(NTTDARKBLUE);
    circle(0, 0, 6);
  }

  stroke(NTTDARKBLUE);
  strokeWeight(Math.max(limacon.weight - 10, 10));
  point(tx, ty);
  stroke(255);
  strokeWeight(Math.max(limacon.weight * 0.2, 3));
  point(tx, ty);
  pop();

  theta = (theta + 0.02) % (Math.PI * 2);
}
