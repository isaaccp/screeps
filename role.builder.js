var roleUtil = require('util.role');

var role = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.delivery) {
	        if(creep.carry.energy < creep.carryCapacity) {
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            } else {
                creep.memory.delivery = true;
            }
        } else {
            if (creep.carry.energy > 0) {
                var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sites[0]);
                }
            } else {
                creep.memory.delivery = false;
            }
        }
	}
};

module.exports = role;