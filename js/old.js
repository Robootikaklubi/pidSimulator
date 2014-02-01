
angular.module('pidSimulator').controller('Old', Old);

function Old($scope, $rootScope, $timeout) {

	$rootScope.$on('calibrate', function (ev, whites, blacks) {
		$scope.sensorMean = _.map(_.range(8), function (i) {
			return Math.floor((whites[i]+blacks[i])/2);
		});
	});

	angular.extend($scope, {
		b2pos: {
			1: 0,
			3: 888,
			11: 1332,
			13: 1776,
			31: 2224,
			33: 2668,
			330: 3112,
			700: 4000
		},
		maxSpeed: 255,
		pos: 0,
		posLast: 0,
		raw: '00000000',
		sensorMean: [500, 500, 500, 500, 500, 500, 500, 500],
		bx: [1, 3, 11, 13, 31, 33, 330, 700],
		bn: [],
		bSum: 0,
		sum: 0,
		pos: 0,
		P: 0.74,
		I: 0,
		D: 0,
		difference: 0,
	});


	function pid(pos) {
		$scope.sum+=pos;
		if (32767<$scope.sum) {
			$scope.sum-=65535;
		} else if (-32768>$scope.sum) {
			$scope.sum+=65535;
		}
		var maxSpeed = $scope.maxSpeed;
		var difference = $scope.P*pos + $scope.I*$scope.sum + $scope.D*(pos-$scope.posLast);
		var left, right;

		if(difference > maxSpeed){difference = maxSpeed;}
		if(difference < -maxSpeed){difference = -maxSpeed;}
		
		if(difference < 0) {
			left = maxSpeed + difference; right = maxSpeed;
		} else {
			left = maxSpeed; right = maxSpeed - difference;
		}
		$scope.difference = difference;
		$scope.leftSpeed = left;
		$scope.rightSpeed = right;
	}


	$rootScope.$watch('raw', function (val, old, scope) {
		var me = $scope;

		me.value = _.map(val, function (raw, i) {
			return +(raw > me.sensorMean[i]);
		});
	});

	$scope.$watch('value', function () {
		var me = $scope;

		console.log('value', me.value, me.bn);

		me.bn = _.map(me.value, function (value, i) {
			return (+value) * me.bx[i];
		});

		console.log('value', me.value, me.bn);

		me.bSum = _.reduce(me.bn, function (acc, num) {
			return acc + num;
		}, 0);

		if (~me.bx.indexOf(me.bSum)) {
			me.posLast = me.pos;
			me.pos = me.b2pos[me.bSum] - 2000;
		}

		pid(me.pos);
	});
}