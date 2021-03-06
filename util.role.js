var findUtil = require('util.find');

const SPAWN = "SPAWN";
const UPGRADE = "UPGRADE";
const BUILD = "BUILD";
const REPAIR = "REPAIR";

const MAX_BUILD = 5;
const MAX_SPAWN = 8;
const MAX_UPGRADE = 4;
const MAX_REPAIR = 2;

deliveryType = {};
deliveryType[SPAWN] = MAX_SPAWN;
deliveryType[UPGRADE] = MAX_UPGRADE;
deliveryType[BUILD] = MAX_BUILD;  // set dynamically depending on pendingBuildings
deliveryType[REPAIR] = MAX_REPAIR;

// TODO: Differentiate between energy for spawn vs energy for e.g. towers
// TODO: Focus repair on most damaged structures
// TODO: Do something similar for sources, less urgent as it's less impactful
// for now.
deliverDecision = function(creep, pendingBuildings) {
    if (pendingBuildings) {
        deliveryType[BUILD] = MAX_BUILD;
    } else {
        deliveryType[BUILD] = 0;
    }
    var energyNeed = (1 - creep.room.energyAvailable / creep.room.energyCapacityAvailable);
    deliveryType[SPAWN] = Math.round(MAX_SPAWN * energyNeed) + 1;
    var hostile = creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostile.length) {
        deliveryType[BUILD] = 0;
        deliveryType[UPGRADE] = 1;
    }

    var mod = creep.ticksToLive % _.sum(deliveryType);
    var acc = 0;
    var target;
    _.forEach(deliveryType, (chance, t) => {
        acc += chance;
        if (mod < acc) {
            target = t;
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
            if (!energySinks.length) {
                creep.memory.delivery = false;
                break;
            }
            if(creep.transfer(energySinks[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(energySinks[0]);
            }
            break;
        case BUILD:
            var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if (!sites.length) {
                creep.memory.delivery = false;
                break;
            }
            if(creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sites[0]);
            }
            break;
        case REPAIR:
            if (!creep.memory.destination) {
                var mostDamaged = findUtil.findMostDamaged(creep.room);
                if (mostDamaged) {
                    creep.memory.destination = mostDamaged.id;
                }
            }
            var toRepair = Game.getObjectById(creep.memory.destination);
            if (toRepair == null || toRepair.hits == toRepair.maxHits) {
                delete creep.memory.destination;
                delete creep.memory.target;
                break;
            }
            var status = creep.repair(toRepair);
            switch (status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(toRepair);
                    break;
                default:
                    delete creep.memory.destination;
                    delete creep.memory.target;
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
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
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
                delete creep.memory.destination;
            }
        }
	},
};