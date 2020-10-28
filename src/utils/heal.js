
const User = require('../models/user')
const Item = require('../models/item')
const Inventory = require('../models/inventory')
const { throwDice } = require('./utils')

async function getPotionFromUser(userId) {
  let user = await User.findByPk(userId, { include: { model: Inventory }})
  let potion = await Item.findOne({ where: { name: 'Life_potion' }}) 

  let results = await Promise.all(user.inventories.map(async inventory => {
    if(inventory.itemId === potion.id) {
      return inventory
    }
  }))

  results = results.filter(i => i)

  if(results[0]) {
    return results[0]
  }
}

async function heal(userId) {
  let messages = []
  let user = await User.findByPk(userId)

  if(user.currentHitPoint < user.maxHitPoint) {
    let inventoryPotion = await getPotionFromUser(user.id)
    
    if(inventoryPotion && inventoryPotion.quantity > 0) {
      let firstThrowValue = throwDice(4)
      let secondThrowValue = throwDice(4)
      let randomHitPoint = firstThrowValue + secondThrowValue + 2
      let toHeal = user.maxHitPoint - user.currentHitPoint
      if(randomHitPoint > toHeal) {
        randomHitPoint = toHeal
      }
      await user.increment('currentHitPoint', { by: randomHitPoint })
      messages.push(`❤ **${user.username}** restored his life : ${user.currentHitPoint}/${user.maxHitPoint} ❤`) 
    } else {
      messages.push(`❤ **${user.username}** you don't have any \`Life_potion\` !`)
    }
  } else {
    messages.push(`❤ **${user.username}** you are already at 100% ❤ !`)
  }
  return { messages }
}

module.exports = { getPotionFromUser, heal }