let model1, model2, model3, model4,model5;
let mods, active = 0;
let bg_img, bg_img_index = 0;
let img_1, img_2, img_3, img_4, img_5;
let default_font, arabic_font, farsi_font;

let board1,board2,board3;
let show_shadow = true;
let show_lines = true;

const DESIGN_W = 1600;
const DESIGN_H = 900;
let S = 1, OX = 0, OY = 0;

function preload() {
  model1 = loadJSON("models/model_1/mnist_model_1.json");
  model2 = loadJSON("models/model_2/mnist_model_2.json");
  model3 = loadJSON("models/model_3/mnist_model_3.json");
  model4 = loadJSON("models/model_4/mnist_model_4.json");
  model5 = loadJSON("models/model_5/mnist_model_5.json");

  default_font = loadFont("fonts/Roboto-Regular.ttf");
  arabic_font = loadFont("fonts/NotoNaskhArabic-Regular.ttf");
  farsi_font = loadFont("fonts/Parastoo-Regular.ttf");

  img_1 = loadImage('assets/img_1.jpg');
  img_2 = loadImage('assets/img_2.jpg');
  img_3 = loadImage('assets/img_3.jpg');
  img_4 = loadImage('assets/img_4.jpg');
  img_5 = loadImage('assets/img_5.jpg');
}

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
  pixelDensity(window.devicePixelRatio || 1);
  computeScale();
  textFont(default_font);

  // other options (rows, cols, cellSize, brushSize, colors...) use class defaults
  let bSz = 2;
  let bSp = 2;
  board1 = new DrawingBoard({ x: 1, y: 240 });
  board2 = new DrawingBoard({ x: 50, y: 100, cellSize: 10,brushSize:bSz,brushStep:bSp});
  board3 = new DrawingBoard({ x: 50, y: 500, cellSize: 10,brushSize:bSz,brushStep:bSp});

  bg_img = [img_4, img_5, img_1, img_2, img_3, "#222222", 0];
  mods = [new Model_1(model1), new Model_2(model2), new Model_3(model3), new Model_4(model4),new Model_5(model5)];

  hideLoadingScreen();
}

function draw() {
  background(bg_img[bg_img_index]);
  push();
  translate(OX, OY);
  scale(S);

  if(active === 4){
    mods[active].draw(board2.getInputVector(),board3.getInputVector(), board2.getCellPositions(), board3.getCellPositions(), show_shadow, show_lines);
    board2.draw();
    board3.draw();

  }else{
    mods[active].draw(board1.getInputVector(), board1.getCellPositions(), show_shadow, show_lines);
    board1.draw();
  }
  

  push();
  textSize(15); fill(255); textLeading(40);
  text("Press C to clear the board1.\t\t||\t\tPress 1 to 5 to change Model.\t\t||\t\tPress F to change Background.\t\t||\t\tPress S to turn off / on shadows.\t\t||\t\tPress L to turn off / on network lines.", 0, 20);
  pop();

  pop();
}

function mousePressed()  { 
  if(active===4){
    board2.mousePressed(mx(), my()); 
    board3.mousePressed(mx(), my());
  }else{
    board1.mousePressed(mx(), my()); 
  }
}

function mouseDragged()  { 
  if(active===4){
    board2.mouseDragged(mx(), my()); 
    board3.mouseDragged(mx(), my()); 
  }else{
    board1.mouseDragged(mx(), my()); 
  }
  
  return false;
}

function mouseReleased() { 
  if(active===4){
    board2.mouseReleased(); 
    board3.mouseReleased(); 
  }else{
    board1.mouseReleased(); 
  }
  
}

function keyPressed() {
  const k = key.toLowerCase();
  if (k === "c"){
    board1.clear(); board2.clear(); ; board3.clear();
  }
  if (k === "s") show_shadow = !show_shadow;
  if (k === "l") show_lines = !show_lines;
  if (k === "f") bg_img_index = (bg_img_index + 1) % bg_img.length;
  if ("12345".includes(k) && k !== "") active = int(k) - 1;
}
