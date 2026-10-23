/**
 * 28 x 28 Digit Drawing Board (p5.js + Math.js)
 *
 * The board data lives in a Math.js matrix (values 0..1, 0 = black, 1 = white).
 * Other scripts can call getMatrix() / getInputVector() at any time,
 * e.g. inside a mouseReleased handler or a requestAnimationFrame loop,
 * to run real-time neural network inference.
 *
 * Requires p5.js and Math.js to be loaded before this file.
 */

let mod_1;

let model;
let TT;

let L1, b1, L2, b2, L3, b3,c;

function preload() {
  model = loadJSON("mnist_model.json");
  TT = loadJSON("test.json");
}

let img;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const ROWS = 28;                 // number of rows
const COLS = 28;                 // number of columns
const CELL_SIZE = 15;            // width and height of each square cell (px)
let BOARD_X = 20;              // x position of the board's top-left corner (px)
let BOARD_Y = 20;              // y position of the board's top-left corner (px)
const BRUSH_SIZE = 1.5;          // brush radius measured in cells (larger = thicker)
const BRUSH_STEP = 0.25;         // stroke sampling distance in cells (smaller = smoother)
const BACKGROUND_COLOR = "#000000"; // value 0 / empty cell color
const DRAW_COLOR = "#ffffff";       // value 1 / fully drawn cell color
const PAGE_COLOR = "#222222";       // canvas color around the board
const GRID_LINE_COLOR = "rgba(255, 255, 255, 0.08)"; // set to null to hide grid lines


let L1_n = [];
let L2_n = [];
let L3_n = [];


// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let boardMatrix;          // Math.js matrix (ROWS x COLS), source of truth
let isDrawing = false;    // true while a stroke started inside the board
let lastX = null;         // previous mouse position of the current stroke
let lastY = null;
let bgCol, fgCol;         // p5.Color objects, created in setup()
let cellPositions = [];   // one entry per cell, row-major (same order as getInputVector)

// ---------------------------------------------------------------------------
// p5.js lifecycle
// ---------------------------------------------------------------------------
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.style("touch-action", "none"); // keep touch drawing from scrolling the page
  BOARD_Y = height/4;

  bgCol = color(BACKGROUND_COLOR);
  fgCol = color(DRAW_COLOR);
  let l1_y = 50
  let l2_y = 50
  let l3_y = 150

  for(let i=0;i<20;i++){
    L1_n.push([width/2.8,l1_y])
    l1_y += 42;
  }

  for(let i=0;i<20;i++){
    L2_n.push([width/1.8,l2_y])
    l2_y += 42;
  }

  for(let i=0;i<10;i++){
    L3_n.push([width/1.4,l3_y])
    l3_y += 60;
  }

  buildCellPositions();
  clearBoard();

  L1 = math.matrix(model.L1);
  b1 = math.matrix(model.b1);

  L2 = math.matrix(model.L2);
  b2 = math.matrix(model.b2);

  L3 = math.matrix(model.L3);
  b3 = math.matrix(model.b3);

 img = math.matrix(TT.image);

 mod_1 = new Model_1(model);

 //boardMatrix = math.reshape(img, [ROWS, COLS]);

}

