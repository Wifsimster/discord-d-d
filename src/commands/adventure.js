const Monster = require('../models/monster')
const User = require('../models/user')
const { Op } = require('sequelize')

const { random, throwDice, randomDamage } = require('../utils')

const ENVIRONMENT = 'forest'

module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  usage: '[commande name]',
  cooldown: 5,
  async execute(message) {
    let mentions = message.mentions.users.array()
    
    let players = []
    let user = await User.findByPk(message.author.id)
    if(user && user.hitPoint > 0) { 
      players.push(message.author) 

      // Keep user with character & life
      await Promise.all(mentions.map(async mention => {
        let user = await User.findByPk(mention.id)
        if(user && user.hitPoint > 0 && user.username !== message.author.username) {
          players.push(mention) 
        }
      }))

      if(players.length > 1) {
        message.channel.send(`🏕 Your journey in the ${ENVIRONMENT} started ${players.map(user => { return user }) }`)
        
        // User event trigger
        let player = players[random(0, players.length - 1)]
        let triggers = [`🤨 ${player.username} see something ...`, `🤫 ${player.username} heard something ...`]
        let randomTrigger = triggers[random(0, triggers.length - 1)]
        message.channel.send(randomTrigger)

        // Monster
        let monsters = await Monster.findAll({ where: { challengeRange: { [Op.between]: [0, 1] }, environment: 'Forest' }})
        let monster = monsters[random(0, monsters.length - 1)]

        if(monster) {
          message.channel.send(`⚔ A ${monster.name} (${monster.size.toLowerCase()} ${monster.type.toLowerCase()}) attack your group ! Be aware ${monster.name.toLowerCase()} can ${monster.action.toLowerCase()} !`)

          // Attack by player
          monster.maxHitPoint = monster.constitution * 10
          monster.hitPoint = monster.maxHitPoint

          while(monster.hitPoint > 0) {
            let index = 0
            while(index < players.length && monster.hitPoint > 0) {
              let currentPlayer = players[index++]
              monster = await attack(message, currentPlayer, monster)
              if(currentPlayer.hitPoint < 0) { players = players.splice(index, 1) }
            }
          }

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
              user.update({ level: user.level + 1, experience: 0, hitPoint: hp, currentHitPoint: hp })
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
            message.channel.send(`:dagger: ${user.username} hit the ${monster.name} and made ${damageValue} damage (:game_die: ${diceValue}) - ${monster.size} ${monster.name} [${monster.hitPoint}/${monster.maxHitPoint}]`)
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
            message.channel.send(`:dagger: ${monster.size} ${monster.name} hit ${user.username} and made ${damageValue} damage (:game_die: ${diceValue}) - ${user.username} [${playerHp}/${user.hitPoint}]`)
          } else {
            message.channel.send(`:dagger: ${monster.size} ${monster.name} tried to hit ${user.username} but missed ! (:game_die: ${diceValue})`)
          }

          await user.update({ currentHitPoint: playerHp}).catch(err => { console.error(err) })
        } else {
          message.channel.send(`☠ ${user.username} killed the ${monster.name} with his ${user.weapon.toLowerCase()} (:game_die: ${diceValue})! Yeah !`)
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