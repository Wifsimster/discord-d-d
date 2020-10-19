
const Ability = require('./ability')
const Class = require('./class')
const Environment = require('./environment')
const Monster = require('./monster')
const Race = require('./race')
const User = require('./user')
const Trinket = require('./trinket')
const Armor = require('./armor')
const Shield = require('./shield')
const Weapon = require('./weapon')
const Item = require('./item')

Monster.belongsTo(Environment)
Environment.hasMany(Monster)

User.belongsTo(Class)
Class.hasMany(User)

User.belongsTo(Race)
Race.hasMany(User)

User.belongsTo(Armor)
Armor.hasMany(User)

User.belongsTo(Shield)
Shield.hasMany(User)

User.belongsTo(Weapon)
Weapon.hasMany(User)

User.belongsTo(Environment)
Environment.hasMany(User)

Race.belongsToMany(Ability, { through: 'raceAbility' })
Ability.belongsToMany(Race, { through: 'raceAbility' })

Class.belongsToMany(Ability, { through: 'classAbility' })
Ability.belongsToMany(Class, { through: 'classAbility' })

Item.belongsTo(User)
User.hasMany(Item)
Item.belongsTo(Armor)
Armor.hasMany(Item)
Item.belongsTo(Shield)
Shield.hasMany(Item)
Item.belongsTo(Weapon)
Weapon.hasMany(Item)
Item.belongsTo(Trinket)
Trinket.hasMany(Item)


