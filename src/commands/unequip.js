const Inventory = require('../models/inventory')

const { getItem } = require('../utils')

module.exports = {
  name: 'unequip',
  description: 'Unequipe item',
  usage: '[commande name]',
  cooldown: 5,
  async execute(message, args) {
    let author = message.author

    if(args[0]) {
      let item = await getItem(args[0])

      if(item) {
        let inventory = await Inventory.findOne( { where: { userId: author.id, itemId: item.id } })
        if(inventory) {
          await inventory.update({ equiped: false })
          message.channel.send(`${author.username} unequiped his \`${item.name}\` !`)
        } else {
          message.channel.send(`${author.username} you don't have this item ${item.name} !`)
        }        
      } else {
        message.channel.send(`${author.username} no item is called ${args[0]} !`)
      }
    } else {
      message.channel.send(`${author.username} you need to add the name of the item !`)
    }
  }
}