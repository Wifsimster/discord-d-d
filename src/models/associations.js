
const Class = require('./class')
const Environment = require('./environment')
const Monster = require('./monster')
const Race = require('./race')
const User = require('./user')
const Item = require('./item')
const Inventory = require('./inventory')
const Quest = require('./quest')
const Group = require('./group')

Monster.belongsTo(Environment)
Environment.hasMany(Monster)

User.belongsTo(Class)
Class.hasMany(User)
  
User.belongsTo(Race)
Race.hasMany(User)

User.belongsTo(Group)
Group.hasMany(User)

User.belongsTo(Environment)
Environment.hasMany(User)

Inventory.belongsTo(Item)
Item.hasMany(Inventory)

Inventory.belongsTo(User)
User.hasMany(Inventory)

Quest.belongsTo(User)
User.hasMany(Quest)

Quest.belongsTo(Monster)
Monster.hasMany(Quest)
