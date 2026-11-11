class Model_2{
	constructor(para){
		this.Z1;
		this.A1;
		this.Z2;
		this.A2;
		this.Z3;

		this.L1 = math.matrix(para.L1);
		this.b1 = math.matrix(para.b1);

		this.L2 = math.matrix(para.L2);
		this.b2 = math.matrix(para.b2);

		this.L3 = math.matrix(para.L3);
		this.b3 = math.matrix(para.b3);

		this.L1_n = [];
		this.L2_n = [];
		this.L3_n = [];
		this.ang = 0;
		this.r = 20;

		this.dot_pos = 6;
		this.dot_num = 3;

	  let y1 = 200, y2 = 200, y3 = 150;
	  for (let i = 0; i < 15; i++) {this.L1_n.push([610,  y1]);y1 += 40;}

	  for (let i = 0; i < 15; i++) {this.L2_n.push([980,  y2]);y2 += 40;}

	  for (let i = 0; i < 10; i++) { this.L3_n.push([1340, y3]); y3 += 65;}

	}

	draw(X1,cell_pos,show_shadow,show_lines){

		let arr = math.flatten(X1).toArray();

		let boardMatrix_not_empty = !( arr.every(x => x === 0));

		this.Z1 = math.add(
		  math.multiply(this.L1, X1),
		  this.b1
		  );
		this.A1 = math.map(this.Z1, x => Math.max(0, x));
		this.A1_data = this.A1.toArray();


		this.Z2 = math.add(
		  math.multiply(this.L2, this.A1),
		  this.b2
		  );
		this.Z2_data = this.Z2.toArray();
		this.A2 = math.map(this.Z2, x => Math.max(0, x));
		this.A2_data = this.A2.toArray();

		this.Z3 = math.add(
		  math.multiply(this.L3, this.A2),
		  this.b3
		  );

		this.Z3_data = this.Z3.toArray();

		this.A3 = this.softmax(this.Z3);
		this.A3_data = this.A3.toArray();

		this.predictions = this.Z3_data.map(row => row[0]);

		this.highestIndex = this.predictions.indexOf(Math.max(...this.predictions));


		push();
		noFill();
		stroke(255);
		strokeWeight(2);
		rect(500,100,600,750,20,0,20,0);

		push();
		if(show_shadow){
			drawingContext.shadowBlur = 10;
			drawingContext.shadowColor = color(0);
			drawingContext.shadowOffsetX = this.r*sin(this.ang);
			drawingContext.shadowOffsetY = this.r*cos(this.ang);
		}
		fill(96, 193, 229,100);
		noStroke();
		rect(560,150,100,640,20,20,20,20);
		pop();

		push();
		if(show_shadow){
			drawingContext.shadowBlur = 10;
			drawingContext.shadowColor = color(0);
			drawingContext.shadowOffsetX = this.r*sin(this.ang);
			drawingContext.shadowOffsetY = this.r*cos(this.ang);
		}
		fill(255, 233, 169,100);
		noStroke();
		rect(930,150,100,640,20,20,20,20);
		pop();

		pop();

		if(boardMatrix_not_empty && show_lines){
			push();
			for(let j=0;j<this.L1_n.length;j++){
				for(let i=0;i<783;i += 15){
				  stroke(203, 241, 245,X1.toArray()[i][0]*255);
				  strokeWeight(0.6);
				  line(cell_pos[i]["centerX"],cell_pos[i]["centerY"],this.L1_n[j][0],this.L1_n[j][1]);
				}
			}
			pop();

			push();
			for(let i=0;i<this.L2_n.length;i++){
			  for(let j=0;j<this.L1_n.length;j++){
			    let c2 = map(this.A2_data[i][0],0,0.8,0,1);
			    stroke(255, 209, 209,c2*255);
			    strokeWeight(1);
			    line(this.L1_n[j][0],this.L1_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);
			  }
			}
			pop();

			push();
			for(let i=0;i<this.L2_n.length;i++){
			  for(let j=0;j<this.L3_n.length;j++){
			    let c3 = map(this.A3_data[j][0],0,0.8,0,1);
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
			drawingContext.shadowColor = color(0);
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
				let c1 = map(this.A1_data[i],0,3,0,1);
				stroke(100,100,255);
				strokeWeight(1);
				fill(c1*100,c1*100,c1*255);
				rect(this.L1_n[i][0],this.L1_n[i][1],40,30,20,0,20,0);

				push();
				textSize(10);
				textAlign(CENTER, CENTER);
				fill(255);
				text(this.A1_data[i][0].toFixed(3),this.L1_n[i][0],this.L1_n[i][1]);
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
				let colo = map(this.A2_data[i][0],0,5,0,1);
				stroke(255,209,209);
				strokeWeight(1);
				fill(colo*255,colo*209,colo*209);
				rect(this.L2_n[i][0],this.L2_n[i][1],40,30,0,20,0,20);

				push();
				textSize(10);
				textAlign(CENTER, CENTER);
				fill(255);
				text(this.A2_data[i][0].toFixed(3),this.L2_n[i][0],this.L2_n[i][1]);
				pop();
			}
		}
		pop();

		push();
		for(let i=0;i<this.L3_n.length;i++){
		  rectMode(CENTER,CENTER);
		  let colo = map(this.A3_data[i][0],0,1,0,1);
		  stroke(255,62,87);
		  strokeWeight(1);
		  fill(colo*255,colo*62,colo*87);
		  rect(this.L3_n[i][0],this.L3_n[i][1],60,30,0,20,20,20);

		  push();
		  textSize(15);
		  textAlign(CENTER, CENTER);
		  fill(255);
		  text(this.A3_data[i][0].toFixed(3),this.L3_n[i][0],this.L3_n[i][1]);
		  pop();
		}
		pop();

		pop();


		push()
		rectMode(CENTER,CENTER);
		if(show_shadow){
			drawingContext.shadowBlur = 10;
			drawingContext.shadowColor = color(0);
			drawingContext.shadowOffsetX = this.r*sin(this.ang);
			drawingContext.shadowOffsetY = this.r*cos(this.ang);
		}
  		fill(50);
  		stroke(252, 173, 56);
  		strokeWeight(2);
  		rect(1500,445,100,100,20,0,20,20);
  		if(boardMatrix_not_empty){
		    fill(255);
		    textSize(100);
		    stroke(252, 173, 56);
  			strokeWeight(5);
		    textAlign(CENTER, CENTER);
		    text(this.highestIndex,1500,430);
		}
	    pop();

	    push();
	    textSize(20);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("Hidden Layers",(2*500+600)/2,120);
	    pop();

	    push();
	    textSize(15);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("1st Hidden Layer \n 40 Neurons",(2*560+100)/2,820);
	    pop();

	    push();
	    textSize(15);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("2nd Hidden Layer \n 40 Neurons",(2*930+100)/2,820);
	    pop();

	    push();
	    textSize(20);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("Output Layer",1340,790);
	    pop();

	    push();
	    textSize(20);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("Prediction",1500,540);
	    pop();

	    push();
		fill(255);
		let info = "Trained using NumPy (Python)\n" +
		             "Parameters: 33,450\n" +
		             "Test Accuracy: 96%\n" +
		             "Epochs: 2,000\n" +
		             "Loss Function: Cross-Entropy\n" +
		             "Optimizer: Vanilla Gradient Descent (BGD)";

		textSize(15); textAlign(CENTER, CENTER); fill(255); textLeading(25);
		text(info, 200, 760);
		pop();



	    this.ang += 0.03

	


	}

	softmax(z) {
	    const maxZ = math.max(z);
	    const expZ = math.map(math.subtract(z, maxZ),exp);
	    const sumExp = math.sum(expZ);

	    return math.divide(expZ, sumExp);
	}


}