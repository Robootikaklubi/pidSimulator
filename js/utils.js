function constrainFactory(bottom, top, x) {
	var fn = function (x) {
		if (x>top) return top;
		if (x<bottom) return bottom;
		return x;
	};
	if (arguments.length == 3) {
		return fn(x);
	}
	return fn;
}

// function map(fromBottom, fromTop, toBottom, toTop, x) {
// 	return function (x) {
// 		return 100 * (x - fromBottom) / (fromTop - fromBottom));
// 	};
// }

function sum(arr) {
	return _.reduce(arr, function (res, val) {
		return res + (+val);
	}, 0)
}

function mean(arr) {
	return sum(arr) / arr.length;
}
