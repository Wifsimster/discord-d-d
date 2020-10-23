const User = require('../models/user')
const Class = require('../models/class')
const Item = require('../models/item')
const Inventory = require('../models/inventory')

module.exports = {
  name: 'reequip',
  async execute(message) {
    let user = await User.findByPk(message.author.id)

    if(user && user.id === '134047703343562752') {
      let target = await User.findByPk(message.mentions.users.first().id, { include: { model: Class }})

      if(target) {
        let weapon = await Item.findOne({ where: { name: target.class.weapon } })
        let armor = await Item.findOne({ where: { name: target.class.armor } })
        let shield = await Item.findOne({ where: { name: target.class.shield } })

        if(weapon) { await Inventory.create({ quantity: 1, equiped: true, userId: target.id, itemId: weapon.id }) }
        if(armor) { await Inventory.create({ quantity: 1, equiped: true, userId: target.id, itemId: armor.id }) }
        if(shield) { await Inventory.create({ quantity: 1, equiped: true, userId: target.id, itemId: shield.id }) }

        message.channel.send(`**${target.username}** reequiped !`) 
      } else {
        message.channel.send(`**${message.author}** doesn't have a character yet !\n\`beta create\` to create a character`) 
      }
    } else {
      message.channel.send(`**${message.author}** doesn't have a character yet !\n\`beta create\` to create a character`)  
    }
  }
}