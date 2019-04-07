
function render(rect, stepSize, f){
	var result = {};

	result.data = [];
	var count = 0;

	var maxv = {
				startX: 0,
				startY: 0,
				endX: 0,
				endY: 0,
			};
	for(var f0 = rect.left;f0<=rect.right;f0+=stepSize){
		for(var f1 = rect.bottom; f1<=rect.top;f1+=stepSize){
			var f2 = f(f0, f1);
			result.data[count++] = {
				startX: f0,
				startY: f1,
				endX: f0+f1,
				endY: f1+f2,
			};

			if(lensq(result.data[count-1])>lensq(maxv)){
				maxv = result.data[count-1];
			}

		}
	}

	result.length = count;
	result.maxV = maxv;
	return result;
}

function lensq(_vec){
	return (_vec.endX-_vec.startX)*(_vec.endX-_vec.startX) + (_vec.endY-_vec.startY)*(_vec.endY-_vec.startY);
}

//message format: area:{left, right, top, bottom}, stepSize, fun
onmessage = e => {
    e.data.fun = new Function( e.data.fun.args, e.data.fun.body);

    postMessage(render(e.data.area, e.data.stepSize, e.data.fun));
};