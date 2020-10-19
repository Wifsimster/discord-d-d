/* eslint-disable no-case-declarations */
const Ability = require('../models/ability')
const Environment = require('../models/environment')
const Armor = require('../models/armor')
const Shield = require('../models/shield')
const Weapon = require('../models/weapon')
const Class = require('../models/class')
const Monster = require('../models/monster')
const Race = require('../models/race')

async function generateTables() {
  await Environment.bulkCreate([...require('./environments')])    
  await Ability.bulkCreate([...require('./abilities')]) 
  await Armor.bulkCreate([...require('./armors')]) 
  await Shield.bulkCreate([...require('./shields')]) 
  await Weapon.bulkCreate([...require('./weapons')])
  await Race.bulkCreate([...require('./races')])
  await Class.bulkCreate([...require('./classes')])

  let monsters = [...require('./monsters_01'), ...require('./monsters_02'), ...require('./monsters_03')]
  await Monster.bulkCreate(monsters)
}

module.exports = { generateTables }