const User = require('../models/user')
const Item = require('../models/item')
const Quest = require('../models/quest')
const Inventory = require('../models/inventory')

const { heal } = require('../utils/heal')
const { giveExperience } = require('../utils/level')
const { random, throwDice, triggerEvent } = require('../utils')
const { getUserEquipedItem, getUserItemCondition } = require('../utils/item')
const { determineWeaponDamage, determineArmorValue } = require('../utils/equipment')

function randomDamage(user) {
  if(user) {
    return { die: throwDice(user.hitDie), strength: user.strength }
  }
  return 0
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
    messages.push(`:crossed_swords: **${user.username}** tried a saving throws but failed (:game_die: ${randomValue} < ${abilityScore})`)
    await user.update({ currentHitPoint: newCurrentHitPoint < 0 ? 0 : newCurrentHitPoint })
  }
  return { messages }
}

async function attackMonster(player, monster) {
  let messages = []
  let user = await User.findByPk(player.id)

  if(user) {
    if(user.currentHitPoint > 0) {      
      let weapon = await getUserEquipedItem(user.id, 'weapon')
      
      if(!weapon) {
        messages.push(`🤨 **${user.username}** go in an adventure without a weapon !`)
        return { messages, monster }
      }

      let weaponCondition = await getUserItemCondition(user.id, weapon.id)

      if(weaponCondition === 0) {
        messages.push(`🤨 **${user.username}** go in an adventure with a broken weapon !`)
        return { messages, monster }
      }

      // Random event
      if(triggerEvent()) {
        let dieValue = throwDice(user.hitDie)
        await user.update({ currentHitPoint: user.currentHitPoint - dieValue })        
        let randomMessages = [
          `:crossed_swords: **${user.username}** slides on a big :shit: and hit his head, loosing - ${dieValue} ❤ !`,
          `:crossed_swords: **${user.username}** hit himself with his \`${weapon.name}\`, loosing - ${dieValue} ❤ !`,
          `:mouse_trap:  **${user.username}** walk on a trap and loose - ${dieValue} ❤ !`
        ]
        messages.push(randomMessages[random(0, randomMessages.length - 1)])
      } else {
        let weaponDamage = await determineWeaponDamage(user.id)
        let randomValue = throwDice()
        let armorDamage = monster.armorClass - randomValue
        let firstDamageDie = Math.round(throwDice(user.hitDie) * weaponDamage / user.hitDie)
        let secondDamageDie =  Math.round(throwDice(user.hitDie) * weaponDamage / user.hitDie)

        switch(randomValue) {
        case 20:          
          messages.push(`:crossed_swords: **${user.username}** made a critical hit with his **${weapon.name}** ! (:game_die: ${firstDamageDie} + :game_die: ${secondDamageDie} => - 🗡 ${firstDamageDie + secondDamageDie})`)
          monster.currentHitPoint = monster.currentHitPoint - (firstDamageDie + secondDamageDie)
          break
        case 1:
          messages.push(`:crossed_swords: **${user.username}** missed the **${monster.name}** ! (:game_die: ${randomValue})`)
          break
        default :
          if(armorDamage < 0 ) {
            messages.push(`:crossed_swords: **${user.username}** hit the **${monster.name}** (:shield: ${monster.armorClass} - :game_die: ${randomValue} => 🗡 ${armorDamage})`)
            monster.currentHitPoint = monster.currentHitPoint - firstDamageDie
          } else {
            messages.push(`:crossed_swords: **${user.username}** hit the **${monster.name}** but his armor prevent any damage ! (:shield: ${monster.armorClass} - :game_die: ${randomValue} => 🗡 0)`)
          }
        }
    
        if(monster.currentHitPoint <= 0) {
          messages.push(`🎺 **${user.username}** killed the **${monster.name}** !`)

          // Update user quest
          let quest = await Quest.findOne({ where: { userId: user.id }})
          if(quest && quest.monsterId === monster.id) {
            if(quest.killedMonster - 1 < quest.nbMonster) {
              await quest.increment('killedMonster', { by: 1 })
            } else {
              await user.increment('coins', { by: quest.coins })
              let results = await giveExperience(user.id, quest.challenge)
              await quest.destroy()
              messages.push(`:bookmark: **${user.username}** completed his quest !`)
              messages = [...messages, ...results.messages]
            }
          }

          if(triggerEvent()) {
            let items = await Item.findAll()
            let item = items[random(0, items.length - 1)]
            await Inventory.create({ itemId: item.id, userId: user.id})
            messages.push(`🎁 **${user.username}** got a **${item.name}** !`)
          }
        }
      }
    } else {
      messages.push(`☠ **${user.username}** is dead !`)
    }
    return { messages, monster }
  } else {
    throw Error('User not found !')
  }
}


async function attackPlayer(player, monster) {
  let messages = []
  let user = await User.findByPk(player.id)

  if(user) {
    let results
    let userCurrentHitPoint = user.currentHitPoint

    if(monster.currentHitPoint > 0) {
      let randomValue = throwDice()
      let armorClass = await determineArmorValue(user.id, 'armor') + await determineArmorValue(user.id, 'shield')
      let armorDamage = armorClass - randomValue
      let firstDamageDie = Math.round(throwDice(monster.die) * monster.strength / monster.die)
      let secondDamageDie = Math.round(throwDice(monster.die) * monster.strength / monster.die)

      switch(randomValue) {
      case 20:          
        messages.push(`:crossed_swords: **${monster.name}** made a critical hit to **${user.username}** ! (:game_die: ${firstDamageDie} + :game_die: ${secondDamageDie} => - 🗡 ${firstDamageDie + secondDamageDie})`)
        userCurrentHitPoint = userCurrentHitPoint - (firstDamageDie + secondDamageDie)
        break
      case 1:
        messages.push(`:crossed_swords: **${monster.name}** missed **${user.username}** ! (:game_die: ${randomValue})`)
        break
      default :
        if(armorDamage < 0 ) {
          messages.push(`:crossed_swords: **${monster.name}** hit **${user.username}** (:shield: ${armorClass} - :game_die: ${randomValue} => 🗡 ${armorDamage})`)
          
          let potentialUserCurrentHitPoint = userCurrentHitPoint - firstDamageDie

          if(potentialUserCurrentHitPoint <= 0) {
            if(random(0, 1) === 0) {
              results = await heal(user.id)
              messages = [...messages, ...results.messages]
            } else {
              results = await savingThrow(user.id)
              messages = [...messages, ...results.messages]
            }
          }

          if(user.currentHitPoint <= 0) {
            messages.push(`☠ **${monster.name}** killed **${user.username}** !`)
          }
        } else {
          messages.push(`:crossed_swords: **${monster.name}** hit **${user.username}** but his armor prevent any damage ! (:shield: ${armorClass} - :game_die: ${randomValue} => 🗡 0)`)
        }
      }

      await user.update({ currentHitPoint: userCurrentHitPoint < 0 ? 0 : userCurrentHitPoint })
    }
  }
  return { messages }
}

module.exports = { randomDamage, savingThrow, attackMonster, attackPlayer }