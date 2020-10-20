const Discord = require('discord.js')

const User = require('../models/user')
const Item = require('../models/item')
const Inventory = require('../models/inventory')

module.exports = {
  name: 'iventory',
  description: 'Inventory',
  aliases: ['i'],
  async execute(message, args) {
    let target

    if(args[0]) {
      target = message.mentions.users.first()
    } else {
      target = message.author
    }

    let user = await User.findByPk(target.id, { include: Inventory, where: { equiped: false } })

    if(user) {
      
      let items = await Promise.all(user.inventories.map(async inventory => {
        return await Item.findByPk(inventory.itemId)
      }))

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s inventory`, target.displayAvatarURL(), 'https://discord.js.org')
        .setThumbnail(target.displayAvatarURL())

      // Equipments
      let fields = []
      items.map(item => {
        switch(item.objectType) {
        case 'armor':
          fields.push(`${item.name} 🛡 ${item.armorClass}`)
          break
        case 'shield':
          fields.push(`${item.name} 🛡 ${item.armorClass}`)
          break
        case 'weapon':
          fields.push(`${item.name} ⚔ ${item.damage}`)
          break
        default:
          fields.push(`${item.name}`)
        }
      })
    
      messageEmbed.addField('Equipments', fields.join('\n'), true)
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}