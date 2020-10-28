const Item = require('../models/item')
const User = require('../models/user')
const Inventory = require('../models/inventory')
const { Sequelize } = require('sequelize')

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

module.exports = { getItem, determineItemValue, getUserItemCondition, getUserEquipedItem, getUserContainer, getUserUnequipItems }