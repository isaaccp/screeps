var findUtil = require('util.find');

var tower = {
    /** @param {Creep} creep **/
    run: function(tower) {
        var hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostile) {
            tower.attack(hostile);
            return;
        }
        if ((tower.energy / tower.energyCapacity) > 0.8) {
            var mostDamaged = findUtil.findMostDamaged(tower.room);
            if (mostDamaged) {
                tower.repair(mostDamaged);
            }
        }
        
	}
};

module.exports = tower;