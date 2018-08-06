const SPAWN = "SPAWN";
const UPGRADE = "UPGRADE";
const BUILD = "BUILD";

deliveryType = {};
deliveryType[SPAWN] = 4;
deliveryType[UPGRADE] = 3;
deliveryType[BUILD] = 0;  // set dynamically depending on pendingBuildings

deliverDecision = function(creep, pendingBuildings) {
    if (pendingBuildings) {
        deliveryType[BUILD] = 5;
    } else {
        deliveryType[BUILD] = 0;
    }
    var mod = creep.ticksToLive % _.sum(deliveryType);
    var acc = 0;
    var target;
    _.forEach(deliveryType, (chance, t) => {
        acc += chance;
        if (mod < acc) {
            target = t;
            console.log("Mod: ", mod, "Target: ", target);
            return false;
        }
    });
    return target;
}

deliver = function (creep, target) {
    switch (target) {
        case SPAWN:
            const energySinks = creep.room.find(FIND_MY_STRUCTURES, {
                filter: s => s.energy < s.energyCapacity
            });
            if(creep.transfer(energySinks[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(energySinks[0]);
            }
            break;
        case BUILD:
            var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if(creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sites[0]);
            }
            break;
        case UPGRADE:
        default:
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            break;

    }
}

// pendingBuildings (set by main to number of buildings in construction)
module.exports = {
    energyDeliveryCreep: function(creep) {
        if (!creep.memory.delivery) {
	        if(creep.carry.energy < creep.carryCapacity) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            } else {
                creep.memory.delivery = true;
                creep.memory.target = deliverDecision(creep, this.pendingBuildings);
            }
        } else {
            if (creep.carry.energy > 0) {
                deliver(creep, creep.memory.target);
            } else {
                creep.memory.delivery = false;
            }
        }
	},
};