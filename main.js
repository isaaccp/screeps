var roles = ['delivery'];
var roleModules = {};
for (var role in roles) {
    roleModules[roles[role]] = require('role.' + roles[role]);
}
var utilRole = require('util.role');
var tower = require('structure.tower');

bodyCost = function(body) {
    return _.sum(body, p => BODYPART_COST[p.type || p]);
}

const MIN_BODY = [WORK, CARRY, MOVE];
const MIN_COST = bodyCost(MIN_BODY);
const DESIRED_CREEPS_BY_ROLE = [
    {role: 'delivery', count : 15},
];

creepBuilder = function (room, role) {
    var energy = room.energyAvailable;
    var cost = MIN_COST;
    var body = MIN_BODY.slice();
    
    var extend = function(parts, limit=0) {
        let c = bodyCost(parts);
        let i = 0;
        while(cost + c <= energy && body.length + parts.length <= MAX_CREEP_SIZE) {
            body.push(...parts);
            cost += c;
            i++;
            if(limit > 0 && i >= limit) {
                break;
            }
        }
    }
    
    switch (role) {
        case 'delivery':
            extend([MOVE], limit=1);
            extend([WORK, CARRY, MOVE, MOVE]);
            extend([WORK, MOVE], limit=1);
            extend([CARRY, MOVE])
            break;
    }
    
    return body;
}

module.exports.loop = function () {
    var room = Game.spawns['Spawn1'].room;
    utilRole.pendingBuildings = room.find(FIND_MY_CONSTRUCTION_SITES).length;
    
    var creepsByRole = {};
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleModules[creep.memory.role].run(creep);
        if (creepsByRole[creep.memory.role]) {
            creepsByRole[creep.memory.role]++;
        } else {
            creepsByRole[creep.memory.role] = 1;
        }
    }
    _.forEach(DESIRED_CREEPS_BY_ROLE, (desired) => {
        if ((creepsByRole[desired.role] || 0) < desired.count ) {
            var body = creepBuilder(room, desired.role)
            Game.spawns['Spawn1'].spawnCreep(body, desired.role + Game.time, { memory: { role: desired.role } } );
            return false;
        }
    });
    
    for (var name in Game.structures) {
        var s = Game.structures[name];
        switch (s.structureType) {
            case STRUCTURE_TOWER:
                tower.run(s);
                break;
        }
    }
    if ((Game.time % 10) == 0) {
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }
}