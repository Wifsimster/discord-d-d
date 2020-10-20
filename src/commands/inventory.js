const Discord = require('discord.js')

const User = require('../models/user')
const Inventory = require('../models/inventory')

const { getUserUnequipItems } = require('../utils')

module.exports = {
  name: 'inventory',
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
      let items = await getUserUnequipItems(user.id)

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s inventory`, target.displayAvatarURL(), 'https://discord.js.org')
        .setThumbnail(target.displayAvatarURL())

      // Equipments
      if(items.length > 0) {
        let fields = []
        items.map(item => {
          switch(item.objectType) {
          case 'armor':
            fields.push(`🛡 \`${item.name}\` (${item.armorClass} armor class)`)
            break
          case 'shield':
            fields.push(`🛡 \`${item.name}\` (${item.armorClass} armor class)`)
            break
          case 'weapon':
            fields.push(`⚔ \`${item.name}\` (${item.damage} ${item.damageType}) ${item.twoHanded ? '(Two handed)' : '' }`)
            break
          default:
            fields.push(`${item.name}`)
          }
        })    
        messageEmbed.addField('🎒 Inventory', fields.join('\n'), true)
      } else {
        messageEmbed.addField('🎒 Inventory', 'Such an empty inventory !', true)
      }
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}