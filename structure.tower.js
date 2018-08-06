var structure = {

    /** @param {Creep} creep **/
    run: function(structure) {
        var hostile = structure.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (!hostile) return;
        structure.attack(hostile);
	}
};

module.exports = structure;