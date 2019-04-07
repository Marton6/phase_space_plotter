const canvas = document.querySelector("canvas");

const w = new Worker("renderWorker.js");

var graphArea = new function(){
	this.left = -10; 
	this.right = 10; 
	this.top = 10; 
	this.bottom = -10;
	this.getWidth =  ()=>this.right-this.left;
	this.getHeight =  ()=>this.top-this.bottom;
	this.getArea =  ()=>{return {left:this.left, right:this.right, top:this.top, bottom:this.bottom};};
	this.stepSize = 1;
}();

var ctx = canvas.getContext('2d');
ctx.transform(1, 0, 0, -1, 0, canvas.height)

w.onmessage = e => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.scale(canvas.width/graphArea.getWidth(), canvas.height/graphArea.getHeight());
	ctx.translate(-graphArea.left, -graphArea.bottom);
	
	ctx.strokeStyle = '#DDDEE0';
	ctx.lineWidth = graphArea.stepSize*.1;

	for(var i=graphArea.left;i<graphArea.right;i++){
		ctx.beginPath();
		ctx.moveTo(i, graphArea.top);
		ctx.lineTo(i, graphArea.bottom);
		ctx.stroke();
	}
	
	for(var i=graphArea.bottom;i<graphArea.top;i++){
		ctx.beginPath();
		ctx.moveTo(graphArea.left, i);
		ctx.lineTo(graphArea.right, i);
		ctx.stroke();
	}

	ctx.strokeStyle = 'steelblue';
	ctx.fillStyle = "#FF0000"; // for the triangle fill
	ctx.lineJoin = 'butt';
	ctx.fillStyle = 'steelblue';
	
	var maxlen = len(e.data.maxV);

	for(let v = 0;v<e.data.length;v++){
		let vec = e.data.data[v];
		drawVector(normalize(vec), color(len(vec), maxlen), ctx);
	}

	ctx.restore();
}

function len(_vec){
	return Math.sqrt((_vec.endX-_vec.startX)*(_vec.endX-_vec.startX) + (_vec.endY-_vec.startY)*(_vec.endY-_vec.startY));
}

function color(len, maxlen){
	var r = Math.trunc(len / maxlen * 255);
	var b = 255-r;
	return "rgb("+r+", 0, "+b+")";
}

function normalize(_vec){
	var vec = {startX:_vec.startX, startY:_vec.startY};
	var length = len(_vec);
	vec.endX = vec.startX+(_vec.endX - _vec.startX)/length*graphArea.stepSize*.7;
	vec.endY = vec.startY+(_vec.endY - _vec.startY)/length*graphArea.stepSize*.7;
	return vec;
}

function drawVector(vec, color, ctx){
	ctx.beginPath();
	//console.log(Math.sqrt((vec.endX-vec.startX)*(vec.endX-vec.startX) + (vec.endY-vec.startY)*(vec.endY-vec.startY)));
	/*
	ctx.moveTo(vec.startX, vec.startY);
	ctx.lineTo(vec.endX, vec.endY);*/

	ctx.strokeStyle = color;

	var headlen = graphArea.stepSize*.2;   // length of head in pixels
    var angle = Math.atan2(vec.endY-vec.startY,vec.endX-vec.startX);
    ctx.moveTo(vec.startX, vec.startY);
    ctx.lineTo(vec.endX, vec.endY);
    ctx.lineTo(vec.endX-headlen*Math.cos(angle-Math.PI/6),vec.endY-headlen*Math.sin(angle-Math.PI/6));
    ctx.moveTo(vec.endX, vec.endY);
    ctx.lineTo(vec.endX-headlen*Math.cos(angle+Math.PI/6),vec.endY-headlen*Math.sin(angle+Math.PI/6));
	ctx.stroke();
}

function fn_string (exp) {
	return {
	    args: "f1, f2",
	    body: "return "+exp+";"
	}
}

function submit(){
	graphArea.left = parseInt(document.getElementById("input_start_x").value);
	graphArea.bottom = parseInt(document.getElementById("input_start_y").value);
	graphArea.right = parseInt(document.getElementById("input_end_x").value);
	graphArea.top = parseInt(document.getElementById("input_end_y").value);

	graphArea.stepSize = parseFloat(document.getElementById("input_step_size").value);
	
	var finput = document.getElementById("input_function").value;
	if(check(finput)) return;
	graphArea.function = fn_string(parseFunctionInput(finput));
	console.log(graphArea.function);
	w.postMessage({area:graphArea.getArea(), stepSize:graphArea.stepSize, fun: graphArea.function});
}

function check(str){
	return /[^f+\-*()signco./0-9]/g.test(str);
}

function parseFunctionInput(str){
	str = str.replace(/sign/g, "Math.sign");
	str = str.replace(/sin/g, "Math.sin");
	str = str.replace(/cos/g, "Math.cos");
	return str;
}
submit();