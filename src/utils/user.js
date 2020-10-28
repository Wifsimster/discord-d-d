
const User = require('../models/user')
const Item = require('../models/item')
const Inventory = require('../models/inventory')

const { random } = require('./utils')
const { getUserContainer, getUserEquipedItem } = require('./item')

async function getUserCurrentWeight(userId) {
  let user = await User.findByPk(userId, { include: [{ model: Inventory, where: { equiped: false }, include: [{ model: Item }] }] })

  if(user) {
    let inventories = user.inventories
    if(inventories && inventories.length > 0) {
      let weights = inventories.map(inventory => {
        return inventory.quantity * inventory.item.weight
      })
      return weights.reduce((accumulator, weight) => accumulator + weight)
    } else {
      return 0
    }
  }
  return null
}

async function canMove(userId) {
  let user = await User.findByPk(userId)
  let container = await getUserContainer(userId)
  let totalWeight = await getUserCurrentWeight(userId)

  if(user && container && totalWeight < container.value) {
    return true
  }
  return false
}

async function giveTrinket(userId) {
  let trinkets = await Item.findAll({ where: { objectType: 'trinket' } })
  let trinket = trinkets[random(0, trinkets.length - 1)]
  if(trinket) { 
    await Inventory.create({ itemId: trinket.id, userId: userId }) 
  }
}

async function canParticipate(userId) {
  let user = await User.findByPk(userId)
  if(user) {
    if(user.currentHitPoint === user.maxHitPoint) {
      if(canMove(userId)) {
        let weapon = await getUserEquipedItem(user.id, 'weapon')
        if(weapon) {
          return { value: true }
        } else {
          return { message: `**${user.username}** doesn't have a weapon equiped !`, value: false }
        }
      } else {
        return { message: `**${user.username}** is to heavy to move !`, value: false }
      }
    } else {
      return { message: `**${user.username}** is not full life !`, value: false }
    }
  } else {
    return { message: `**${userId}** doesn't have a character yet !`, value: false }
  }
}

module.exports =  { getUserCurrentWeight, canMove, giveTrinket, canParticipate }