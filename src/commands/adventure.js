const User = require('../models/user')
const Environment = require('../models/environment')

const { canParticipate } = require('../utils/user')
const { giveExperience } = require('../utils/level')
const { initializeMonster } = require('../utils/monster')
const { random, combatTriggerMessage } = require('../utils')
const { foundItemEvent } = require('../utils/item')
const { decrementEquipedItemsCondition } = require('../utils/equipment')
const { attackMonster, attackPlayer } = require('../utils/fight')

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

        let monster = await initializeMonster(environment.id)

        if(monster) {
          messages.push(`:crossed_swords: A **${monster.name}** attack your group ! (🗡 ${monster.strength}  :shield: ${monster.armorClass}  ❤ ${monster.maxHitPoint})`)

          let index = 0
          while(index < group.length && monster.currentHitPoint > 0) {
            let currentPlayer = group[index]
            
            let results = await attackMonster(currentPlayer, monster)
            messages = [...messages, ...results.messages]      
            monster = results.monster            
              
            results = await attackPlayer(currentPlayer, monster)
            messages = [...messages, ...results.messages]
            
            let user = await User.findByPk(currentPlayer.id)
           
            if(user.currentHitPoint <= 0) {
              await decrementEquipedItemsCondition(user.id) 
              group.splice(index, 1)
            }

            if(index === group.length - 1) { index = 0 } else { index++ }
          }

          if(group.length > 0) {
            // Give monster XP to group          
            await Promise.all(group.map(async player => {
              let results = await giveExperience(player, monster)
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
    messages.map(m => { message.channel.send(m) })
  }
}