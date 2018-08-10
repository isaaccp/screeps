module.exports = {
    findMostDamaged: function(room) {
        const repairs = room.find(FIND_STRUCTURES, {
            filter: s => s.hits < s.hitsMax
        });
        var mostDamaged;
        var minLeft = 1;
        _.forEach(repairs, (r) => {
            var left = r.hits / r.hitsMax;
            if (r.structureType == STRUCTURE_RAMPART) {
                left /= 80;
            } else if (r.structureType == STRUCTURE_ROAD) {
                left /= 50;
            }
            if (left < minLeft) {
                minLeft = left;
                mostDamaged = r;
            }
        });        
        return mostDamaged;
    },
};