const User = require('../models/user')
const Inventory = require('../models/inventory')

const { getItem } = require('../utils')

module.exports = {
  name: 'repair',
  description: 'Repair a broken item',
  cooldown: 5,
  async execute(message, args) {
    let messages = []
    let user = await User.findByPk(message.author.id)

    if(args[0]) {
      let item = await getItem(args[0])
      if(item) {
        let inventoryItem = await Inventory.findOne({ where: { userId: user.id, itemId: item.id }})

        if(inventoryItem) {
          let cost = 100
          await inventoryItem.update({ condition: 100 })
          await user.decrement('coins', { by: cost })
          messages.push(`**${user.username}** repaired his \`${item.name}\` for ${cost} :coin: !`)  
        } else {
          messages.push(`**${user.username}** you don't have a \`${args[0]}\` in your inventory !`)  
        }
      } else {
        messages.push(`\`${args[0]}\` not found !`)
      }     
    } else {
      messages.push(`**${message.author}** you have to specified a item !`)
    }
    messages.map(m => message.channel.send(m))
  }
}