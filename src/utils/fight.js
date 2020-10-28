const { throwDice } = require('./utils')
const User = require('../models/user')

module.exports = function randomDamage(user) {
  if(user) {
    return { die: throwDice(user.hitDie), strength: user.strength }
  }
  return 0
}

module.exports = async function savingThrow(userId) {
  let messages = []
  let user = await User.findByPk(userId)
  let randomValue = throwDice()
  let abilityScore = Math.max(...[user.strength, user.dexterity, user.constitution, user.intelligence, user.wisdom, user.charisma])
  
  if(randomValue >= abilityScore) {
    messages.push(`:wind_blowing_face: **${user.username}** survive the last damages by making a saving throws (:game_die: ${randomValue} >= ${abilityScore})`)
  } else {
    let newCurrentHitPoint = user.currentHitPoint - randomValue
    messages.push(`:crossed_swords: **${user.username}** tried a saving throws but failed (:game_die: ${randomValue} < ${abilityScore})`)
    await user.update({ currentHitPoint: newCurrentHitPoint < 0 ? 0 : newCurrentHitPoint })
  }
  return { messages }
}