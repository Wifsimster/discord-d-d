const User = require('../models/user')
const Item = require('../models/item')
const Quest = require('../models/quest')
const Inventory = require('../models/inventory')
const Environment = require('../models/environment')

const { 
  heal, 
  savingThrow, 
  getUserEquipedItem, 
  random, throwDie, 
  initializeMonster, giveXP, 
  determineWeaponDamage,
  triggerEvent, 
  decrementEquipedItemsCondition, 
  getUserItemCondition,
  determineArmorValue,
  canMove} = require('../utils')

module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  cooldown: 5,
  async execute(message) {
    let mentions = message.mentions.users.array()
    
    let players = []
    let messages = []
    let leader = await User.findByPk(message.author.id)

    if(leader && leader.currentHitPoint > 0) { 
      players.push(message.author) 

      // Keep user with character & life
      await Promise.all(mentions.map(async mention => {
        let user = await User.findByPk(mention.id, { include: [{ model: Inventory, where: { equiped: true }, include: [{ model: Item }] }]})
      
        if(user && user.currentHitPoint > 0 && user.username !== leader.username && canMove(user.id)) {
          players.push(mention) 
        }
      }))

      if(players.length > 1) {
        let environment = await Environment.findByPk(leader.environmentId)        
        messages.push(`🏕 Your journey in the **${environment.name.toLowerCase()}** started ${players.map(user => { return user }) }`)
        
        if(triggerEvent()) {
          let player = players[random(0, players.length - 1)]
          let user = await User.findByPk(player.id)
          let items = await Item.findAll()
          let item = items[random(0, items.length - 1)]
          await Inventory.create({ itemId: item.id, userId: user.id})

          let tmp = [
            `🔍 ${user.username} inspect a pile of trash on the road and found a \`${item.name}\` !`,
            `🎁 ${user.username} return a corpse and take his \`${item.name}\` !`
          ]

          messages.push(tmp[random(0, tmp.length - 1)])
        }

        // User event trigger
        let player = players[random(0, players.length - 1)]
        let triggers = [`🤨 **${player.username}** see something ...`, 
          `🤫 **${player.username}** heard something ...`, 
          `🤫 **${player.username}** walk on something ...`
        ]
        let randomTrigger = triggers[random(0, triggers.length - 1)]
        messages.push(randomTrigger)

        let monster = await initializeMonster(environment.id)

        if(monster) {
          messages.push(`:crossed_swords: A **${monster.name}** attack your group ! (🗡 ${monster.strength}  :shield: ${monster.armorClass}  ❤ ${monster.maxHitPoint})`)

          let index = 0
          while(index < players.length && monster.currentHitPoint > 0) {
            let currentPlayer = players[index]
            
            let results = await attackMonster(currentPlayer, monster).catch(() => {
              messages.push('❗ Something went wrong attacking the monster !')
            })

            messages = [...messages, ...results.messages]      
            monster = results.monster            
              
            results = await attackPlayer(currentPlayer, monster)
            messages = [...messages, ...results.messages]
            
            let user = await User.findByPk(currentPlayer.id)
           
            if(user.currentHitPoint <= 0) {
              await decrementEquipedItemsCondition(user.id) 
              players.splice(index, 1)
            }

            if(index === players.length - 1) { index = 0 } else { index++ }
          }

          if(players.length > 0) {
            // Give monster XP to players          
            await Promise.all(players.map(async player => {
              let results = await giveXP(player, monster)
              messages = [...messages, ...results.messages]
            
              let user = await User.findByPk(player.id)
              await decrementEquipedItemsCondition(user.id)
              let randomCoins = random(0, 10 * user.level)
              await user.update({ coins: user.coins + randomCoins })
              messages.push(`🏆 **${user.username}** got **${monster.challenge} XP** & **${randomCoins}** 🪙 !`)
            }))        
          } else {
            messages.push('☠ **Everyone dies, loosers !**')
          }
        }
      }
      else {
        messages.push(`It's dangerous to go alone in an adventure **${message.author}** ! Bring some friends next time.`)
      }
    } else {
      messages.push(`☠ **${message.author}** you are dead, dude !`)
    }
    // Send all messages at the end
    messages.map(m => { message.channel.send(m) })
  }
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
        let dieValue = throwDie(user.hitDie)
        await user.update({ currentHitPoint: user.currentHitPoint - dieValue })        
        let randomMessages = [
          `:crossed_swords: **${user.username}** slides on a big :shit: and hit his head, loosing - ${dieValue} ❤ !`,
          `:crossed_swords: **${user.username}** hit himself with his \`${weapon.name}\`, loosing - ${dieValue} ❤ !`,
          `:mouse_trap:  **${user.username}** walk on a trap and loose - ${dieValue} ❤ !`
        ]
        messages.push(randomMessages[random(0, randomMessages.length - 1)])
      } else {
        let weaponDamage = await determineWeaponDamage(user.id)
        let randomValue = throwDie()
        let armorDamage = monster.armorClass - randomValue
        let firstDamageDie = Math.round(throwDie(user.hitDie) * weaponDamage / user.hitDie)
        let secondDamageDie =  Math.round(throwDie(user.hitDie) * weaponDamage / user.hitDie)

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
              let results = await giveXP(user.id, quest.challenge)
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
      let randomValue = throwDie()
      let armorClass = await determineArmorValue(user.id, 'armor') + await determineArmorValue(user.id, 'shield')
      let armorDamage = armorClass - randomValue
      let firstDamageDie = Math.round(throwDie(monster.die) * monster.strength / monster.die)
      let secondDamageDie = Math.round(throwDie(monster.die) * monster.strength / monster.die)

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