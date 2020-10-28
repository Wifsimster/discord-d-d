const User = require('../models/user')
const Environment = require('../models/environment')

const { canParticipate } = require('../utils/user')
const { combatTriggerMessage } = require('../utils')
const { foundItemEvent } = require('../utils/item')
const { groupFightMonster } = require('../utils/fight')

module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  cooldown: 5,
  async execute(message) {
    let mentions = message.mentions.users.array()    
    let group = []
    let messages = []
    let leader = await User.findByPk(message.author.id)

    if(leader && leader.currentHitPoint > 0) { 
      let results = await canParticipate(message.author.id)
      if(results.value) { group.push(message.author) } 
      else { messages.push(results.message) }

      await Promise.all(mentions.map(async mention => {      
        let results = await canParticipate(mention.id)
        if(results.value) { group.push(mention) } 
        else { messages.push(results.message) }
      }))      

      if(group.length > 1) {
        let environment = await Environment.findByPk(leader.environmentId)
        messages.push(`🏕 Your journey in the **${environment.name.toLowerCase()}** started ${group.map(user => { return user }) }`)
        
        let result = await foundItemEvent(group)
        if(result) { messages.push(result) }

        messages.push(combatTriggerMessage(group))
        
        let results = await groupFightMonster(group, environment.id)
        messages = [...messages, ...results.messages]
        group = results.group
      }
      else {
        messages.push(`It's dangerous to go alone in an adventure **${message.author}** ! Bring some friends next time.`)
      }
    } else {
      messages.push(`☠ **${message.author}** you are dead, dude !`)
    }
    messages.map(m => { message.channel.send(m) })
  }
}