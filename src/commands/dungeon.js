const User = require('../models/user')
const Item = require('../models/item')
const Inventory = require('../models/inventory')

const { savingThrow, getUserEquipedItem, canMove } = require('../utils')

module.exports = {
  name: 'dungeon',
  aliases: ['dg'],
  cooldown: 5,
  async execute(message) {
    let mentions = message.mentions.users.array()    
    let group = []
    let messages = []

    // Select participants
    let results = await canParticipate(message.author.id)
    if(results.value) {      
      group.push(message.author)
    } else {
      message.push(`${results.message}`)
    }
    await Promise.all(mentions.map(async mention => {
      let results = await canParticipate(mention.id)
      if(results.value) {      
        group.push(mention)
      } else {
        message.push(`${results.message}`)
      }
    }))

    if(group.length > 0) {
      messages.push(`**${group}** enter in a dungeon !`)
      // TODO
    } else {
      messages.push(`**${message.author.username}** you can't go in a dungeon without a group !`)
    }

    messages.map(m => { message.channel.send(m) })
  }
}

async function canParticipate(userId) {
  let user = await User.findByPk(userId)

  if(user) {
    if(user.currentHitPoint === user.maxHitPoint) {
      if(canMove(userId)) {
        let weapon = await getUserEquipedItem(user.id, 'weapon')
        if(weapon) {
          return { value: true }
        } else {
          return { message: `**${user.username}** you don't have a weapon equiped !`, value: false }
        }
      } else {
        return { message: `**${user.username}** you are to heavy to move !`, value: false }
      }
    } else {
      return { message: `**${user.username}** you are not full life !`, value: false }
    }
  } else {
    return { message: `**${user.username}** doesn't have a character yet !`, value: false }
  }

}