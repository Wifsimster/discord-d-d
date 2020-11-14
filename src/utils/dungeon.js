const User = require('../models/user')
const Group = require('../models/group')
const Environment = require('../models/environment')

const { heal } = require('./heal')
const { getRandomItem } = require('./item')
const { random, throwDice } = require('./utils')
const { groupFightMonster, randomDamage } = require('./fight')
const { canParticipate, decrementUserCurrentHitPoint } = require('./user')

function getRandomPlayer(group) {
  if(group && group.length > 0) {
    return group[random(0, group.length - 1)]
  }
  return null
}

function dungeonCombatMessage(group) {
  let player = getRandomPlayer(group)
  let triggers = [`🤨 **${player.username}** open a door and see something in the dark ...`, 
    `🤫 **${player.username}** heard something on the other side of the room...`, 
    `:hushed: **${player.username}** come face to face with something ...`
  ]
  return triggers[random(0, triggers.length - 1)]
}

async function chest(group) {
  let messages = []
  let item
  let coins
  let player = getRandomPlayer(group)
  let user = await User.findByPk(player.id)

  messages.push(`:door: **${player.username}** open a door and found a cheast in the middle of the room...`)
  
  if(random(0, 1)) {
    item = await getRandomItem(user.id)
  }
  if(random(0, 1)) {
    coins = random(1, throwDice(user.throwDice) * user.level)
  }

  if(item && coins) {
    messages.push(`🎁 **${player.username}** open the chest and found a \`${item.name}\` & **${coins}** :coin: !`)
  } else {
    if(item) {
      messages.push(`🎁 **${player.username}** open the chest and found a \`${item.name}\` !`)
    }
    if(coins) {
      messages.push(`🎁 **${player.username}** open the chest and found **${coins}** :coin: !`)
    }
  }

  if(!item && !coins) {
    let damage = await randomDamage(player.id)    
    if(damage) {
      user.update({ currentHitPoint: user.currentHitPoint - damage })
      messages.push(`:boom: **${player.username}** open the chest and loose - ${damage} :heart:, it was a trap !`)
    }
  }

  return { messages }
}

async function trap(group) {
  let messages = []
  let player = getRandomPlayer(group)

  messages.push(`:mouse_trap: **${player.username}** walked on a trap...`)
  
  let target = getRandomPlayer(group)
  let damage = await randomDamage(target.id)

  if(random(0, 1)) {
    await decrementUserCurrentHitPoint(target.id, damage)
    messages.push(`**${player.username}** avoided the trap, but **${target.username}** take it in the face ! Loosing ${damage} :heart:`)
  } else {
    await decrementUserCurrentHitPoint(player.id, damage)
    messages.push(`**${player.username}** take it in the face ! Loosing ${damage} :heart:`)
  }

  return { messages }
}

async function handleDungeon(message) {
  if(message.content.startsWith('Who is ready to enter the')) {
    message.react('👍')

    const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot && user.id !== message.author.id
    
    message
      .awaitReactions(filter, { time: 15000, errors: ['time'] })
      .then(collected => {
        console.log(collected)
      }).catch(collected => {
        if(collected.size > 0) {
          let group = collected.array()
        } else {
          message.channel.send('No one respond to the call !')
        }
      })

    // const collector = message.createReactionCollector(filter, { time: 15000 })

    // collector.on('collect', async(reaction, user) => {
    //   let results = await canParticipate(user.id)
    //   if(results.value) {
    //     group.push(user)
    //   } else {
    //     message.channel.send(results.message)
    //   }
    // })
    
    // return collector.on('end', async() => {      
    //   if(group.length > 0) {
    //     let environment = await Environment.findOne({ where: { name: 'Forest' }})
    //     message.channel.send(`:synagogue: **${group}** enter the **${environment.name}** dungeon !`)
    //     await firstDay(message)
    //     return group
    //   } else {
    //     message.channel.send('No one is ready !')
    //   }
    // })
  }
}

async function firstDay(message) {
  message.channel.send('🏕 First day in the dungeon. Have a great day adventurers !')  
  message.channel.send('Who will enter the room first ?') 
  
  // let results
  // let i = 1
  // let nbRooms = 4
  // let messages = []
  // let rooms = ['chest', 'combat', 'trap']

  // while(i <= nbRooms) {
  //   messages.push(`=======================\n:thought_balloon: **Room : ${i}/${nbRooms}**\n=======================`)

  //   let room = rooms[random(0, rooms.length - 1)]

  //   switch(room) {
  //   case 'combat':
  //     messages.push(dungeonCombatMessage(group))
  //     results = await groupFightMonster(group, environment.id)    
  //     break
  //   case 'chest':
  //     results = await chest(group)
  //     break
  //   case 'trap':
  //     results = await trap(group)
  //     break
  //   default: 
  //   // nothing
  //   }
  //   messages = [...messages, ...results.messages]
  //   i++
  // }

  // messages.push('=======================\n:zzz: **It\'s time to recover adventurers !**')  
  // await Promise.all(group.map(async player => { 
  //   let results = await heal(player.id)    
  //   messages = [...messages, ...results.messages]
  // }))
  
  // return { messages, group }
}

async function enterRoom(message, group, leader) {
  let rooms = ['chest', 'combat', 'trap']
  let room = rooms[random(0, rooms.length - 1)]

  switch(room) {
  case 'combat':
    message.channel.send(dungeonCombatMessage(group))
    results = await groupFightMonster(group, environment.id)    
    break
  case 'chest':
    results = await chest(group)
    break
  case 'trap':
    results = await trap(group)
    break
  default: 
      // nothing
  }
}

async function handleRoom(message, group) {
  if(message.content === 'Who will enter the room first ?') {
    message.react('✋')
    const filter = (reaction, user) => reaction.emoji.name === '✋' && !user.bot && user.id !== message.author.id
  
    // message.channel.send(`=======================\n:thought_balloon: **Room : ${i}/${nbRooms}**\n=======================`)

    message
      .awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        let reactions = collected.array()
        let player = reactions[0].client.user
        let leader = await User.findByPk(player.id)

        await enterRoom(message, group, leader)
      })
  }
}

module.exports = { chest, trap, handleDungeon, handleRoom }