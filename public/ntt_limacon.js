// good defaults for the NTT logo
let aDEFAULT = 2.58;
let bDEFAULT = 1;
let nDEFAULT = 1.57; // pi/2 to rotate 90 degrees
let scaleFactorDEFAULT = 100;
let weightDEFAULT = 50;

let limacon = {
  a: aDEFAULT,
  b: bDEFAULT,
  n: nDEFAULT,
  scaleFactor: scaleFactorDEFAULT,
  weight: weightDEFAULT
};

let i = 0;
let sliderSpacing = 130;
let staticLimacon;

let sketchHeight = 800;
let sketchWidth = 800;

// Limaçon formula itself (in cartesian form)
function limacon_xy(limacon, angle) {
  var x = limacon.scaleFactor * (limacon.b + (limacon.a * cos(angle - limacon.n))) * cos(angle);
  var y = limacon.scaleFactor * (limacon.b + (limacon.a * cos(angle - limacon.n))) * sin(angle);
  return [x, y];
}

// setup p5.js
function setup() {
  let canvas = createCanvas(sketchWidth, sketchHeight);
  canvas.parent('sketch-div');

  sliderA = createSlider(-10, 10, limacon.a, 0.01);
  sliderA.position(10, 25);
  sliderA.style('width', '80px');
  sliderB = createSlider(-5, 5, limacon.b, 0.01);
  sliderB.position(10 + sliderSpacing, 25);
  sliderB.style('width', '80px');
  sliderN = createSlider(0, 6.28, limacon.n, 0.01);
  sliderN.position(10 + (2 * sliderSpacing), 25);
  sliderN.style('width', '80px');
  sliderF = createSlider(0, 300, limacon.scaleFactor, 1);
  sliderF.position(10 + (3 * sliderSpacing), 25);
  sliderF.style('width', '80px');
  sliderW = createSlider(0, 100, limacon.weight, 1);
  sliderW.position(10 + (4 * sliderSpacing), 25);
  sliderW.style('width', '80px');

  sliderA.input(slider_update);
  sliderB.input(slider_update);
  sliderN.input(slider_update);
  sliderF.input(slider_update);
  sliderW.input(slider_update);

  sliderA.parent('sketch-div');
  sliderB.parent('sketch-div');
  sliderN.parent('sketch-div');
  sliderF.parent('sketch-div');
  sliderW.parent('sketch-div');

  button = createButton('Reset');
  button.mouseClicked(reset);
  button.position(10 + (5 * sliderSpacing), 30);
  button.style('width', '80px');

  button.parent('sketch-div');

  slider_update();
}

// reset button function
function reset() {
  sliderA.value(aDEFAULT);
  sliderB.value(bDEFAULT);
  sliderN.value(nDEFAULT);
  sliderF.value(scaleFactorDEFAULT);
  sliderW.value(weightDEFAULT);

  slider_update();
}

// update everything on slider changes
function slider_update() {
  // take the latest slider values
  limacon.a = sliderA.value();
  limacon.b = sliderB.value();
  limacon.n = sliderN.value();
  limacon.scaleFactor = sliderF.value();
  limacon.weight = sliderW.value();

  staticLimacon = createGraphics(sketchWidth, sketchHeight);
  staticLimacon.stroke("#0033CC");

  // update the stats
  staticLimacon.strokeWeight(1);
  staticLimacon.text("Limaçon of Pascal : r = " + limacon.b + " + " + limacon.a + " cos (θ - " + limacon.n + ")" , 10, 20);
  staticLimacon.text("a: " + limacon.a, 10, 60);
  staticLimacon.text("b: " + limacon.b, (10 + (1 * sliderSpacing)), 60);
  staticLimacon.text("n: " + limacon.n + " (" + Math.round(limacon.n * 180 / PI) + "° rotation)", (10 + (2 * sliderSpacing)), 60);
  staticLimacon.text("scale: " + limacon.scaleFactor, (10 + (3 * sliderSpacing)), 60);
  staticLimacon.text("weight: " + limacon.weight, (10 + (4 * sliderSpacing)), 60);

  // redraw the static image of the limaçon
  staticLimacon.strokeWeight(limacon.weight);
  staticLimacon.translate(width / 2, height / 4);
  for (var j = 0; j < TWO_PI; j += 0.001) {
    [x, y] = limacon_xy(limacon, j);
    staticLimacon.point(x, y);
  }

}

// primary p5.js draw routine
function draw() {
  // draw the static version
  background(255);
  stroke("#0033CC");
  image(staticLimacon, 0, 0);

  // draw the outline animation frame
  translate(width / 2, height / 4);
  stroke("#001973");
  [x, y] = limacon_xy(limacon, i);
  strokeWeight(limacon.weight - 10);
  point(x, y);
  i += 0.05;
  if (i === TWO_PI) i = 0;
}
