const Monster = require('../models/monster')
const User = require('../models/user')
const { Op } = require('sequelize')

function random(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function throwDice(dice = 20) {
  return Math.floor((Math.random() * dice) + 1)
}

// const ATTACK_MATRIX_01 = [...Array(20).keys()]

function randomDamage(user) {
  if(user) {
    // return Math.round(ATTACK_MATRIX_01[user.hitDie - 1] * user.strength)
    return { dice: throwDice(user.hitDie), strength: user.strength }
  }
  return 0
}

function getLevelByExperience(xp) {
  if(xp >= 0 && xp < 1000) { return { level: 1, min: 0, max: 1000 } }
  if(xp >= 1000 && xp < 3000) { return { level: 2, min: 1000, max: 3000 } }
  if(xp >= 3000 && xp < 6000) { return { level: 3, min: 3000, max: 6000 } }
  if(xp >= 6000 && xp < 10000) { return { level: 4, min: 6000, max: 10000 } }
  if(xp >= 1000 && xp < 15000) { return { level: 5, min: 1000, max: 15000 } }
  if(xp >= 15000 && xp < 21000) { return { level: 6, min: 15000, max: 21000 } }
  if(xp >= 21000 && xp < 28000) { return { level: 7, min: 21000, max: 28000 } }
  if(xp >= 28000 && xp < 36000) { return { level: 8, min: 28000, max: 36000 } }
  if(xp >= 36000 && xp < 45000) { return { level: 9, min: 36000, max: 45000 } }
  if(xp >= 45000 && xp < 55000) { return { level: 10, min: 45000, max: 55000 } }
  if(xp >= 55000 && xp < 66000) { return { level: 11, min: 55000, max: 66000 } }
  if(xp >= 66000 && xp < 78000) { return { level: 12, min: 66000, max: 78000 } }
  if(xp >= 78000 && xp < 91000) { return { level: 13, min: 78000, max: 91000 } }
  if(xp >= 91000 && xp < 105000) { return { level: 14, min: 91000, max: 105000 } }
  if(xp >= 105000 && xp < 120000) { return { level: 15, min: 105000, max: 120000 } }
  if(xp >= 120000 && xp < 136000) { return { level: 16, min: 120000, max: 136000 } }
  if(xp >= 136000 && xp < 153000) { return { level: 17, min: 136000, max: 153000 } }
  if(xp >= 153000 && xp < 171000) { return { level: 18, min: 153000, max: 171000 } }
  if(xp >= 171000 && xp < 190000) { return { level: 19, min: 171000, max: 190000 } }
  if(xp >= 190000) { return { level: 20, min: 190000 } }
}

async function initializeMonster(environmentId) {
  let monsters = await Monster.findAll({ where: { challengeRange: { [Op.between]: [0, 1] }, environmentId: environmentId }})
  let monster = monsters[random(0, monsters.length - 1)]
  if(monster) {
    monster.maxHitPoint = throwDice(monster.dice) + monster.constitution
    monster.currentHitPoint = monster.maxHitPoint
    return monster
  }
  return null
}

async function levelUp(user) {
  let currentLevel = getLevelByExperience(user.experience)
  if([4, 6, 8, 12, 14, 16, 19].includes(currentLevel.level + 1)) {
    // TODO : User can gain +2 aptitudes point
  }

  let hp = user.maxHitPoint + user.hitPointAugmentation
  return await user.update({ maxHitPoint: hp, currentHitPoint: hp })
}

async function giveXP(player, monster) {
  let user = await User.findByPk(player.id)
  let currentLevel = getLevelByExperience(user.experience)
  let messages = []
  if(user.experience + monster.challenge > currentLevel.max) {
    await levelUp(user)
    messages.push(`🍾 ${player.username} leved up ! (+ ❤ ${user.hitPointAugmentation})`)
  }
  await user.increment('experience', { by: monster.challenge })
  return { messages: messages }
}

module.exports = { random, throwDice, randomDamage, getLevelByExperience, initializeMonster, levelUp, giveXP }