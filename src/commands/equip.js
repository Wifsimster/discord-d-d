const Inventory = require('../models/inventory')
const Item = require('../models/item')

module.exports = {
  name: 'equip',
  description: 'Equipe item',
  usage: '[commande name]',
  cooldown: 5,
  async execute(message, args) {
    let author = message.author

    if(args[0]) {
      let item = await Item.findOne({ where: { name: args[0] }})

      if(item) {
        let inventory = await Inventory.findOne( { where: { itemId: item.id } })
        if(inventory) {
          let equipedInventories = await Inventory.findAll({ where: { equiped: true }})

          await Promise.all(equipedInventories.map(async inventory => {
            let object = await Item.findByPk(inventory.itemId)
            if(object.objectType === item.objectType) {
              await inventory.update({ equiped: false })
            }
          }))

          await inventory.update({ equiped: true })
          message.channel.send(`${author.username} equiped his \`${item.name}\` !`)
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