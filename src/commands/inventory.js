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

    let user = await User.findByPk(target.id, { include: Inventory })

    if(user) {      
      let items = await Promise.all(user.inventories.map(async inventory => {
        if(!inventory.equiped) {
          return await Item.findByPk(inventory.itemId)
        }
      }))

      items = items.filter(i => i)

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s inventory`, target.displayAvatarURL(), 'https://discord.js.org')
        .setThumbnail(target.displayAvatarURL())

      // Equipments
      let fields = []
      items.map((item, index) => {
        switch(item.objectType) {
        case 'armor':
          fields.push(`\`${index}\` - 🛡 ${item.name} (${item.armorClass})`)
          break
        case 'shield':
          fields.push(`\`${index}\` - 🛡 ${item.name} (${item.armorClass})`)
          break
        case 'weapon':
          fields.push(`\`${index}\` - ⚔ ${item.name} (${item.damage} ${item.damageType} damage) ${item.twoHanded ? '(Two handed)' : '' }`)
          break
        default:
          fields.push(`\`${index}\` - ${item.name}`)
        }
      })
    
      messageEmbed.addField('Inventories', fields.join('\n'), true)
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}