angular.module('pidSimulator').controller('New', New);

function New($scope, $rootScope, $timeout) {

	$rootScope.$on('calibrate', function (ev, whites, blacks) {
		$scope.white = whites;
		$scope.black = blacks;
	});

	angular.extend($scope, {
		maxSpeed: 255,
		pos: 0,
		posLast: 0,
		white: [0,0,0,0,0,0,0,0],
		black: [1000,1000,1000,1000,1000,1000,1000,1000],
		bx: [1, 3, 11, 13, 31, 33, 330, 700],
		bn: [],
		bSum: 0,
		sum: 0,
		pos: 0,
		stepChange: 0,
		P: 0.5,
		I: 0.1,
		D: 10,
		rollingMean: 0,
		difference: 0,
	});

	var constrainSensor = constrainFactory(0,100);

	function pid() {
		var m = $scope.m = calcMultiplier($scope.value);
		$scope.posLast = $scope.pos;
		// var lastPos = $scope.pos;
		$scope.normalized = _.map($scope.value, function (val) {
			return m * val;
		});

		if (0.5 < m && m < 2) {
			$scope.pos = calcPosition(m, $scope.value);
		}

		var maxSpeed = $scope.maxSpeed;
		var mean = $scope.rollingMean = (99 * $scope.rollingMean + $scope.pos)/100;
		var change = $scope.stepChange = $scope.pos - $scope.posLast;
		var left = maxSpeed;
		var right = maxSpeed;
		var speedDifference;
		var difference = $scope.P*$scope.pos + $scope.I*mean + $scope.D*change;
		var constraintTopSpeed = $scope.constraintTopSpeed = constrainFactory(-maxSpeed, maxSpeed, difference);


		if (constraintTopSpeed < 0) {
			left = maxSpeed + constraintTopSpeed;
		} else {
			right = maxSpeed - constraintTopSpeed;
		}
		
		$scope.difference = constraintTopSpeed;
		$scope.leftSpeed = left;
		$scope.rightSpeed = right;
	}

	function calcMultiplier(values) {
		var s = sum(values);
		var multiplier = 1000;

		if (s!==0) {
			multiplier = 100 / s;
		}

		return multiplier;
	}

	function calcPosition(m, values) {
		var pos = 0;
		var distance = 0.5;

		for (var i = 0; i < 4; i++) {
			pos += m * (values[4+i]-values[3-i]) * distance;
			distance *= 3.42;
		}

		return pos;
	}

	$rootScope.$watch('raw', function (val, old, root) {
		var me = $scope;

		me.value = _.map(val, function (raw, i) {
			return constrainSensor(Math.round(100 * (raw - me.white[i]) / (me.black[i] - me.white[i])));
		});

	});

	$scope.$watch('value', function (val, old, scope) {
		pid(scope.pos);
	});
}