const Monster = require('../models/monster')
const User = require('../models/user')

const ENVIRONEMENT = 'forest'
const ATTACK_MATRIX_01 = [...Array(20).keys()]
const DICE = 20

async function isPlayerAlive(player) {
  let user = await User.findByPk(player.id)
  return user && user.hitPoint > 0            
}

async function isSomeoneStillAlive(players) {
  let alive = await Promise.all(players.map(async player => {
    return await isPlayerAlive(player)
  }))

  return alive.filter(item => item)
}

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
        if(user && user.hitPoint > 0) { 
          players.push(mention) 
        }
      }))

      if(players.length > 1) {
        message.channel.send(`🏕 Your journey in the ${ENVIRONEMENT} start ${players.map(user => { return user }) }`)
        
        // User event
        let player = players[(Math.floor(Math.random() * (players.length - 1)))]
        message.channel.send(`🔍 ${player.username} see something ...`)

        // Monster
        let monsters = await Monster.findAll({ where: { challengeRange: 0 }})
        let monster = monsters[Math.floor(Math.random() * (monsters.length - 1))]

        if(monster) {
          message.channel.send(`⚔ A ${monster.size.toLowerCase()} ${monster.name} attack your group ! Be aware ${monster.name.toLowerCase()} can ${monster.action.toLowerCase()} !`)

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
              user.update({ level: user.level + 1, experience: 0 })
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
    if(user.hitPoint > 0) {
      // Player attack

      // Random event
      if(Math.floor((Math.random() * DICE) + 1) === Math.floor((Math.random() * DICE) + 1)) {
        message.channel.send(`:dagger: ${player.username} slides on a big :shit: and missed his turn !`)
      } else {
        let playerMaxHp = user.constitution * 10
        let diceValue = Math.floor((Math.random() * DICE) + 1)
        let attackValue = Math.round(ATTACK_MATRIX_01[diceValue - 1] * user.strength / 10)
        monster.hitPoint = monster.hitPoint - attackValue
    
        if(monster.hitPoint > 0) { 
          if(attackValue > 0) {
            message.channel.send(`:dagger: ${player.username} hit the ${monster.size.toLowerCase()} ${monster.name} and made ${attackValue} damage (:game_die: ${diceValue}) - ${monster.size} ${monster.name} [${monster.hitPoint}/${monster.maxHitPoint}]`)
          } else {
            message.channel.send(`:dagger: ${player.username} tried to hit the ${monster.size.toLowerCase()} ${monster.name} but missed !`)
          }

          // Monster attack
          diceValue = Math.floor((Math.random() * monster.dice) + 1)            
          attackValue = Math.round(ATTACK_MATRIX_01[diceValue - 1] * monster.strength / 10)
          let playerHp = user.hitPoint - attackValue
          if(playerHp < 0) { playerHp = 0 }
      
          if(attackValue > 0) {
            message.channel.send(`:dagger: ${monster.size} ${monster.name} hit ${player.username} and made ${attackValue} damage (:game_die: ${diceValue}) - ${player.username} [${playerHp}/${playerMaxHp}]`)
          } else {
            message.channel.send(`:dagger: ${monster.size} ${monster.name} tried to hit ${player.username} but missed !`)
          }

          await user.update({ hitPoint: playerHp}).catch(err => { console.error(err) })
        } else {
          message.channel.send(`☠ ${player.username} killed the ${monster.size.toLowerCase()} ${monster.name} with his ${user.weapon.toLowerCase()} (:game_die: ${diceValue})! Yeah !`)
        }  
      }    
    } else {
      message.channel.send(`☠ ${player.username} is dead !`)
    }
  } else {
    message.channel.send(`🏷 ${player.username} has not created his character yet !`)
  }
  return monster
}