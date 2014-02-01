angular.module('pidSimulator', [])
	.value('config', {})
	.run(function ($rootScope, $timeout) {
		$rootScope.round = function (x) {
			return Math.round(x);
		}

		var stepTimeout;

		$rootScope.stepSpeed = 2500;

		$rootScope.off = {
			'old': false,
			'new': false
		}

		$rootScope.switch = function (section) {
			$rootScope.off[section] = !$rootScope.off[section];
		};

		angular.extend($rootScope, {
			racing: true,
			trackPosition: 0,
			moveTrack: function (ev) {
				$rootScope.trackPosition = ev.offsetX-15;
			}
		});
		
		$rootScope.calibrate = function () {
			var blacks = _.map(sensorPositions, function (pos, i) {
				return read(pos)[i];
			});

			$rootScope.$emit('calibrate', read(-999999), blacks);
		};

		// $rootScope.calibrate();

		$scope = $rootScope;

		var sensorPositions = _.map(_.range(8), function (el) {
			return 50 + el * 60;
		});

		var sysError = _.map(sensorPositions, function () {
			return Math.random()*120 - 60;
		});

		function randomError() {
			return (Math.random() + Math.random() + Math.random()) * 5;
		}

		function step() {
			$timeout.cancel(stepTimeout);
			
			if ($rootScope.racing) {
				$rootScope.raw = read($scope.trackPosition);
				stepTimeout = $timeout(step, $rootScope.stepSpeed);	
			}
		}

		function read(actualPos) {
			var reads = _.map(sensorPositions, function (pos, i) {
				var a = 850 - Math.abs(Math.pow((actualPos-pos)/4.2, 3));
				a = a > 0 ? a : 0;

				return Math.floor(a + sysError[i] + 50 + randomError());
			});		
			return reads;
		}

		step();

		$rootScope.$watch('racing', function (val, old) {
			if (val) {
				step();
			}
		});

		$rootScope.$watch('stepSpeed', function () {
			step();
		});
		// $rootScope.$watch('trackPosition', function (val, old) {
		// 	$rootScope.raw = read(val);
		// });
});

