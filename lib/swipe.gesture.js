/**
 * Swipe Gesture detection using Kinect v2 sensor data
 * @author Adam Gee <adam@grana.com>
 */

var velocityTracker = require('./velocity.tracker');

module.exports = swipeGesture;

/**
 * This callback type is called `swipeCallback`.
 *
 * @callback swipeCallback
 * @param {string} direction The direction of the swipe ie. left or right.
 * @param {string} vertical The vertical direction of the swipe ie. top or bottom.
 */

/**
 * @param  {string} label Name of gesture.
 * @param  {swipeCallback} callback To be fired when swipe is detected.
 * @param  {boolean} debug Toggle debugging information.
 */
function swipeGesture(label,callback,debug) {
	this.label = label;
	this.callback = callback;
	this.debug = debug;
	this.refJoint;
	this.cacheStartThresh;
	this.cacheDirection;
	this.cacheDirectionTime;
	this.cacheVelocityCount;
	this.cacheVelocityTotal;
	this.swipeRight = 0;
	this.swipeLeft = 0;
	this.$debugWindow;
	//track velocity
	this.swipeVelocityTracker = new velocityTracker(debug);
};

/**
 * Hnaldes new sensor data information.
 * @param  {number} uid Body identifier
 * @param  {object} joint Joint information
 * @param  {object} refJoint Refernece joint information
 */
swipeGesture.prototype.update = function(uid,joint,refJoint) {
	var uid = uid;
	var depthX = joint.depthX;
	var depthY = joint.depthY;

	//convert into percentages
	var depthXPer = depthX * 100;
	var depthYPer = depthY * 100;

	this.refJoint = refJoint;

	//get velocity and direction
	var vObj = this.swipeVelocityTracker.getVelocity(depthXPer,depthYPer);

	var directionOfSwipe = vObj.direction;
	var velocityPercentPersecond = (vObj.velocity * 1000);

	var movement = this.calculateMovement(joint,directionOfSwipe,velocityPercentPersecond);
	this.analyzeMovementForSwipe(movement);

	if(this.debug) {
		this.debugBuild(uid,directionOfSwipe,velocityPercentPersecond);
		
	}

};

/**
 * Determines by movements data what is a swipe, 
 * then fires the supplied callback.
 * @param  {object} data Movement data
 */
swipeGesture.prototype.analyzeMovementForSwipe = function (data) {
	if(data) {
		var direction = data.direction;
		var duration = data.duration;
		var avgVelocity = data.avgVelocity;
		var startX = data.journey.start.x;
		var endX = data.journey.end.x;
		var startY = data.journey.start.y;

		if(direction !== 'neutral') {
			if(avgVelocity > 100 && duration > 100) {
				if((direction === 'left' && startX === 'right' && endX === 'left') || (direction === 'right' && startX === 'left' && endX === 'right')) {
					this.callback(direction,startY);
				}
				
			}
		}

	}
};

/**
 * Calculates extra data from the duration of a single action, 
 * from the start to the end.
 * @param  {object} joint Joint data
 * @param  {string} direction The direction of the action
 * @param  {number} velocity The current velocity
 * @return {object} 
 */
swipeGesture.prototype.calculateMovement = function (joint,direction,velocity) {
	var movementObj;

	if(this.cacheDirection) {
		if(direction !== this.cacheDirection) {
			var t = Date.now();
			var totalTime = t - this.cacheDirectionTime;
			var endThresh = this.getPositionByRefJoint(joint);
			//console.log('total time for ' + this.cacheDirection + ' is ' + totalTime + ' with average velocity of ' + this.cacheVelocityTotal/this.cacheVelocityCount + ' started on the ' + this.cacheStartThresh + ' and ended on the ' + endThresh);

			movementObj = {
				direction: this.cacheDirection,
				duration: totalTime,
				avgVelocity: this.cacheVelocityTotal/this.cacheVelocityCount,
				journey: {
					start: this.cacheStartThresh,
					end: endThresh
				}
			};

			//a switch in direction, so start timer
			this.cacheDirectionTime = Date.now();
			this.cacheVelocityCount = 0;
			this.cacheVelocityTotal = 0;
			this.cacheStartThresh = this.getPositionByRefJoint(joint);

		}

	} else {
		this.cacheDirectionTime = Date.now();
		this.cacheVelocityCount = 0;
		this.cacheVelocityTotal = 0;
		this.cacheStartThresh = this.getPositionByRefJoint(joint);
	}

	this.cacheVelocityCount++;
	if(!velocity) {
		velocity = 0;
	}
	this.cacheVelocityTotal = this.cacheVelocityTotal + velocity;
	this.cacheDirection = direction; 

	return movementObj;
};

/**
 * Determines the joint position in relation to the refernce joint. ie. torso/spine
 * @param  {object} joint Joint information
 * @return {object}
 */
swipeGesture.prototype.getPositionByRefJoint = function (joint) {
	var direction = {};
	if(joint.depthX < this.refJoint.depthX) {
		direction.x = 'left';
	} else {
		direction.x = 'right';
	}

	if(joint.depthY < this.refJoint.depthY) {
		direction.y = 'top';
	} else {
		direction.y = 'bottom';
	}

	return direction;
}

/**
 * deprecated debug helper
 */
swipeGesture.prototype.debugBuild = function(uid,direction,velocity) {
	if(!this.$debugWindow || !this.$debugWindow.length > 0) {
		//create debug window
		this.$debugWindow = $("<div class='debug-window'></div>");
		$("body").append(this.$debugWindow);
	}

	this.$debugWindow.html("");
	this.$debugWindow.append("<p>" + uid + " " + this.label + ":</p>");
	this.$debugWindow.append("<p>" + direction + "</p>");
	this.$debugWindow.append("<p>" + velocity.toFixed(2) + "</p>");
};
