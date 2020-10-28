const { random, throwDice } = require('./utils')
const { Op } = require('sequelize')
const Monster = require('../models/monster')

async function initializeMonster(environmentId) {
  let monsters = await Monster.findAll({ where: { challengeRange: { [Op.between]: [0, 1] }, environmentId: environmentId }})
  let monster = monsters[random(0, monsters.length - 1)]
  if(monster) {
    monster.maxHitPoint = throwDice(monster.die) + monster.constitution
    monster.currentHitPoint = monster.maxHitPoint
    return monster
  }
  return null
}

module.exports = { initializeMonster }