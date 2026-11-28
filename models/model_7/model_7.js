class Model_7 {
    constructor(para) {
        this.Z1 = null;
        this.C1 = null;
        this.A1 = null;
        this.Z2 = null;
        this.A2 = null;
        this.Z3 = null;
        this.A3 = null;
        this.Z4 = null;
        this.raw = null;
        this.probs = null;

        this.labels = ["apple","eye","cell phone","hat","face","moon","sun","cup","ice cream","pencil","ear","book","lollipop","leaf","t-shirt","car","palm tree","tree","line","mountain"];

        this.K1 = math.matrix(para.K1);
        this.c1 = math.matrix(para.b1);

        this.K2 = math.matrix(para.K2)
        this.c2 = math.matrix(para.b2)

        this.L2 = math.matrix(para.L3);
        this.b2 = math.matrix(para.b3);

        this.L3 = math.matrix(para.L4);
        this.b3 = math.matrix(para.b4);

        this.L4 = math.matrix(para.L5);
        this.b4 = math.matrix(para.b5);

        this.L1_n = [];
		this.L2_n = [];
		this.L3_n = [];
		this.ang = 120;
		this.r = 20;

		this.dot_pos = 6;
		this.dot_num = 3;

		let y1 = 200, y2 = 200, y3 = 170;
		for (let i = 0; i < 15; i++) {this.L1_n.push([900,  y1]);y1 += 40;}

		for (let i = 0; i < 15; i++) {this.L2_n.push([1050,  y2]);y2 += 40;}

		for (let i = 0; i < 20; i++) { this.L3_n.push([1200, y3]); y3 += 33;}

        // Which of the 8 filters to display
        this.filter = 0;
        this.featureBoards = [];

        this.featureBoards = [];  // conv output, before ReLU   (26x26)
		this.featureBoards2 = [];    // after ReLU                 (26x26)
		this.poolBoards = [];     // after max pooling          (13x13)

		let Y = 160;
		for (let i = 0; i < 16; i++) {
		    this.featureBoards.push(new MatrixBoard({
		        x: 500, y: Y, rows: 26, cols: 26, cellSize: 1.5,
		        gridLineColor: null, enabled: false
		    }));
		    Y += 40;
		}

		Y = 160;
		for (let i = 0; i < 16; i++) {
			let X = 670
			for(let j=0;j<2;j++){
				this.featureBoards2.push(new MatrixBoard({
			        x: X, y: Y, rows: 11, cols: 11, cellSize: 3.2,
			        gridLineColor: null, enabled: false
			    }));
				X += 60;
			}
		    Y += 40;
		}

    }

    draw(X1, cell_pos, show_shadow, show_lines, show_labels) {

        const x = math.reshape(math.flatten(X1), [28, 28]).toArray
            ? math.reshape(math.flatten(X1), [28, 28]).toArray()
            : math.reshape(math.flatten(X1), [28, 28]);

        // Conv block: (28,28) -> (26,26,8) -> (13,13,8) 
        this.conv1 = this.conv2d(x, this.K1, this.c1);
        this.convrelu1 = math.map(this.conv1, x => Math.max(0, x));
        this.pool1 = this.maxPool(this.convrelu1);

        this.conv2 = this.conv2d(this.pool1, this.K2, this.c2);
        this.convrelu2 = math.map(this.conv2, x => Math.max(0, x));
        this.A1 = this.maxPool(this.convrelu2);

        // Dense block
        const a1 = this.flatten(this.A1);

        this.Z2 = math.add(
		  math.multiply(this.L2, a1),
		  this.b2
		  );

        this.A2 = math.map(this.Z2, x => Math.max(0, x));
        this.A2_data = this.A2.toArray();

        this.Z3 = this.Z3 = math.add(
		  math.multiply(this.L3, this.A2),
		  this.b3
		  );

        this.A3 = math.map(this.Z3, x => Math.max(0, x));
        this.A3_data = this.A3.toArray();

        this.Z4 = math.add(
		  math.multiply(this.L4, this.A3),
		  this.b4
		  );

        this.A4 = this.softmax(math.flatten(this.Z4));
        this.A4_data = this.A4.toArray();


        const rawX = this.raw ? math.reshape(this.raw, [28, 28]) : x;
        const empty = rawX.every(row => row.every(v => v === 0));
        ///////////////////////////////////////////////////////////////////////////////////////////////
		if (empty) {
		    for (let i = 0; i < 16; i++) {
		        for (const board of [this.featureBoards[i]]) {
		            board.clear();
		            board.draw();
		        }
		    }
		    for (let i = 0; i < 32; i++) {
		        for (const board of [this.featureBoards2[i]]) {
		            board.clear();
		            board.draw();
		        }
		    }
		} else {
		    const rawconv1 = this.conv2d(rawX, this.K1, this.c1);                // before ReLU
		    const rawconvrelu1 = math.map(rawconv1, x => Math.max(0, x));               // after ReLU
		    const rawpool1 = this.maxPool(rawconvrelu1);

		    const rawconv2 = this.conv2d(rawpool1, this.K2, this.c2);                // before ReLU
		    const rawconvrelu2 = math.map(rawconv2, x => Math.max(0, x));               // after ReLU
		    const rawpool2 = this.maxPool(rawconvrelu2);

		    for (let i = 0; i < 16; i++) {
		        this.showMap(this.featureBoards[i], rawconvrelu1, i);
		    }

		    for (let i = 0; i < 32; i++) {
		        this.showMap(this.featureBoards2[i],rawconvrelu2, i);
		    }
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////

		push();
		if(show_labels){
			noFill();
			stroke("#D3DAD9");
			strokeWeight(2);
			rect(850,145,260,700,20,0,20,0);
			rect(450,145,150,700,0,20,0,20);
			rect(650,145,150,700,0,20,0,20);
		}

		if(show_shadow){
				drawingContext.shadowBlur = 10;
				drawingContext.shadowColor = color(10);
				drawingContext.shadowOffsetX = this.r*sin(this.ang);
				drawingContext.shadowOffsetY = this.r*cos(this.ang);
			}
		
		stroke(255);
  		strokeWeight(0.1);

		push();
		fill("#09154050");
		rect(this.L1_n[0][0]-70/2,150,70,640,20,20,20,20);
		pop();

		push();
		fill("#21183250");
		rect(this.L2_n[0][0]-70/2,150,70,640,20,20,20,20);
		pop();

		pop();
		if(!empty && show_lines){
			push();
			for(let i=0;i<this.L2_n.length;i++){
			  for(let j=0;j<this.L1_n.length;j++){
			    let c2 = map(this.A3_data[i][0],0,0.8,0,1);
			    stroke(255, 209, 209,c2*255);
			    strokeWeight(1);
			    line(this.L1_n[j][0],this.L1_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);
			  }
			}
			pop();

			push();
			for(let i=0;i<this.L2_n.length;i++){
			  for(let j=0;j<this.L3_n.length;j++){
			    let c3 = map(this.A4_data[j],0,0.8,0,1);
			    stroke(226, 62, 87,c3*255);
			    strokeWeight(1);
			    line(this.L3_n[j][0],this.L3_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);
			  }
			}
			pop();
		}

		push();

		if(show_shadow){
				drawingContext.shadowBlur = 10;
				drawingContext.shadowColor = color(10);
				drawingContext.shadowOffsetX = this.r*sin(this.ang);
				drawingContext.shadowOffsetY = this.r*cos(this.ang);
			}

		push();
		for(let i=0;i<this.L1_n.length;i++){
			if((i>=this.dot_pos) && i<=(this.dot_pos+this.dot_num-1)){
				stroke(100,100,255);
				strokeWeight(1);
				fill(0);
				circle(this.L1_n[i][0],this.L1_n[i][1],10)
			}else{
				rectMode(CENTER,CENTER);
				let c1 = map(this.A2_data[i],0,12,0,1);
				stroke(100,100,255);
				strokeWeight(1);
				fill(c1*100,c1*100,c1*255);
				rect(this.L1_n[i][0],this.L1_n[i][1],40,30,20,0,20,0);

				push();
				textSize(10);
				textAlign(CENTER, CENTER);
				fill(255);
				text(this.A2_data[i][0].toFixed(3),this.L1_n[i][0],this.L1_n[i][1]);
				pop();
			}
		}
		pop();

		push();
		for(let i=0;i<this.L2_n.length;i++){
		  	if((i>=this.dot_pos) && i<=(this.dot_pos+this.dot_num-1)){
				stroke(255,209,209);
				strokeWeight(1);
				fill(0);
				circle(this.L2_n[i][0],this.L2_n[i][1],10)
			}else{
				rectMode(CENTER,CENTER);
				let colo = map(this.A3_data[i][0],0,18,0,1);
				stroke(255,209,209);
				strokeWeight(1);
				fill(colo*255,colo*209,colo*209);
				rect(this.L2_n[i][0],this.L2_n[i][1],40,30,0,20,0,20);

				push();
				textSize(10);
				textAlign(CENTER, CENTER);
				fill(255);
				text(this.A3_data[i][0].toFixed(3),this.L2_n[i][0],this.L2_n[i][1]);
				pop();
			}
		}
		pop();

		push();
		for(let i=0;i<this.L3_n.length;i++){
		  rectMode(CENTER,CENTER);
		  let colo = map(this.A4_data[i],0,1,0,1);
		  stroke(255,62,87);
		  strokeWeight(1);
		  fill(colo*255,colo*62,colo*87);
		  rect(this.L3_n[i][0],this.L3_n[i][1],60,22,0,20,20,20);

		  push();
		  textSize(15);
		  textAlign(CENTER, CENTER);
		  fill(255);
		  text(this.A4_data[i].toFixed(3),this.L3_n[i][0],this.L3_n[i][1]);
		  pop();
		}
		pop();

		pop();


		push()
		rectMode(CENTER,CENTER);
		if(show_shadow){
			drawingContext.shadowBlur = 10;
			drawingContext.shadowColor = color(10);
			drawingContext.shadowOffsetX = this.r*sin(this.ang);
			drawingContext.shadowOffsetY = this.r*cos(this.ang);
		}
  		fill("#21212190");
  		stroke(255);
  		strokeWeight(0.1);
  		rect(1370,440,230,60,20,0,20,20);
  		if(!empty){
		    fill("#D3DAD9");
		    textSize(50);
		    //stroke(252, 173, 56);
  			//strokeWeight(5);
  			noStroke();
		    textAlign(CENTER, CENTER);
		    text(this.labels[this.predict()],1370,430);
		}
	    pop();

	    if(show_labels){
			push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("Fully Connected Layer",(2*850+260)/2,130);
		    pop();

		    push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("1st Convolutional Layer",(2*450+150)/2,130);
		    pop();

		    push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("16 Filters",(2*450+150)/2,830);
		    pop();

		    push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("2nd Convolutional Layer",(2*650+150)/2,130);
		    pop();

		    push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("32 Filters",(2*650+150)/2,830);
		    pop();

		    push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("60 Neurons",(2*this.L1_n[0][0])/2,820);
		    pop();

		    push();
		    textSize(15);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("40 Neurons",(2*this.L2_n[0][0])/2,820);
		    pop();

		    push();
		    textSize(20);
		    fill("#D3DAD9");
			textAlign(CENTER, CENTER);
			text("Prediction",(2*1370)/2,500);
		    pop();

		    push();
			let info = "Trained using JAX (Python)\n" +
			             "Parameters: 56,120\n" +
			             "Test Accuracy: 91%\n" +
			             "Epochs: 30\n" +
			             "Loss Function: Cross-Entropy\n" +
			             "Optimizer: Mini-Batch Adam.";

			textSize(15); textAlign(CENTER, CENTER); fill(255); textLeading(25);
			text(info, 260, 690);
			pop();

			push();
			textSize(20); textAlign(CENTER, CENTER); fill("#D3DAD9"); textLeading(18);
			text("Quick Draw!\n20 classes classification\nDraw an Apple", 270, 180);
			textLeading(30);
			pop();
		}

        
    }

    // Slice channel f from A, normalize it, and draw it on the given board
	showMap(board, A, f, signed = false) {
	    board.setMatrix(this.featureMap(A, f, signed));
	    board.draw();
	}

    // ---------- feature map display ----------

    // Pick one channel from [H][W][F] and scale it to 0..1 for the board
    featureMap(A, f, signed = false) {
	    const m = A.map(row => row.map(pix => pix[f]));

	    if (signed) {
	        let maxAbs = 0;
	        for (const row of m) for (const v of row) maxAbs = Math.max(maxAbs, Math.abs(v));
	        return maxAbs > 0
	            ? m.map(row => row.map(v => 0.5 + v / (2 * maxAbs)))
	            : m.map(row => row.map(() => 0.5));
	    }

	    let max = 0;
	    for (const row of m) for (const v of row) max = Math.max(max, v);
	    return max > 0 ? m.map(row => row.map(v => v / max)) : m;
	}

    // ---------- layers ----------

    // VALID convolution, stride 1.
    // x: [H][W] (1 channel) or [H][W][Cin];  K: [kh][kw][Cin][F];  b: [F]
    conv2d(x, K, b) {
        const k = K.toArray();
        const bias = math.flatten(b).toArray();
        const kh = k.length, kw = k[0].length, Cin = k[0][0].length, F = bias.length;
        const multi = Array.isArray(x[0][0]);      // true when x is [H][W][C]
        const H = x.length - kh + 1;
        const W = x[0].length - kw + 1;

        const out = [];
        for (let i = 0; i < H; i++) {
            const row = [];
            for (let j = 0; j < W; j++) {
                const pix = new Array(F);
                for (let f = 0; f < F; f++) {
                    let s = bias[f];
                    for (let di = 0; di < kh; di++)
                        for (let dj = 0; dj < kw; dj++)
                            for (let c = 0; c < Cin; c++) {
                                const v = multi ? x[i + di][j + dj][c] : x[i + di][j + dj];
                                s += v * k[di][dj][c][f];
                            }
                    pix[f] = s;
                }
                row.push(pix);
            }
            out.push(row);
        }
        return out;
    }

    maxPool(a, size = 2) {
        const H = Math.floor(a.length / size);
        const W = Math.floor(a[0].length / size);
        const F = a[0][0].length;

        const out = [];
        for (let i = 0; i < H; i++) {
            const row = [];
            for (let j = 0; j < W; j++) {
                const pix = new Array(F);
                for (let f = 0; f < F; f++) {
                    let m = -Infinity;
                    for (let di = 0; di < size; di++)
                        for (let dj = 0; dj < size; dj++)
                            m = Math.max(m, a[i * size + di][j * size + dj][f]);
                    pix[f] = m;
                }
                row.push(pix);
            }
            out.push(row);
        }
        return out; 
    }

    // [H][W][C] -> column vector (H*W*C, 1) in NHWC order
    flatten(a) {
        const flat = [];
        for (const row of a)
            for (const pix of row)
                for (const v of pix) flat.push(v);
        return math.reshape(math.matrix(flat), [flat.length, 1]);
    }

    softmax(z) {
        const maxZ = math.max(z);
        const expZ = math.map(math.subtract(z, maxZ), v => Math.exp(v));
        return math.divide(expZ, math.sum(expZ));
    }

    predict() {
	    const p = math.flatten(this.A4_data).valueOf ? math.flatten(this.A4_data).valueOf() : this.A4_data.flat();
	    let best = -1, bestVal = -Infinity;
	    for (let i = 0; i < p.length; i++) {
	        const v = Number(p[i]);
	        if (v > bestVal) { bestVal = v; best = i; }
	    }
	    return best;   // still -1 only if every value is NaN
	}
}