function draw() {
  background(PAGE_COLOR);
  fill(255);
  mod_1.draw(getInputVector(),getCellPositions());

  push();
  textSize(20);
  textAlign(CENTER, CENTER);
  fill(255);
  text("Press c to clear the Board.",width/9,height/8);

  pop();

  push();
  textSize(15);
  textAlign(CENTER, CENTER);
  fill(255);
  let info = "Trained using NumPy (Python)\n" +
           "Parameters: 16,330\n" +
           "Test Accuracy: 92%\n" +
           "Epochs: 2,000\n" +
           "Loss Function: MSE\n" +
           "Optimizer: Gradient Descent (GD)";

  textLeading(25);
  text(info,width/9,height/1.25);

  pop();

  drawBoard();
  


  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function drawBoard() {
  if (GRID_LINE_COLOR) {
    stroke(GRID_LINE_COLOR);
    strokeWeight(1);
  } else {
    noStroke();
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const value = boardMatrix.get([r, c]);
      fill(lerpColor(bgCol, fgCol, value)); // 0 -> background, 1 -> draw color
      rect(BOARD_X + c * CELL_SIZE, BOARD_Y + r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

// ---------------------------------------------------------------------------
// Mouse / touch input
// ---------------------------------------------------------------------------
function mousePressed() {
  if (isInsideBoard(mouseX, mouseY)) {
    isDrawing = true;
    lastX = mouseX;
    lastY = mouseY;
    stampBrush(mouseX, mouseY); // a single click leaves a dot
  }
}

function mouseDragged() {
  if (!isDrawing) return;
  drawStroke(lastX, lastY, mouseX, mouseY);
  lastX = mouseX;
  lastY = mouseY;
  return false; // prevent default browser behavior while drawing
}

function mouseReleased() {
  isDrawing = false;
  lastX = lastY = null;
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

/** True if the pixel position (px, py) lies within the board area. */
function isInsideBoard(px, py) {
  return (
    px >= BOARD_X && px < BOARD_X + COLS * CELL_SIZE &&
    py >= BOARD_Y && py < BOARD_Y + ROWS * CELL_SIZE
  );
}

/**
 * Stamp the brush along the line between two mouse positions so fast
 * movements don't leave gaps between cells.
 */
function drawStroke(x0, y0, x1, y1) {
  const distPx = dist(x0, y0, x1, y1);
  const steps = max(1, ceil(distPx / (BRUSH_STEP * CELL_SIZE)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    stampBrush(lerp(x0, x1, t), lerp(y0, y1, t));
  }
}

/**
 * Apply a soft circular brush centered at pixel position (px, py).
 * Intensity falls off smoothly from 1 at the center to 0 at the brush radius.
 * Cells only ever get brighter while drawing (max with existing value).
 * Cells outside the board are ignored.
 */
function stampBrush(px, py) {
  // Convert pixel position to continuous grid coordinates (in cell units)
  const gx = (px - BOARD_X) / CELL_SIZE;
  const gy = (py - BOARD_Y) / CELL_SIZE;

  const rMin = max(0, floor(gy - BRUSH_SIZE));
  const rMax = min(ROWS - 1, ceil(gy + BRUSH_SIZE));
  const cMin = max(0, floor(gx - BRUSH_SIZE));
  const cMax = min(COLS - 1, ceil(gx + BRUSH_SIZE));

  for (let r = rMin; r <= rMax; r++) {
    for (let c = cMin; c <= cMax; c++) {
      // Distance from the cell center to the brush center (cell units)
      const d = dist(c + 0.5, r + 0.5, gx, gy);
      if (d > BRUSH_SIZE) continue;

      const ratio = d / BRUSH_SIZE;
      const intensity = 1 - ratio * ratio; // smooth falloff, 0..1
      const current = boardMatrix.get([r, c]);
      if (intensity > current) {
        boardMatrix.set([r, c], constrain(intensity, 0, 1));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public utility functions (callable from other scripts)
// ---------------------------------------------------------------------------

/** Erase the drawing and reset every matrix element to 0. */
function clearBoard() {
  boardMatrix = math.zeros(ROWS, COLS);
}

/**
 * Return the current 28 x 28 matrix as a plain nested JavaScript array
 * (a copy, so callers can't accidentally modify the board).
 * Values are normalized: 0 = black, 1 = white.
 */
function getMatrix() {
  return boardMatrix.toArray();
}

/** Return the underlying Math.js matrix (a clone) for further matrix operations. */
function getMathMatrix() {
  return boardMatrix.clone();
}

/**
 * Return the 784 normalized values as a flat array in row-major order
 * (row 0 left-to-right, then row 1, ...), ready for a neural network input.
 */
function getInputVector() {
  return math.reshape(math.flatten(boardMatrix), [784, 1]);
}

/**
 * Build the array of all 784 cell positions (row-major order).
 * Entry i corresponds to element i of getInputVector(), where i = row * COLS + col.
 */
function buildCellPositions() {
  cellPositions = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = BOARD_X + c * CELL_SIZE;
      const y = BOARD_Y + r * CELL_SIZE;
      cellPositions.push({
        index: r * COLS + c,           // position in the flattened vector
        row: r,
        col: c,
        x: x,                          // top-left corner of the cell (canvas px)
        y: y,
        centerX: x + CELL_SIZE / 2,    // center of the cell (canvas px)
        centerY: y + CELL_SIZE / 2,
      });
    }
  }
}

/**
 * Return an array of 784 objects, one per cell, in row-major order:
 * { index, row, col, x, y, centerX, centerY }
 * (a copy, so callers can't modify the internal data).
 */
function getCellPositions() {
  return cellPositions.map((cell) => ({ ...cell }));
}

// Press "c" to clear the board from the keyboard.
function keyPressed() {
  if (key === "c" || key === "C") clearBoard();
}