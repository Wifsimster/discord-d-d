const User = require('../models/user')
const Environment = require('../models/environment')
const Item = require('../models/item')
const Inventory = require('../models/inventory')

const { getUserEquipedItem, random, throwDice, initializeMonster, giveXP, triggerEvent } = require('../utils')

module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  usage: '[commande name]',
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
        let user = await User.findByPk(mention.id)
        if(user && user.currentHitPoint > 0 && user.username !== leader.username) {
          players.push(mention) 
        }
      }))

      if(players.length > 1) {
        let environment = await Environment.findByPk(leader.environmentId)        
        messages.push(`🏕 Your journey in the ${environment.name.toLowerCase()} started ${players.map(user => { return user }) }`)
        
        if(triggerEvent()) {
          let player = players[random(0, players.length - 1)]
          let user = await User.findByPk(player.id)
          let items = await Item.findAll()
          let item = items[random(0, items.length - 1)]
          await Inventory.create({ itemId: item.id, userId: user.id})
                    
          let tmp = [
            `🔍 ${user.username} inspect a pile of trash on the road and found a ${item.name} !`,
            `🎁 ${user.username} return a corpse and take hist ${item.name} !`
          ]

          messages.push(tmp[random(0, tmp.length - 1)])
        }

        // User event trigger
        let player = players[random(0, players.length - 1)]
        let triggers = [`🤨 ${player.username} see something ...`, `🤫 ${player.username} heard something ...`]
        let randomTrigger = triggers[random(0, triggers.length - 1)]
        messages.push(randomTrigger)

        let monster = await initializeMonster(environment.id)

        if(monster) {
          messages.push(`⚔ A ${monster.name} attack your group ! (🗡 ${monster.strength}  🛡 ${monster.armorClass}  ❤ ${monster.maxHitPoint})`)

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
              players.splice(index, 1)
            }

            if(index === players.length - 1) { index = 0 } else { index++ }
          }
          
          // Give monster XP to players
          await Promise.all(players.map(async player => {
            let results = await giveXP(player, monster)
            messages = [...messages, ...results.messages]
          }))

          if(players.length > 0) {
            messages.push(`🏆 ${players.map(player => player.username) } got ${monster.challenge} XP !`)
          } else {
            messages.push('☠ Everyone dies, loosers !')
          }
        }
      }
      else {
        messages.push(`It's dangerous to go alone in an adventure ${message.author} ! Bring some friends next time.`)
      }
    } else {
      messages.push(`☠ ${message.author} you are dead, dude !`)
    }
    // Send all messages at the end
    messages.map(m => { message.channel.send(m) })
  }
}

async function attackMonster(player, monster) {
  let messages = []
  let user = await User.findByPk(player.id, { include: { model: Inventory }})

  if(user) {
    if(user.currentHitPoint > 0) {      
      let weapon = await getUserEquipedItem(user.id, 'weapon')

      if(!weapon) {
        messages.push(`🤨 ${user.username} go in an adventure without a weapon !`)
        return { messages, monster }
      }

      // Random event
      if(triggerEvent()) {
        let diceValue = throwDice(user.hitDie)
        await user.update({ currentHitPoint: user.currentHitPoint - diceValue })        
        let randomMessages = [
          `⚔ ${user.username} slides on a big :shit: and hit his head, loosing - ${diceValue} ❤ !`,
          `⚔ ${user.username} hit himself with his ${weapon.name}, loosing - ${diceValue} ❤ !`
        ]
        messages.push(randomMessages[random(0, randomMessages.length - 1)])
      } else {
        let randomValue = throwDice()
        let armorDamage = monster.armorClass - randomValue
        let firstDamageDice = Math.round(throwDice(user.hitDie) * weapon.damage / user.hitDie)
        let secondDamageDice =  Math.round(throwDice(user.hitDie) * weapon.damage / user.hitDie)

        switch(randomValue) {
        case 20:          
          messages.push(`⚔ ${user.username} made a critical hit with his ${weapon.name} ! (:game_die: ${firstDamageDice} + :game_die: ${secondDamageDice} => 🗡 ${firstDamageDice + secondDamageDice})`)
          monster.currentHitPoint = monster.currentHitPoint - (firstDamageDice + secondDamageDice)
          break
        case 1:
          messages.push(`⚔ ${user.username} missed the ${monster.name} ! (:game_die: ${randomValue})`)
          break
        default :
          if(armorDamage < 0 ) {
            messages.push(`⚔ ${user.username} hit the ${monster.name} (🛡 ${monster.armorClass} - :game_die: ${randomValue} => 🗡 ${armorDamage})`)
            monster.currentHitPoint = monster.currentHitPoint - firstDamageDice
          } else {
            messages.push(`⚔ ${user.username} hit the ${monster.name} but his armor prevent any damage ! (🛡 ${monster.armorClass} - :game_die: ${randomValue} => 🗡 0)`)
          }
        }
    
        if(monster.currentHitPoint <= 0) {
          messages.push(`🎺 ${user.username} killed the ${monster.name} !`)

          if(triggerEvent()) {
            let items = await Item.findAll()
            let item = items[random(0, items.length - 1)]
            await Inventory.create({ itemId: item.id, userId: user.id})
            messages.push(`🎁 ${user.username} got a ${item.name} !`)
          }
        }
      }
    } else {
      messages.push(`☠ ${user.username} is dead !`)
    }
    return { messages, monster }
  } else {
    throw Error('User not found !')
  }
}

async function attackPlayer(player, monster) {
  let messages = []
  let user = await User.findByPk(player.id, { include: { model: Inventory, where: { equiped: true } }})

  if(user) {
    let userCurrentHitPoint = user.currentHitPoint
    let armor = await getUserEquipedItem(user.id, 'armor')
    let shield = await getUserEquipedItem(user.id, 'shield')

    if(monster.currentHitPoint > 0) {
      let randomValue = throwDice()        
      let armorClass = armor ? armor.armorClass : 0 + shield ? shield.armorClass : 0
      let armorDamage = armorClass - randomValue
      let firstDamageDice = Math.round(throwDice(monster.dice) * monster.strength / monster.dice)
      let secondDamageDice = Math.round(throwDice(monster.dice) * monster.strength / monster.dice)

      switch(randomValue) {
      case 20:          
        messages.push(`⚔ ${monster.name} made a critical hit to ${user.username} ! (:game_die: ${firstDamageDice} + :game_die: ${secondDamageDice} => 🗡 ${firstDamageDice + secondDamageDice})`)
        userCurrentHitPoint = userCurrentHitPoint - (firstDamageDice + secondDamageDice)
        break
      case 1:
        messages.push(`⚔ ${monster.name} missed ${user.username} ! (:game_die: ${randomValue})`)
        break
      default :
        if(armorDamage < 0 ) {
          messages.push(`⚔ ${monster.name} hit ${user.username} (🛡 ${armorClass} - :game_die: ${randomValue} => 🗡 ${armorDamage})`)
          userCurrentHitPoint = userCurrentHitPoint - firstDamageDice
        } else {
          messages.push(`⚔ ${monster.name} hit ${user.username} but his armor prevent any damage ! (🛡 ${armorClass} - :game_die: ${randomValue} => 🗡 0)`)
        }
      }
      
      if(userCurrentHitPoint <= 0) {
        messages.push(`☠ ${monster.name} killed ${user.username} !`)
      }

      await user.update({ currentHitPoint: userCurrentHitPoint})
    }
  }
  return { messages }
}