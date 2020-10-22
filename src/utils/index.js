const Monster = require('../models/monster')
const User = require('../models/user')
const Inventory = require('../models/inventory')
const Item = require('../models/item')
const { Sequelize, Op } = require('sequelize')

function random(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function throwDice(dice = 20) {
  return Math.floor((Math.random() * dice) + 1)
}

function triggerEvent() {
  return throwDice() === throwDice()
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
    messages.push(`🍾 **${player.username}** leved up ! (+ ❤ ${user.hitPointAugmentation})`)
  }
  await user.increment('experience', { by: monster.challenge })
  return { messages: messages }
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

async function getUserUnequipItems(userId) {
  let user = await User.findByPk(userId, { include: { model: Inventory }})
  let inv = user.inventories.map(i => { if(!i.equiped) { return i.itemId } })
  inv = inv.filter(i => i)
  return await Item.findAll({ where: { id: inv }})
}

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

async function getItem(name) {
  if(name) {
    return await Item.findOne({ where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), Sequelize.fn('lower', name)) })
  }
}

async function savingThrow(userId) {
  let messages = []
  let user = await User.findByPk(userId)
  let randomValue = throwDice()
  let abilityScore = Math.max(...[user.strength, user.dexterity, user.constitution, user.intelligence, user.wisdom, user.charisma])
  
  if(randomValue >= abilityScore) {
    messages.push(`:wind_blowing_face: **${user.username}** survive the last damages by making a saving throws (:game_die: ${randomValue} >= ${abilityScore})`)
  } else {
    let newCurrentHitPoint = user.currentHitPoint - randomValue
    messages.push(`⚔ **${user.username}** tried a saving throws but failed (:game_die: ${randomValue} < ${abilityScore})`)
    await user.update({ currentHitPoint: newCurrentHitPoint < 0 ? 0 : newCurrentHitPoint })
  }
  return { messages }
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

async function determineValue(itemId) {
  let item = await Item.findByPk(itemId)
  let cost = 0
  if(item.condition > 0) {
    cost = (item.cost / (1 + (100 / item.condition))).toFixed(1)
  }
  return cost
}

async function decrementEquipedItemsCondition(userId) {
  let userWeapon = await getUserEquipedItem(userId, 'weapon')
  if(userWeapon) {
    let userIventoryWeapon = await Inventory.findOne({ where: { userId: userId, itemId: userWeapon.id }})
    await userIventoryWeapon.decrement('condition', { by: userWeapon.deteriorationRate })
  }
      
  let userArmor = await getUserEquipedItem(userId, 'armor')
  if(userArmor) {
    let userIventoryArmor = await Inventory.findOne({ where: { userId: userId, itemId: userArmor.id }})
    await userIventoryArmor.decrement('condition', { by: userArmor.deteriorationRate })
  }

  let userShield = await getUserEquipedItem(userId, 'shield')
  if(userShield) {
    let userIventoryShield = await Inventory.findOne({ where: { userId: userId, itemId: userShield.id }})
    await userIventoryShield.decrement('condition', { by: userShield.deteriorationRate }) 
  }
}

async function getUserItemCondition(userId, itemId) {
  let inventory = await Inventory.findOne({ where: { userId: userId, itemId: itemId }})

  if(inventory) {
    return inventory.condition
  }

  return null
}

async function determineWeaponDamage(userId) {
  let weapon = await getUserEquipedItem(userId, 'weapon')

  if(weapon) {
    let inventoryWeapon = await Inventory.findOne({ where: { userId: userId, itemId: weapon.id }})
    if(inventoryWeapon) {
      let weapon = await Item.findByPk(inventoryWeapon.itemId)
      let maxDamage = Math.ceil(weapon.damage * (inventoryWeapon.condition / 100))
      return maxDamage
    }
  }
  return null
}

async function determineArmorValue(userId, type = 'armor') {
  let armor = await getUserEquipedItem(userId, type)

  if(armor) {
    let inventoryArmor = await Inventory.findOne({ where: { userId: userId, itemId: armor.id }})
    if(inventoryArmor) {
      let armor = await Item.findByPk(inventoryArmor.itemId)
      let armorClass = Math.ceil(armor.armorClass * (inventoryArmor.condition / 100))
      return armorClass
    }
  }
  return 0
}

module.exports = { heal, savingThrow, getItem, getPotionFromUser, getUserUnequipItems, getUserEquipedItem, 
  random, throwDice, randomDamage, getLevelByExperience, initializeMonster, levelUp, giveXP, triggerEvent,
  determineValue, decrementEquipedItemsCondition, getUserItemCondition, determineWeaponDamage, determineArmorValue
}