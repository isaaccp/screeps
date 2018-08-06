var roleUtil = require('util.role');

var role = {
    /** @param {Creep} creep **/
    run: function(creep) {
         roleUtil.energyDeliveryCreep(creep);
    }
};

module.exports = role;