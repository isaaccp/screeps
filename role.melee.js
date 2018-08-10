var roleUtil = require('util.role');

var role = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (hostile) {
            if (creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile);
            }
        }
    }
};

module.exports = role;