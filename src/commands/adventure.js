const User = require('../models/user')
const Armor = require('../models/armor')
const Shield = require('../models/shield')
const Weapon = require('../models/weapon')
const Environment = require('../models/environment')

const { random, throwDice, randomDamage, initializeMonster } = require('../utils')

module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  usage: '[commande name]',
  cooldown: 5,
  async execute(message) {
    let mentions = message.mentions.users.array()
    
    let players = []
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
        
        if(environment) {
          message.channel.send(`🏕 Your journey in the ${environment.name.toLowerCase()} started ${players.map(user => { return user }) }`)
        }
        
        // User event trigger
        let player = players[random(0, players.length - 1)]
        let triggers = [`🤨 ${player.username} see something ...`, `🤫 ${player.username} heard something ...`]
        let randomTrigger = triggers[random(0, triggers.length - 1)]
        message.channel.send(randomTrigger)

        let monster = await initializeMonster(environment.id)

        if(monster) {
          message.channel.send(`⚔ A ${monster.name} attack your group ! (🗡 ${monster.strength}  🛡 ${monster.armorClass}  ❤ ${monster.maxHitPoint})`)

          // while(monster.currentHitPoint > 0) {
          let index = 0
          while(index < players.length && monster.currentHitPoint > 0) {
            let currentPlayer = players[index]
            let results = await attackMonster(currentPlayer, monster)

            monster = results.monster

            console.log(monster.currentHitPoint, monster.maxHitPoint)

            results.messages.map(item => {
              message.channel.send(item)
            })
              
            // await attackPlayer(currentPlayer, monster)

            if(currentPlayer.currentHitPoint <= 0) { players = players.splice(index, 1) }

            if(index === players.length - 1) {
              index = 0
            } else {
              index++
            }
          }
          // }

          // Give monster XP to players
          await Promise.all(players.map(async player => {
            let user = await User.findByPk(player.id).catch(err => console.error(err))

            if(user.experience + monster.challenge > user.level * 100) {
              let d10Value = throwDice(10)

              // Level up
              if([4, 6, 8, 12, 14, 16, 19].includes(user.level + 1)) {
                // TODO : User can gain +2 aptitudes point
              }

              let hp = user.hitPoint + d10Value
              user.update({ level: user.level + 1, experience: 0, maxHitPoint: hp, currentHitPoint: hp })
              message.channel.send(`🍾 ${player.username} leved up !`)
            } else {
              user.update({ experience: user.experience + monster.challenge })
            }
          }))

          message.channel.send(`${players.map(player => player.username) } got ${monster.challenge} XP !`)          
        }
      }
      else {
        message.channel.send(`It's dangerous to go alone in an adventure ${message.author} ! Bring some friends next time.`)
      }
    } else {
      message.channel.send(`☠ ${message.author} you are dead, dude !`)
    }
  }
}

async function attackMonster(player, monster) {
  let messages = []
  let user = await User.findByPk(player.id)
  let weapon = await Weapon.findByPk(user.weaponId)

  if(user) {
    if(user.currentHitPoint > 0) {
      // Random event
      if(throwDice() === throwDice()) {
        let diceValue = throwDice()
        await user.update({ currentHitPoint: user.currentHitPoint - diceValue })        
        let randomMessages = [
          `⚔ ${user.username} slides on a big :shit: and hit his head, losing ${diceValue} HP !`,
          `⚔ ${user.username} hit himself with his ${user.weapon} , losing ${diceValue} HP !`
        ]
        messages.push(randomMessages[random(0, randomMessages.length - 1)])
      } else {
        let randomValue = throwDice(user.dice)          
        let damage = monster.armorClass - randomValue

        switch(randomValue.dice) {
        case 20:
          messages.push(`⚔ ${user.username} made a critical hit with his ${weapon.name} ! (:game_die: ${randomValue} = 🗡 ${randomValue})`)
          monster.currentHitPoint = monster.currentHitPoint - randomValue
          break
        case 1:
          messages.push(`⚔ ${user.username} missed the ${monster.name} ! (:game_die: ${randomValue})`)
          break
        default :
          if(damage < 0 ) {
            messages.push(`⚔ ${user.username} hit the ${monster.name} (🛡 ${monster.armorClass} - :game_die: ${randomValue} = 🗡 ${damage})`)
            monster.currentHitPoint = monster.currentHitPoint + damage
          } else {
            messages.push(`⚔ ${user.username} hit the ${monster.name} but his armor prevent any damage ! (🛡 ${monster.armorClass} - :game_die: ${randomValue} = 🗡 0)`)
          }
        }
    
        if(monster.currentHitPoint <= 0) {
          messages.push(`🎺 ${user.username} killed the ${monster.name} !`)
        }
      }
    } else {
      messages.push(`☠ ${user.username} is dead !`)
    }
  }
  return { messages, monster }
}

async function attack(message, player, monster) {          
  let user = await User.findByPk(player.id).catch(err => console.error(err))
  
  if(user) {
    if(user.currentHitPoint > 0) {

      // Random event
      if(throwDice() === throwDice()) {
        let diceValue = throwDice()
        await user.update({ currentHitPoint: user.currentHitPoint - diceValue })        
        let randomMessages = [
          `:dagger: ${user.username} slides on a big :shit: and hit his head, losing ${diceValue} HP !`,
          `:dagger: ${user.username} hit himself with his ${user.weapon} , losing ${diceValue} HP !`
        ]
        message.channel.send(randomMessages[random(0, randomMessages.length - 1)])
      } else {
        // Player attack
        let diceValue = throwDice()
        let damageValue = randomDamage(diceValue, user.strength)
        monster.hitPoint = monster.hitPoint - damageValue
    
        if(monster.hitPoint > 0) { 
          if(damageValue > 0) {
            message.channel.send(`:dagger: ${user.username} hit the ${monster.name} and made ${damageValue} damage (:game_die: ${diceValue}) - ${monster.size} ${monster.name} [${monster.currentHitPoint}/${monster.maxHitPoint}]`)
          } else {
            message.channel.send(`:dagger: ${user.username} tried to hit the ${monster.name} but missed ! (:game_die: ${diceValue})`)
          }

          // Monster attack
          diceValue = throwDice(monster.dice)           
          damageValue = randomDamage(diceValue, monster.strength)
          user = await User.findByPk(player.id).catch(err => console.error(err))
          let playerHp = user.currentHitPoint - damageValue
          if(playerHp < 0) { playerHp = 0 }
      
          if(damageValue > 0) {
            message.channel.send(`:dagger: ${monster.size} ${monster.name} hit ${user.username} and made ${damageValue} damage (:game_die: ${diceValue}) - ${user.username} [${playerHp}/${user.maxHitPoint}]`)
          } else {
            message.channel.send(`:dagger: ${monster.size} ${monster.name} tried to hit ${user.username} but missed ! (:game_die: ${diceValue})`)
          }

          await user.update({ currentHitPoint: playerHp}).catch(err => { console.error(err) })
        } else {
          let weapon = await Weapon.findByPk(user.weaponId)
          if(weapon) {
            message.channel.send(`☠ ${user.username} killed the ${monster.name} with his ${weapon.name.toLowerCase()} (:game_die: ${diceValue})! Yeah !`)
          }
        }  
      }    
    } else {
      message.channel.send(`☠ ${user.username} is dead !`)
    }
  } else {
    message.channel.send(`🏷 ${player.username} has not created his character yet !`)
  }
  return monster
}