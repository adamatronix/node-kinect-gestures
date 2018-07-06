/**
 * Body Entity for handling Kinect v2 sensor data
 * @author Adam Gee <adam@grana.com>
 */

var grabGesture = require('./grab.gesture');
var swipeGesture = require('./swipe.gesture');

module.exports = bodyEntity;

/**
 * This callback type is called `swipeCallback`.
 *
 * @callback swipeCallback
 * @param {string} direction The direction of the swipe ie. left or right.
 * @param {string} vertical The vertical direction of the swipe ie. top or bottom.
 */

/**
 * Initialize any gestures
 * @param {swipeCallback} Callback to be passed to the swipeGesture module
 * @constructor
 */
function bodyEntity(swipeEvent, grabEvent, proximityEvent) {
	this.leftHandTracker = new swipeGesture('left hand', swipeEvent, false);
	this.rightHandTracker = new swipeGesture('right hand', swipeEvent, false);
	this.leftHandGrabTracker = new grabGesture('left hand grab', grabEvent);
	this.rightHandGrabTracker = new grabGesture('right hand grab', grabEvent);
};

/** 
 * Update when the data is returned.
 * @param  {number} uid The identifier of the body.
 * @param  {object} body Body data.
 */
bodyEntity.prototype.update = function (uid,body) {
	var uid = uid;
	var bodyJoints = body.joints;

	this.leftHandTracker.update(uid,bodyJoints[7],bodyJoints[1]);
    this.rightHandTracker.update(uid,bodyJoints[11],bodyJoints[1]);
    this.leftHandGrabTracker.update(uid,body.leftHandState,bodyJoints[7],bodyJoints[1]);
    this.rightHandGrabTracker.update(uid,body.rightHandState,bodyJoints[11],bodyJoints[1]);
};
