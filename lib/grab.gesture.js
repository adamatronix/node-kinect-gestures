/**
 * Grab Gesture detection using Kinect v2 sensor data
 * @author Adam Gee <adam@grana.com>
 */

module.exports = grabGesture;

/**
 * This callback type is called `grabCallback`.
 *
 * @callback grabCallback
 */

/**
 * @param  {string} label Name of gesture.
 * @param  {grabCallback} callback To be fired when grab is detected.
 */
function grabGesture(label,callback) {
	this.label = label;
	this.callback = callback;
	this.isGrab = false;
	this.hasGrabbed = false;
	this.isIrrelevant = false;
	this.startGrabTime = null;
	this.startIrrelevantTime = null;

	this.frames = 0;
	this.totalDistances = 0;
};

/**
 * Handles new sensor data information.
 * @param  {number} uid Body identifier
 * @param  {number} state Hand state ie. '2' open, '1' not tracked, '3' closed
 */
grabGesture.prototype.update = function(uid,state,handJoint,midJoint) {
	var uid = uid;
	var now = Date.now();
	var irrelevantDuration,grabDuration;

	if(!this.isGrab && state === 3) {
		this.isGrab = true;
		this.hasGrabbed = false;
		this.startGrabTime = Date.now();
	}

	if (this.isIrrelevant) {
		if (state === 3) {
			this.isIrrelevant = false;
		} else {
			irrelevantDuration = now - this.startIrrelevantTime;
			if (irrelevantDuration > 50) {
				this.isIrrelevant = false;
				this.isGrab = false;
				this.frames = 0;
				this.totalDistances = 0;
				//console.log('canceled'); 
			}
		}
	} else {
		if (state !== 3 && this.isGrab) {
			this.isIrrelevant = true;
			this.startIrrelevantTime = Date.now();
		}
	}

	if (this.isGrab) {
		var avgDistanceFromTorso;
		grabDuration = now - this.startGrabTime;
		this.frames++;
		this.totalDistances += midJoint.cameraZ - handJoint.cameraZ;

		if (grabDuration >= 300) {
			avgDistanceFromTorso = this.totalDistances / this.frames;
			if (!this.hasGrabbed && avgDistanceFromTorso > 0.50) {
				this.hasGrabbed = true;
				this.callback();
			}
		}		
	}

};

