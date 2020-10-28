const User = require('../models/user')
const Inventory = require('../models/inventory')

const { getItem } = require('../utils/item')

module.exports = {
  name: 'buy',
  description: 'Buy somthing in the store with your coins',
  cooldown: 5,
  async execute(message, args) {
    let number = args[1] || 1
    let user = await User.findByPk(message.author.id)

    if(args[0]) {
      let item = await getItem(args[0])

      if(item) {
        if(user.coins >= item.cost * number) {
          let inventory = await Inventory.findOne({ where: { itemId: item.id, userId: user.id }})
          if(inventory) {
            await inventory.increment('quantity', { by : number })
          } else {
            await Inventory.create({ quantity: number, userId: user.id, itemId: item.id })
          }
          await user.decrement('coins', { by: item.cost * number })
          message.channel.send(`**${message.author}** buy ${number} \`${item.name}\` for ${item.cost * number} 🪙 !`)
        } else {
          message.channel.send(`**${message.author}** you don't have ${item.cost * number} 🪙 !`)
        }
      } else {      
        message.channel.send(`Item not found \`${args[0]}\` !`)
      }
    } else {
      message.channel.send(`**${message.author}** you have to specified a item !`)
    }
  }
}