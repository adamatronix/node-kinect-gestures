/**
 * Velocity Tracker using Kinect v2 sensor data
 * @author Adam Gee <adam@grana.com>
 */

module.exports = velocityTracker;

/**
 * @param  {boolean} debug Toggles debug info
 * @constructor
 */
function velocityTracker(debug) {
	this.debug = debug;
	this.cacheLeft = 0;
	this.cacheRight = 0;
};

/**
 * Calculates velocity and direction based on the previous position.
 * @param  {number} x The depthX sensor data
 * @param  {number} y The depthY sensor data
 * @return {object}
 */
velocityTracker.prototype.getVelocity = function(x,y) {
	var velocity = 0;

	if(this.x && this.y && this.t) {
		var newX = x;
		var newY = y;
		var newT = Date.now();

		var xDist = newX - this.x;
		var yDist = newY - this.y;
		var interval = newT - this.t;

		velocity = Math.sqrt(xDist * xDist + yDist * yDist) / interval;
		var direction = this.getDirection(xDist,yDist,interval);

		if(this.debug) {
			var velocityPerSecond = velocity*1000;
			velocityPerSecond = velocityPerSecond.toFixed(2);
		}

		this.x = newX;
		this.y = newY;
		this.t = newT;
	} else {
		this.x = x;
		this.y = y;
		this.t = Date.now();
	}

	return {
		velocity: velocity,
		direction: direction
	};
};

/**
 * Gets the direction.
 * @param  {number} x The x difference
 * @param  {number} y The y different
 * @param  {number} t The time interval
 * @return {string} The direction 'left' or 'right'
 */
velocityTracker.prototype.getDirection = function(x,y,t) {
	var xDist = x;
	var yDist = y;
	var interval = t;
	var direction;

	if(xDist < 0) {
		this.cacheLeft++;
		this.cacheRight = 0;
	} else if(xDist > 0) {
		this.cacheRight++;
		this.cacheLeft = 0;
	}	

	if(this.cacheLeft > 2) {
		direction = "left";
	} else if(this.cacheRight > 2) {
		direction = "right";
	} else {
		direction = "neutral";
	}

	this.xDist = x;
	this.yDist = y;
	this.interval = t;
	this.direction = direction;

	return direction;
};
