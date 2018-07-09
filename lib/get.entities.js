/**
 * Get Entities retrieves the body entity closest to the sensor
 * @author Adam Gee <adam@adamatronix.com>
 */

var bodyEntity = require('./body.entity');

module.exports = getEntities;

function getEntities(bodyFrame) {
    var closestIndex = this.getClosestBodyIndex(bodyFrame.bodies);
    var i = closestIndex;
    var body;

    if (i > 0) {
        body = bodyFrame.bodies[i];

        if (!bodiesCache[i]) {
            //create new instance of a body
            bodiesCache[i] = new bodyEntity(swipeEvent,grabEvent);  
        }

        bodiesCache[i].update(i,body);
        io.sockets.emit('bodiesDetected');
    } else {
        io.sockets.emit('bodiesUndetected');   
    }
}

/**
 * Retrieves the closest body entity index
 * @param  {array} bodies body data from kinect
 * @return {number}       body index
 */
getEntities.prototype.getClosestBodyIndex = function(bodies) {
	var closestZ = Number.MAX_VALUE;
	var closestBodyIndex = -1;
	for(var i = 0; i < bodies.length; i++) {
		if(bodies[i].tracked && bodies[i].joints[Kinect2.JointType.spineMid].cameraZ < closestZ) {
			closestZ = bodies[i].joints[Kinect2.JointType.spineMid].cameraZ;
			closestBodyIndex = i;
		}
	}
	return closestBodyIndex;
};
