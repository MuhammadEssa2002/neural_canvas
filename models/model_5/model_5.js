class Model_5{
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

		this.L4 = math.matrix(para.L4);
		this.b4 = math.matrix(para.b4);

		this.L1_n = [];
		this.L2_n = [];
		this.L3_n = [];
		this.L4_n = [];
		this.L5_n = [];
		this.ang = 0;
		this.r = 10;
		this.dis;

		this.col1 = color(0,255,0);
		this.col2 = color(0,0,255);
		this.col3 = color(255,0,0);
		this.output = []
		
		this.dot_pos = 6;
		this.dot_num = 3;

		this.output_dot_pos = 3;
		this.output_dot_num = 3;

		let y1 = 200, y2 = 200, y3 = 200,y4 = 100,y5 = 530;
		for (let i = 0; i < 15; i++) { this.L1_n.push([575,  y1]); y1 += 40; }
		for (let i = 0; i < 15; i++) { this.L2_n.push([835,  y2]); y2 += 40; }
		for (let i = 0; i < 15; i++) { this.L3_n.push([1090, y3]); y3 += 40; }
		for (let i = 0; i < 9; i++) { this.L4_n.push([1290, y4]); y4 += 30; }
		for (let i = 0; i < 9; i++) { this.L5_n.push([1290, y5]); y5 += 30; }

	}
	
	getColor(value) {
	    value = constrain(value, 0, 1);

	    if (value <= 0.25) {
	        return this.col1; // Green
	    } 
	    else if (value <= 0.65) {
	        return lerpColor(
	            this.col1,
	            this.col2,
	            (value - 0.25) / 0.40
	        );
	    } 
	    else {
	        return lerpColor(
	            this.col2,
	            this.col3,
	            (value - 0.65) / 0.35
	        );
	    }
	}

	draw(X1,X2,cell_pos_1,cell_pos_2,show_shadow,show_lines){

		let arr1 = math.flatten(X1).toArray();
		let arr2 = math.flatten(X2).toArray();

		let boardMatrix_not_empty = !(( arr1.every(x => x === 0)) || ( arr2.every(x => x === 0)));
		let boardsMatrix_not_empty = !(( arr1.every(x => x === 0)) && ( arr2.every(x => x === 0)));

		let A1_arr = [];
		let A2_arr = [];
		let A3_arr = [];
		let A4_arr = [];
		let output_vec = [];

		for(let i of [X1,X2]){
			this.Z1 = math.add(
			  math.multiply(this.L1, i),
			  this.b1
			  );
			this.A1 = math.map(this.Z1, x => Math.max(0, x));
			this.A1_data = this.A1.toArray();
			A1_arr.push(this.A1_data);


			this.Z2 = math.add(
			  math.multiply(this.L2, this.A1),
			  this.b2
			  );
			this.Z2_data = this.Z2.toArray();
			this.A2 = math.map(this.Z2, x => Math.max(0, x));
			this.A2_data = this.A2.toArray();
			A2_arr.push(this.A2_data);

			this.Z3 = math.add(
			  math.multiply(this.L3, this.A2),
			  this.b3
			  );

			this.Z3_data = this.Z3.toArray();

			this.A3 = math.map(this.Z3, x => Math.max(0, x));
			this.A3_data = this.A3.toArray();
			A3_arr.push(this.A3_data);

			this.Z4 = math.add(
			  math.multiply(this.L4, this.A3),
			  this.b4
			  );
			output_vec.push(this.Z4);

			this.Z4_data = this.Z4.toArray();

			this.A4 = this.Z4;
			this.A4_data = this.A4.toArray();
			A4_arr.push(this.A4_data);
			}

		const diff = math.subtract(output_vec[0], output_vec[1]);
		this.dis = math.norm(math.flatten(diff));


		push();

		if(show_shadow){
			drawingContext.shadowBlur = 10;
			drawingContext.shadowColor = color(0);
			drawingContext.shadowOffsetX = this.r*sin(this.ang);
			drawingContext.shadowOffsetY = this.r*cos(this.ang);
		}

		noFill();
		stroke(255);
		strokeWeight(2);
		rect(480,100,690,750,20,0,20,0);

		push();
		fill(96, 193, 229,100);
		noStroke();
		rect(540,150,70,640,20,20,20,20);
		pop();

		push();
		fill(255, 233, 169,100);
		noStroke();
		rect(800,150,70,640,20,20,20,20);
		pop();

		push();
		fill(217, 54, 30,100);
		noStroke();
		rect(1055,150,70,640,20,20,20,20);
		pop();

		push();
		fill(213, 82, 163,100);
		noStroke();
		rect(1260,80,60,285,20,20,20,20);
		pop();

		push();
		fill(213, 82, 163,100);
		noStroke();
		rect(1260,500,60,285,20,20,20,20);
		pop();

		pop();



		if(boardsMatrix_not_empty && show_lines){
			push();
			for(let j=0;j<this.L1_n.length;j++){
				for(let i=0;i<783;i += 15){
				  stroke(203, 241, 245,X1.toArray()[i][0]*455);
				  strokeWeight(0.6);
				  line(cell_pos_1[i]["centerX"],cell_pos_1[i]["centerY"],this.L1_n[j][0],this.L1_n[j][1]);

				  stroke(203, 241, 245,X2.toArray()[i][0]*455);
				  strokeWeight(0.6);
				  line(cell_pos_2[i]["centerX"],cell_pos_2[i]["centerY"],this.L1_n[j][0],this.L1_n[j][1]);
				}
			}
			pop();
		}


		if(boardMatrix_not_empty && show_lines){
			push();
			for(let i=0;i<this.L2_n.length;i++){
			  for(let j=0;j<this.L1_n.length;j++){
			    let c2 = map(A2_arr[0][i][0].toFixed(3),0,1,0,1);
			    stroke(255, 209, 209,c2*255);
			    strokeWeight(1);
			    line(this.L1_n[j][0],this.L1_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);

			    let c3 = map(A2_arr[1][i][0].toFixed(3),0,1,0,1);
			    stroke(255, 209, 209,c3*255);
			    strokeWeight(1);
			    line(this.L1_n[j][0],this.L1_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);
			  }
			}
			pop();

			push();
			for(let i=0;i<this.L3_n.length;i++){
			  for(let j=0;j<this.L2_n.length;j ++){
			    let c4 = map(A3_arr[0][j][0].toFixed(3),0,1,0,1);
			    stroke(226, 62, 87,c4*255);
			    strokeWeight(1);
			    line(this.L3_n[j][0],this.L3_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);

			    let c5 = map(A3_arr[1][j][0].toFixed(3),0,0.3,0,1);
			    stroke(226, 62, 87,c5*255);
			    strokeWeight(1);
			    line(this.L3_n[j][0],this.L3_n[j][1],this.L2_n[i][0],this.L2_n[i][1]);
			  }
			}
			pop();

			push();
			for(let i=0;i<this.L3_n.length;i++){
			  for(let j=0;j<this.L4_n.length;j ++){
			    let c6 = map(A4_arr[0][j][0],-0.2,0.15,0,1);
			    stroke(255, 45, 241,c6*255);
			    strokeWeight(1);
			    line(this.L4_n[j][0],this.L4_n[j][1],this.L3_n[i][0],this.L3_n[i][1]);
			  }
			}
			pop();

			push();
			for(let i=0;i<this.L3_n.length;i++){
			  for(let j=0;j<this.L5_n.length;j ++){
			    let c6 = map(A4_arr[1][j][0],-0.2,0.15,0,1);
			    stroke(255, 45, 241,c6*255);
			    strokeWeight(1);
			    line(this.L5_n[j][0],this.L5_n[j][1],this.L3_n[i][0],this.L3_n[i][1]);
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
				stroke(100,100,255);
				strokeWeight(1);
				fill(0);
				rect(this.L1_n[i][0],this.L1_n[i][1],40,40,20,0,20,0);

				push();
				textSize(8);
				textAlign(CENTER, CENTER);
				fill(255);
				text(A1_arr[0][i][0].toFixed(3),this.L1_n[i][0]+5,this.L1_n[i][1]-10);
				text(A1_arr[1][i][0].toFixed(3),this.L1_n[i][0]-5,this.L1_n[i][1]+10);
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
				let colo = map(A2_arr[0][i][0],0,8,0,1);
				stroke(255,209,209);
				strokeWeight(1);
				fill(0);
				rect(this.L2_n[i][0],this.L2_n[i][1],40,40,0,20,0,20);

				push();
				textSize(8);
				textAlign(CENTER, CENTER);
				fill(255);
				text(A2_arr[0][i][0].toFixed(3),this.L2_n[i][0]-5,this.L2_n[i][1]-10);
				text(A2_arr[1][i][0].toFixed(3),this.L2_n[i][0]+5,this.L2_n[i][1]+10);
				pop();
			}
		}
		pop();

		push();
		for(let i=0;i<this.L3_n.length;i++){
			if((i>=this.dot_pos) && i<=(this.dot_pos+this.dot_num-1)){
				stroke(255,62,87);
				strokeWeight(1);
				fill(0);
				circle(this.L3_n[i][0],this.L3_n[i][1],10)
			}else{
				rectMode(CENTER,CENTER);
				let colo = map(A3_arr[0][i][0],0,20,0,1);
				stroke(255,62,87);
				strokeWeight(1);
				fill(0);
				rect(this.L3_n[i][0],this.L3_n[i][1],40,40,0,20,20,20);

				push();
				textSize(8);
				textAlign(CENTER, CENTER);
				fill(255);
				text(A3_arr[0][i][0].toFixed(3),this.L3_n[i][0],this.L3_n[i][1]-10);
				text(A3_arr[1][i][0].toFixed(3),this.L3_n[i][0],this.L3_n[i][1]+10);
				pop();
			}
		}
		pop();

		push();
		for(let i=0;i<this.L4_n.length;i++){
			if((i>=this.output_dot_pos) && i<=(this.output_dot_pos+this.output_dot_num-1)){
				stroke(76, 35, 101);
				strokeWeight(1);
				fill(0);
				circle(this.L4_n[i][0],this.L4_n[i][1],10)
			}else{
				rectMode(CENTER,CENTER);
				let colo = map(A4_arr[0][i][0],0,1,0,1);
				stroke(76, 35, 101);
				strokeWeight(1);
				fill(colo*76,colo*35,colo*101);
				rect(this.L4_n[i][0],this.L4_n[i][1],40,20,5,20,0,20);

				push();
				textSize(10);
				textAlign(CENTER, CENTER);
				fill(255);
				text(A4_arr[0][i][0].toFixed(3),this.L4_n[i][0],this.L4_n[i][1]);
				pop();
			}
		}
		pop();

		push();
		for(let i=0;i<this.L5_n.length;i++){
			if((i>=this.output_dot_pos) && i<=(this.output_dot_pos+this.output_dot_num-1)){
				stroke(76, 35, 101);
				strokeWeight(1);
				fill(0);
				circle(this.L5_n[i][0],this.L5_n[i][1],10)
			}else{
				rectMode(CENTER,CENTER);
				let colo = map(A4_arr[1][i][0],0,1,0,1);
				stroke(76, 35, 101);
				strokeWeight(1);
				fill(colo*76,colo*35,colo*101);
				rect(this.L5_n[i][0],this.L5_n[i][1],40,20,5,20,0,20);

				push();
				textSize(10);
				textAlign(CENTER, CENTER);
				fill(255);
				text(A4_arr[1][i][0].toFixed(3),this.L5_n[i][0],this.L5_n[i][1]);
				pop();
			}
		}
		pop();

		pop();

		if(boardMatrix_not_empty){
			push();
			if(show_shadow){
				drawingContext.shadowBlur = 10;
				drawingContext.shadowColor = color(0);
				drawingContext.shadowOffsetX = this.r*sin(this.ang);
				drawingContext.shadowOffsetY = this.r*cos(this.ang);
			}
			fill(255);
			textSize(15);
			noStroke();
	  		strokeWeight(2);
			text(`Euclidean distance = ${this.dis.toFixed(3)}`,1460,520);

			push();
			noStroke()
			fill(this.getColor(this.dis))
			rect(1400,430,map(this.dis,0,1.5,0,300),50,20,0,20,0);
			pop();

			push();
			stroke(255);
			noFill();
			rect(1400,430,300,50,20,0,20,0);
			pop();
			
			pop();
		}

	    push();
	    textSize(20);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("Hidden Layers",(2*480+690)/2,120);
	    pop();

	    push();
	    textSize(15);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("1st Hidden Layer \n 40 Neurons",(2*540+70)/2,820);
	    pop();

	    push();
	    textSize(15);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("2nd Hidden Layer \n 40 Neurons",(2*800+70)/2,820);
	    pop();

	    push();
	    textSize(15);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("3rd Hidden Layer \n 40 Neurons",(2*1055+70)/2,820);
	    pop();

	    push();
	    textSize(13);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("Embedding of the 1st input. \n 32-Dimensional",(2*1260+60)/2,400);
	    pop();

	    push();
	    textSize(13);
	    fill(255);
		textAlign(CENTER, CENTER);
		text("Embedding of the 2nd input. \n 32-Dimensional",(2*1260+60)/2,820);
	    pop();

	    push();
		fill(255);
		let info = "Trained using JAX (Python)\n" +
		             "Parameters: 35,992\n" +
		             "Test Accuracy: 95%\n" +
		             "Epochs: 80\n" +
		             "Loss Function: Contrastive Loss\n" +
		             "Optimizer: Mini-Batch Adam.";

		textSize(13); textAlign(CENTER, CENTER); fill(255); textLeading(18);
		text(info, 180, 440);
		pop();

		push();
		fill(255);
		textSize(20); textAlign(CENTER, CENTER); fill(255); textLeading(18);
		text("Siamese Network", 180, 80);
		pop();

	    this.ang += 0.03

	


	}


}