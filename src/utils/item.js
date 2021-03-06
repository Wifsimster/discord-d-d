const Item = require('../models/item')
const User = require('../models/user')
const Inventory = require('../models/inventory')
const { Sequelize } = require('sequelize')

const { random, triggerEvent } = require('../utils')

async function getItem(name) {
  if(name) {
    return await Item.findOne({ where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), Sequelize.fn('lower', name)) })
  }
}

async function determineItemValue(itemId) {
  let item = await Item.findByPk(itemId)
  let cost = 0
  if(item.condition > 0) {
    cost = (item.cost / (1 + (100 / item.condition))).toFixed(1)
  }
  return cost
}

async function getUserItemCondition(userId, itemId) {
  let inventory = await Inventory.findOne({ where: { userId: userId, itemId: itemId }})

  if(inventory) {
    return inventory.condition
  }

  return null
}

async function getUserEquipedItem(userId, object = 'weapon') {
  let user = await User.findByPk(userId, { include: { model: Inventory }})
  if(user && user.inventories) {
    let inv = user.inventories.map(i => { 
      if(i.equiped) { 
        return i.itemId 
      } 
    })
    inv = inv.filter(i => i)
    if(inv) {
      let items = await Item.findAll({ where: { id: inv }})
      return items.filter(item => item.objectType === object)[0]
    }
  }
  return null
}

async function getUserContainer(userId) {
  let user = await User.findByPk(userId, { include: { model: Inventory, where: { equiped: true } } })

  if(user) {
    let items = await Promise.all(user.inventories.map(async inventory => await Item.findByPk(inventory.itemId)))
    let container = items.find(item => item.type === 'container')
    if(container) {
      return container
    }
    return null
  }
}

async function getUserUnequipItems(userId) {
  let user = await User.findByPk(userId, { include: { model: Inventory }})
  let inv = user.inventories.map(i => { if(!i.equiped) { return i.itemId } })
  inv = inv.filter(i => i)
  return await Item.findAll({ where: { id: inv }})
}

async function getRandomItem() {
  let items = await Item.findAll()
  return items[random(0, items.length - 1)]
}

async function foundItemEvent(group) {
  if(triggerEvent()) {
    let player = group[random(0, group.length - 1)]
    let user = await User.findByPk(player.id)
    let items = await Item.findAll()
    let item = items[random(0, items.length - 1)]
    await Inventory.create({ itemId: item.id, userId: user.id})

    let tmp = [
      `🔍 **${user.username}** inspect a pile of trash on the road and found a \`${item.name}\` !`,
      `🎁 **${user.username}** return a corpse and take his \`${item.name}\` !`
    ]

    return tmp[random(0, tmp.length - 1)]
  }
}

module.exports = { getItem, determineItemValue, getUserItemCondition, getUserEquipedItem, getUserContainer, getUserUnequipItems, getRandomItem, foundItemEvent }