
let mod_1;
let model1;
let mod_1_flag;
let img_1;

let mod_2;
let model2;
let mod_2_flag;

function preload() {
  model1 = loadJSON("mnist_model_1.json");
  model2 = loadJSON("mnist_model_2.json");
  img_1 = loadImage('assets/img_1.jpg'); 
  img_2 = loadImage('assets/img_2.jpg'); 
}

let background_img;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const ROWS = 28;                     // number of rows
const COLS = 28;                     // number of columns
//const CELL_SIZE = 15;                // width and height of each square cell (px)
//let BOARD_X = 50;                    // x position of the board's top-left corner
//let BOARD_Y = 100;                   // y position of the board's top-left corner (dynamic)
const BRUSH_SIZE = 1.5;              // brush radius measured in cells
const BRUSH_STEP = 0.25;             // stroke sampling distance in cells
const BACKGROUND_COLOR = "#000000";  // background color
const DRAW_COLOR = "#ffffff";        // draw color
const PAGE_COLOR = "#222222";        // canvas color around the board
const GRID_LINE_COLOR = "rgba(255, 255, 255, 0.08)";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let boardMatrix;          // Math.js matrix (ROWS x COLS)
let isDrawing = false;    // true while drawing
let lastX = null;         
let lastY = null;
let bgCol, fgCol;         
let cellPositions = [];   

// ---------------------------------------------------------------------------
// p5.js lifecycle
// ---------------------------------------------------------------------------

const DESIGN_W = 1600;
const DESIGN_H = 900;
let S = 1, OX = 0, OY = 0;

const CELL_SIZE = 15;
const BOARD_X = 1;
const BOARD_Y = 240;

function computeScale() {
  S  = min(width / DESIGN_W, height / DESIGN_H);
  OX = (width  - DESIGN_W * S) / 2;
  OY = (height - DESIGN_H * S) / 2;
}

// mouse position in design coordinates
function mx() { return (mouseX - OX) / S; }
function my() { return (mouseY - OY) / S; }


function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.style("touch-action", "none");
  pixelDensity(window.devicePixelRatio || 1);   // sharp on Retina

  bgCol = color(BACKGROUND_COLOR);
  fgCol = color(DRAW_COLOR);
  computeScale();
  buildCellPositions();
  clearBoard();

  mod_1 = new Model_1(model1);
  mod_1_flag = true;
  background_img = img_1;

  mod_2 = new Model_2(model2);
  mod_2_flag = false;
}

function draw() {
  background(background_img);
  push();
  translate(OX, OY);
  scale(S);

  if(mod_1_flag){
    mod_1.draw(getInputVector(), getCellPositions());
    background_img = img_1;
  }

  if(mod_2_flag){
    mod_2.draw(getInputVector(), getCellPositions());
    background_img = img_2;
  }
  

  push();
  textSize(20); textAlign(CENTER, CENTER); fill(255);
  text("Press c to clear the Board.\n Press 1 or 2 to change Model.", 200, 110);
  pop();

  drawBoard();
}


/**
 * Centralized layout calculator to keep UI elements responsive
 */

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
      fill(lerpColor(bgCol, fgCol, value)); 
      rect(BOARD_X + c * CELL_SIZE, BOARD_Y + r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

// ---------------------------------------------------------------------------
// Mouse / touch input
// ---------------------------------------------------------------------------
function mousePressed() {
  if (isInsideBoard(mx(), my())) {
    isDrawing = true;
    lastX = mx(); lastY = my();
    stampBrush(lastX, lastY);
  }
}

function mouseDragged() {
  if (!isDrawing) return;
  drawStroke(lastX, lastY, mx(), my());
  lastX = mx(); lastY = my();
  return false;
}

function mouseReleased() {
  isDrawing = false;
  lastX = lastY = null;
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------
function isInsideBoard(px, py) {
  return (
    px >= BOARD_X && px < BOARD_X + COLS * CELL_SIZE &&
    py >= BOARD_Y && py < BOARD_Y + ROWS * CELL_SIZE
  );
}

function drawStroke(x0, y0, x1, y1) {
  const distPx = dist(x0, y0, x1, y1);
  const steps = max(1, ceil(distPx / (BRUSH_STEP * CELL_SIZE)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    stampBrush(lerp(x0, x1, t), lerp(y0, y1, t));
  }
}

function stampBrush(px, py) {
  const gx = (px - BOARD_X) / CELL_SIZE;
  const gy = (py - BOARD_Y) / CELL_SIZE;

  const rMin = max(0, floor(gy - BRUSH_SIZE));
  const rMax = min(ROWS - 1, ceil(gy + BRUSH_SIZE));
  const cMin = max(0, floor(gx - BRUSH_SIZE));
  const cMax = min(COLS - 1, ceil(gx + BRUSH_SIZE));

  for (let r = rMin; r <= rMax; r++) {
    for (let c = cMin; c <= cMax; c++) {
      const d = dist(c + 0.5, r + 0.5, gx, gy);
      if (d > BRUSH_SIZE) continue;

      const ratio = d / BRUSH_SIZE;
      const intensity = 1 - ratio * ratio; 
      const current = boardMatrix.get([r, c]);
      if (intensity > current) {
        boardMatrix.set([r, c], constrain(intensity, 0, 1));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public utility functions
// ---------------------------------------------------------------------------
function clearBoard() {
  boardMatrix = math.zeros(ROWS, COLS);
}

function getMatrix() {
  return boardMatrix.toArray();
}

function getMathMatrix() {
  return boardMatrix.clone();
}

function getInputVector() {
  return math.reshape(math.flatten(boardMatrix), [784, 1]);
}

function buildCellPositions() {
  cellPositions = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = BOARD_X + c * CELL_SIZE;
      const y = BOARD_Y + r * CELL_SIZE;
      cellPositions.push({
        index: r * COLS + c,
        row: r,
        col: c,
        x: x,
        y: y,
        centerX: x + CELL_SIZE / 2,
        centerY: y + CELL_SIZE / 2,
      });
    }
  }
}

function getCellPositions() {
  return cellPositions.map((cell) => ({ ...cell }));
}

function keyPressed() {
  if (key === "c" || key === "C") clearBoard();
  if (key === "2"){
    mod_2_flag = true;
    mod_1_flag = false;
  }

  if (key === "1"){
    mod_2_flag = false;
    mod_1_flag = true;
  }
}