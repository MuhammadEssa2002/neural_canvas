class DrawingBoard {
  constructor({ x = 0, y = 0, size = 280, brush = 20, radius = 20, label = "" } = {}) {
    this.x = x;               // top-left, design coordinates
    this.y = y;
    this.size = size;         // on-screen size; internal buffer is always 280x280
    this.brush = brush;       // brush diameter in internal (280) pixels
    this.radius = radius;     // corner radius in internal pixels
    this.label = label;

    this.RES = 280;
    this.MODEL = 28;
    this.TARGET = 20;
    this.cellSize = size / this.MODEL;   // size of one of the 28x28 input cells on screen

    // pixelDensity(1) so pixel reads are 1:1 even when the sketch uses devicePixelRatio
    this.pg = createGraphics(this.RES, this.RES);
    this.pg.pixelDensity(1);
    this.small = createGraphics(this.MODEL, this.MODEL);
    this.small.pixelDensity(1);

    this.drawing = false;
    this.last = null;
    this._vec = new Array(this.MODEL * this.MODEL).fill(0);
    this._dirty = false;
    this._mat = null;
    this._cells = this._buildCells();
    this.clear();
  }

  // ---------- pointer handling ----------

  contains(mx, my) {
    return mx >= this.x && mx <= this.x + this.size && my >= this.y && my <= this.y + this.size;
  }

  _toLocal(mx, my) {
    const k = this.RES / this.size;
    return { x: (mx - this.x) * k, y: (my - this.y) * k };
  }

  mousePressed(mx, my) {
    if (!this.contains(mx, my)) return false;
    this.drawing = true;
    this.last = this._toLocal(mx, my);
    this.pg.noStroke();
    this.pg.fill(255);
    this.pg.circle(this.last.x, this.last.y, this.brush);
    this._dirty = true;
    return true;
  }

  mouseDragged(mx, my) {
    if (!this.drawing) return false;
    const p = this._toLocal(mx, my);
    this.pg.stroke(255);
    this.pg.strokeWeight(this.brush);
    this.pg.strokeCap(ROUND);
    this.pg.line(this.last.x, this.last.y, p.x, p.y);
    this.last = p;
    this._dirty = true;
    return true;
  }

  mouseReleased() {
    this.drawing = false;
    this.last = null;
  }

  clear() {
    this.pg.background(0);
    this.small.background(0);
    this._vec.fill(0);
    this._mat = null;
    this._dirty = false;
    this.drawing = false;
    this.last = null;
  }

  isEmpty() {
    this.pg.loadPixels();
    const px = this.pg.pixels;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i] > 30 || px[i + 1] > 30 || px[i + 2] > 30) return false;
    }
    return true;
  }

  // ---------- model input ----------

  // math.js column matrix (784 x 1) with values in [0, 1], row-major pixel order.
  // It is rebuilt only when the drawing changes, so calling it every frame is cheap.
  getInputVector() {
    if (this._dirty) {
      this._process();
      this._dirty = false;
      this._mat = null;
    }
    if (!this._mat) this._mat = math.matrix(this._vec.map((v) => [v]));
    return this._mat;
  }

  // Same values as a plain flat array of 784 numbers.
  getInputArray() {
    this.getInputVector();
    return this._vec;
  }

  // Centers of the 28x28 input cells in design coordinates, in the same order as the vector.
  // Each entry is {x, y}.
  getCellPositions() {
    return this._cells;
  }

  _buildCells() {
    const cells = [];
    for (let r = 0; r < this.MODEL; r++) {
      for (let c = 0; c < this.MODEL; c++) {
        cells.push({ x: this.x + (c + 0.5) * this.cellSize, y: this.y + (r + 0.5) * this.cellSize });
      }
    }
    return cells;
  }

  _process() {
    const R = this.RES, M = this.MODEL;
    this.pg.loadPixels();
    const px = this.pg.pixels;

    let minX = R, maxX = 0, minY = R, maxY = 0, has = false;
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < R; x++) {
        const i = (y * R + x) * 4;
        if (px[i] > 30 || px[i + 1] > 30 || px[i + 2] > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          has = true;
        }
      }
    }

    this.small.background(0);
    if (has) {
      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;
      const s = this.TARGET / Math.max(cw, ch);
      const sw = cw * s, sh = ch * s;
      this.small.image(this.pg, (M - sw) / 2, (M - sh) / 2, sw, sh, minX, minY, cw, ch);
    }

    this.small.loadPixels();
    const sp = this.small.pixels;
    let total = 0;
    for (let i = 0; i < sp.length; i += 4) total += sp[i];
    if (total / (M * M * 255) > 0.5) {
      for (let i = 0; i < sp.length; i += 4) {
        const v = 255 - sp[i];
        sp[i] = sp[i + 1] = sp[i + 2] = v;
      }
      this.small.updatePixels();
    }

    for (let i = 0; i < M * M; i++) this._vec[i] = sp[i * 4] / 255;
  }

  // ---------- rendering ----------

  draw() {
    push();
    const ctx = drawingContext;
    const r = this.radius * (this.size / this.RES);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.size, this.size, r);
    ctx.clip();
    image(this.pg, this.x, this.y, this.size, this.size);
    ctx.restore();

    noFill();
    stroke(48);
    strokeWeight(1);
    rect(this.x, this.y, this.size, this.size, r);

    if (this.label) {
      noStroke();
      fill(255);
      textAlign(CENTER, BOTTOM);
      textSize(16);
      text(this.label, this.x + this.size / 2, this.y - 8);
    }
    pop();
  }

  // Optional: the 28x28 image the model actually receives.
  drawPreview(px, py, size = 84) {
    this.getInputArray();
    push();
    noSmooth();
    image(this.small, px, py, size, size);
    pop();
  }
}