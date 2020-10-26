const Ability = require('../models/ability')
const Monster = require('../models/monster')
const User = require('../models/user')
const Inventory = require('../models/inventory')
const Item = require('../models/item')
const { Sequelize, Op } = require('sequelize')

function random(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function throwDie(die = 20) {
  return Math.floor((Math.random() * die) + 1)
}

function multipleThrowDie(number, die = 20) {
  let result = 0
  for(let i = 0; i < number; i++) {
    result += throwDie(die)
  }
  return result
}

function triggerEvent() {
  return throwDie() === throwDie()
}

// const ATTACK_MATRIX_01 = [...Array(20).keys()]

function randomDamage(user) {
  if(user) {
    // return Math.round(ATTACK_MATRIX_01[user.hitDie - 1] * user.strength)
    return { die: throwDie(user.hitDie), strength: user.strength }
  }
  return 0
}

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

// async function determineUserLevel(userId) {
//   let user = await User.findByPk(userId) 
//   if(user) {
//     let level = getLevelByExperience(user.level, user.experience)
//     await user.update({ level: level })
//   }
//   return null
// }

async function initializeMonster(environmentId) {
  let monsters = await Monster.findAll({ where: { challengeRange: { [Op.between]: [0, 1] }, environmentId: environmentId }})
  let monster = monsters[random(0, monsters.length - 1)]
  if(monster) {
    monster.maxHitPoint = throwDie(monster.die) + monster.constitution
    monster.currentHitPoint = monster.maxHitPoint
    return monster
  }
  return null
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

async function giveXP(player, monster) {
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
  let randomValue = throwDie()
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

async function heal(userId) {
  let messages = []
  let user = await User.findByPk(userId)

  if(user.currentHitPoint < user.maxHitPoint) {
    let inventoryPotion = await getPotionFromUser(user.id)
    
    if(inventoryPotion && inventoryPotion.quantity > 0) {
      let firstThrowValue = throwDie(4)
      let secondThrowValue = throwDie(4)
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

async function userCurrentWeight(userId) {
  let user = await User.findByPk(userId, { include: [{ model: Inventory, where: { equiped: false }, include: [{ model: Item }] }] })

  if(user) {
    let inventories = user.inventories
    if(inventories) {
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
  let totalWeight = await userCurrentWeight(userId)

  if(user && container && totalWeight < container.value) {
    return true
  }
  return false
}

async function giveTrinket(userId) {
  let trinkets = await Item.findAll({ where: { objectType: 'trinket' } })
  let trinket = trinkets[random(0, trinkets.length - 1)]
  if(trinket) { await Inventory.create({ itemId: trinket.id, userId: userId }) }
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
          return { message: `**${user.username}** you don't have a weapon equiped !`, value: false }
        }
      } else {
        return { message: `**${user.username}** you are to heavy to move !`, value: false }
      }
    } else {
      return { message: `**${user.username}** you are not full life !`, value: false }
    }
  } else {
    return { message: `**${userId}** doesn't have a character yet !`, value: false }
  }
}

async function handleDungeon(message) {  
  if(message.content.startsWith('Who is ready to enter the')) {
    message.react('👍')
    let group = []

    const filter = (reaction, user) => {
      return reaction.emoji.name === '👍' && !user.bot && user.id !== message.author.id
    }
    
    const collector = message.createReactionCollector(filter, { time: 15000 })

    collector.on('collect', async (reaction, user) => {
      let results = await canParticipate(user.id)
      if(results.value) {
        group.push(user)
      } else {
        message.channel.send(results.message)
      }
    })
    
    collector.on('end', async collected => { 
      let dungeonEnvironment = message.content.includes('Forest') ? 'Forest' : null

      if(group.length > 0) {
        message.channel.send(`:synagogue: **${group}** enter the **${dungeonEnvironment}** dungeon !`)
      } else {
        message.channel.send('No one is ready !')
      }
    })
  }
}

module.exports = { canParticipate, handleDungeon, getUserContainer, canMove, heal, getMaxExperience, savingThrow, getItem, getPotionFromUser, getUserUnequipItems, getUserEquipedItem, 
  random, throwDie, randomDamage, getUserLevel, initializeMonster, levelUp, giveXP, triggerEvent, multipleThrowDie,
  determineValue, decrementEquipedItemsCondition, getUserItemCondition, determineWeaponDamage, determineArmorValue, giveTrinket
}