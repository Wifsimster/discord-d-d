const Environment = require('../models/environment')

const { canParticipate } = require('./user')
const { giveExperience } = require('./level')
const { initializeMonster } = require('./monster')
const { random, combatTriggerMessage } = require('./utils')
const { foundItemEvent } = require('./item')
const { decrementEquipedItemsCondition } = require('./equipment')
const { attackMonster, attackPlayer } = require('./fight')

async function handleDungeon(message) {  
  if(message.content.startsWith('Who is ready to enter the')) {
    message.react('👍')
    let group = []

    const filter = (reaction, user) => {
      return reaction.emoji.name === '👍' && !user.bot && user.id !== message.author.id
    }
    
    const collector = message.createReactionCollector(filter, { time: 2000 })

    collector.on('collect', async(reaction, user) => {
      let results = await canParticipate(user.id)
      if(results.value) {
        group.push(user)
      } else {
        message.channel.send(results.message)
      }
    })
    
    collector.on('end', async() => {
      let environment = await Environment.findOne({ where: { name: 'Forest' }})

      if(group.length > 0) {
        message.channel.send(`:synagogue: **${group}** enter the **${environment.name}** dungeon !`)
        firstDay(group, environment)
      } else {
        message.channel.send('No one is ready !')
      }
    })
  }
}

async function firstDay(group, environment) {
  let messages = []

  let result = await foundItemEvent(group)
  if(result) { messages.push(result) }

  messages.push(combatTriggerMessage(group))
}

module.exports = { handleDungeon }