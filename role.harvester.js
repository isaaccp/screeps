var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const energySinks = creep.room.find(FIND_MY_STRUCTURES, {
            filter: s => s.energy < s.energyCapacity
        });
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
                if(creep.transfer(energySinks[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energySinks[0]);
                }
            } else {
                creep.memory.delivery = false;
            }
        }
	}
};

module.exports = roleHarvester;