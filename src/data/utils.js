/* eslint-disable no-case-declarations */
const Ability = require('../models/ability')
const Environment = require('../models/environment')
const Item = require('../models/item')
const Class = require('../models/class')
const Race = require('../models/race')
const Monster = require('../models/monster')
const User = require('../models/user')

async function syncTables() {
  Ability.sync({ alter: true })
  Environment.sync({ alter: true })
  Item.sync({ alter: true })
  Class.sync({ alter: true })
  Race.sync({ alter: true })
  Monster.sync({ alter: true })
  User.sync({ alter: true })
}

async function populateTables() {
  await Ability.bulkCreate([...require('./abilities')]) 
  await Environment.bulkCreate([...require('./environments')])

  await Item.bulkCreate([...require('./armors')]) 
  await Item.bulkCreate([...require('./shields')]) 
  await Item.bulkCreate([...require('./weapons')]) 
  await Item.bulkCreate([...require('./trinkets')])
  
  await Race.bulkCreate([...require('./races')])
  await Class.bulkCreate([...require('./classes')])

  let monsters = [...require('./monsters_01'), ...require('./monsters_02'), ...require('./monsters_03')]
  await Monster.bulkCreate(monsters)
}

module.exports = { syncTables, populateTables }