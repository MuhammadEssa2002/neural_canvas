/**
 * drawingboard.js
 *
 * A reusable drawing-board class (p5.js + math.js).
 * Create as many boards as you like, each with its own position, size,
 * colors, brush settings and its own pixel matrix.
 *
 * Requires: p5.js and math.js to be loaded before this file.
 *
 * Example:
 *   board1 = new DrawingBoard({ x: 1,   y: 240 });
 *   board2 = new DrawingBoard({ x: 500, y: 240, cellSize: 12 });
 */
class DrawingBoard {
  /**
   * @param {Object} options
   * @param {number} [options.x=0]                 x of the board's top-left corner (design coords)
   * @param {number} [options.y=0]                 y of the board's top-left corner (design coords)
   * @param {number} [options.rows=28]             number of rows
   * @param {number} [options.cols=28]             number of columns
   * @param {number} [options.cellSize=15]         width/height of each cell (px)
   * @param {number} [options.brushSize=2]         brush radius in cells
   * @param {number} [options.brushStep=0.01]      stroke sampling distance in cells
   * @param {string} [options.backgroundColor="#000000"]  empty cell color
   * @param {string} [options.drawColor="#ffffff"]        fully-drawn cell color
   * @param {string|null} [options.gridLineColor="rgba(255, 255, 255, 0.08)"] grid line color (null = no lines)
   * @param {string} [options.label=""]            optional label drawn above the board
   * @param {boolean} [options.enabled=true]       if false, board ignores input
   */
  constructor(options = {}) {
    const o = options;

    // Layout
    this.x = o.x ?? 0;
    this.y = o.y ?? 0;
    this.rows = o.rows ?? 28;
    this.cols = o.cols ?? 28;
    this.cellSize = o.cellSize ?? 15;

    // Brush
    this.brushSize = o.brushSize ?? 2;
    this.brushStep = o.brushStep ?? 0.01;

    // Appearance
    this.backgroundColor = o.backgroundColor ?? "#000000";
    this.drawColor = o.drawColor ?? "#ffffff";
    this.gridLineColor = o.gridLineColor === undefined ? "rgba(255, 255, 255, 0.08)" : o.gridLineColor;
    this.label = o.label ?? "";
    this.enabled = o.enabled ?? true;

    // State
    this.matrix = null;        // math.js matrix (rows x cols)
    this.isDrawing = false;
    this.lastX = null;
    this.lastY = null;
    this.cellPositions = [];

    // p5 colors (p5's color() must be called after the canvas exists,
    // so create the board inside setup() or later)
    this.bgCol = color(this.backgroundColor);
    this.fgCol = color(this.drawColor);

    this.buildCellPositions();
    this.clear();
  }

  // -------------------------------------------------------------------------
  // Configuration setters (each keeps internal data consistent)
  // -------------------------------------------------------------------------
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.buildCellPositions();
  }

  setCellSize(size) {
    this.cellSize = size;
    this.buildCellPositions();
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  setColors(backgroundColor, drawColor) {
    if (backgroundColor !== undefined) {
      this.backgroundColor = backgroundColor;
      this.bgCol = color(backgroundColor);
    }
    if (drawColor !== undefined) {
      this.drawColor = drawColor;
      this.fgCol = color(drawColor);
    }
  }

  /** Change grid dimensions (this clears the board). */
  setGridSize(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.buildCellPositions();
    this.clear();
  }

  get width() {
    return this.cols * this.cellSize;
  }

  get height() {
    return this.rows * this.cellSize;
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  draw() {
    push();

    if (this.gridLineColor) {
      stroke(this.gridLineColor);
      strokeWeight(1);
    } else {
      noStroke();
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const value = this.matrix.get([r, c]);
        fill(lerpColor(this.bgCol, this.fgCol, value));
        rect(this.x + c * this.cellSize, this.y + r * this.cellSize, this.cellSize, this.cellSize);
      }
    }

    if (this.label) {
      noStroke();
      fill(255);
      textSize(16);
      textAlign(LEFT, BOTTOM);
      text(this.label, this.x, this.y - 8);
    }

    pop();
  }

  // -------------------------------------------------------------------------
  // Input handling
  // Pass in coordinates in the same space the board is drawn in
  // (i.e. your design coordinates: mx(), my() in sketch.js).
  // -------------------------------------------------------------------------
  mousePressed(px, py) {
    if (!this.enabled) return false;
    if (this.contains(px, py)) {
      this.isDrawing = true;
      this.lastX = px;
      this.lastY = py;
      this.stampBrush(px, py);
      return true;
    }
    return false;
  }

  mouseDragged(px, py) {
    if (!this.enabled || !this.isDrawing) return false;
    this.drawStroke(this.lastX, this.lastY, px, py);
    this.lastX = px;
    this.lastY = py;
    return true;
  }

  mouseReleased() {
    this.isDrawing = false;
    this.lastX = this.lastY = null;
  }

  // -------------------------------------------------------------------------
  // Drawing helpers
  // -------------------------------------------------------------------------
  contains(px, py) {
    return (
      px >= this.x && px < this.x + this.width &&
      py >= this.y && py < this.y + this.height
    );
  }

  drawStroke(x0, y0, x1, y1) {
    const distPx = dist(x0, y0, x1, y1);
    const steps = max(1, ceil(distPx / (this.brushStep * this.cellSize)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.stampBrush(lerp(x0, x1, t), lerp(y0, y1, t));
    }
  }

  stampBrush(px, py) {
    const gx = (px - this.x) / this.cellSize;
    const gy = (py - this.y) / this.cellSize;

    const rMin = max(0, floor(gy - this.brushSize));
    const rMax = min(this.rows - 1, ceil(gy + this.brushSize));
    const cMin = max(0, floor(gx - this.brushSize));
    const cMax = min(this.cols - 1, ceil(gx + this.brushSize));

    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const d = dist(c + 0.5, r + 0.5, gx, gy);
        if (d > this.brushSize) continue;

        const ratio = d / this.brushSize;
        const intensity = 1 - ratio * ratio;
        const current = this.matrix.get([r, c]);
        if (intensity > current) {
          this.matrix.set([r, c], constrain(intensity, 0, 1));
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Public utilities
  // -------------------------------------------------------------------------
  clear() {
    this.matrix = math.zeros(this.rows, this.cols);
  }

  /** Plain JS 2D array (rows x cols). */
  getMatrix() {
    return this.matrix.toArray();
  }

  /** Cloned math.js matrix (rows x cols). */
  getMathMatrix() {
    return this.matrix.clone();
  }

  /** Column vector (rows*cols x 1), e.g. [784, 1] for a 28x28 board. */
  getInputVector() {
    return math.reshape(math.flatten(this.matrix), [this.rows * this.cols, 1]);
  }

  /** Load values into the board from a 2D array (rows x cols) of 0..1 values. */
  setMatrix(array2d) {
    this.matrix = math.matrix(array2d);
  }

  buildCellPositions() {
    this.cellPositions = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cx = this.x + c * this.cellSize;
        const cy = this.y + r * this.cellSize;
        this.cellPositions.push({
          index: r * this.cols + c,
          row: r,
          col: c,
          x: cx,
          y: cy,
          centerX: cx + this.cellSize / 2,
          centerY: cy + this.cellSize / 2,
        });
      }
    }
  }

  getCellPositions() {
    return this.cellPositions.map((cell) => ({ ...cell }));
  }
}
