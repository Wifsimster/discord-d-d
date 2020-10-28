const User = require('../models/user')
const Ability = require('../models/ability')
const { random } = require('./utils')

function getUserLevel(level, xp) {
  if(level === 1 && xp >= 1000) { return 2 }
  if(level === 2 && xp >= 3000) { return 3 }
  if(level === 3 && xp >= 6000) { return 4 }
  if(level === 4 && xp >= 10000) { return 5 }
  if(level === 5 && xp >= 15000) { return 6 }
  if(level === 6 && xp >= 21000) { return 7 }
  if(level === 7 && xp >= 28000) { return 8 }
  if(level === 8 && xp >= 36000) { return 9 }
  if(level === 9 && xp >= 45000) { return 10 }
  if(level === 10 && xp >= 55000) { return 11 }
  if(level === 11 && xp >= 66000) { return 12 }
  if(level === 12 && xp >= 78000) { return 13 }
  if(level === 13 && xp >= 91000) { return 14 }
  if(level === 14 && xp >= 105000) { return 15 }
  if(level === 15 && xp >= 120000) { return 16 }
  if(level === 16 && xp >= 136000) { return 17 }
  if(level === 17 && xp >= 153000) { return 18 }
  if(level === 18 && xp >= 171000) { return 19 }
  if(level === 19 && xp >= 190000) { return 20 }
  if(level === 20) { return 20 }
}

function getMaxExperience(level) {
  if(level === 1) { return 1000 }
  if(level === 2) { return 3000 }
  if(level === 3) { return 6000 }
  if(level === 4) { return 10000 }
  if(level === 5) { return 15000 }
  if(level === 6) { return 21000 }
  if(level === 7) { return 28000 }
  if(level === 8) { return 36000 }
  if(level === 9) { return 45000 }
  if(level === 10) { return 55000 }
  if(level === 11) { return 66000 }
  if(level === 12) { return 78000 }
  if(level === 13) { return 91000 }
  if(level === 14) { return 105000 }
  if(level === 15) { return 120000 }
  if(level === 16) { return 136000 }
  if(level === 17) { return 153000 }
  if(level === 18) { return 171000 }
  if(level === 19) { return 190000 }
  if(level === 20) { return Infinity }
}

async function levelUp(userId) {
  let user = await User.findByPk(userId)
  let nextLevel = getUserLevel(user.level, user.experience)
  
  if(nextLevel > user.level) {
    await user.increment('level', { by: 1 })
    let hp = user.maxHitPoint + user.hitPointAugmentation
    await user.update({ experience: 0, maxHitPoint: hp, currentHitPoint: hp })
    let message = `🍾 **${user.username}** level up (+ ${user.hitPointAugmentation} :heart:`

    if([4, 6, 8, 12, 14, 16, 19].includes(nextLevel)) {
      let abilities = await Ability.findAll()
      let firstAbility = abilities[random(0, abilities.length - 1)]
      let secondAbility = abilities[random(0, abilities.length - 1)]

      if(firstAbility.name === secondAbility.name) {
        await user.increment(firstAbility.name, { by : 2 })
        message += `, +2 ${firstAbility.name} ) !`
        
        if(firstAbility.name === 'Constitution') {
          await user.increment('maxHitPoint', { by: 2 })
        }
      } else {
        await user.increment(firstAbility.name, { by : 1 })
        await user.increment(secondAbility.name, { by : 1 })
        message += `, +1 ${firstAbility.name}, +1 ${secondAbility.name}) !`
        
        if(firstAbility.name === 'Constitution') {
          await user.increment('maxHitPoint', { by: 1 })
        }
      }

    } else {
      message += ') !'
    }
    return message
  }
  return false
}

async function giveExperience(player, monster) {
  let messages = []
  let user = await User.findByPk(player.id)  
  let message = await levelUp(user.id)
  if(message) {
    messages.push(message)
  } else {
    await user.increment('experience', { by: monster.challenge })
  }
  return { messages: messages }
}

module.exports =  { getUserLevel, getMaxExperience, levelUp, giveExperience }