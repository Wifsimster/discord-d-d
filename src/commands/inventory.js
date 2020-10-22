const Discord = require('discord.js')

const User = require('../models/user')
const Inventory = require('../models/inventory')

const { getUserUnequipItems, determineValue } = require('../utils')

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

      let totalWeight = 0

      // Equipments
      if(items.length > 0) {
        let fields = []
        await Promise.all(items.map(async item => {
          let inventory = await Inventory.findOne({ where: { itemId: item.id, userId: user.id }})
          totalWeight += inventory.quantity * item.weight

          let cost = await determineValue(item.id)

          switch(item.objectType) {
          case 'consumable':
            fields.push(`${cost} 🪙 | ${inventory.quantity} \`${item.name}\` (${item.weight} 🪨)`)
            break
          case 'item':
            fields.push(`${cost} 🪙 | ${inventory.quantity} \`${item.name}\` (${item.weight} 🪨)`)
            break
          case 'armor':
            fields.push(`${cost} 🪙 | ${inventory.quantity} \`${item.name}\` (${item.armorClass} 🛡 ${item.weight} 🪨)`)
            break
          case 'shield':
            fields.push(`${cost} 🪙 | ${inventory.quantity} \`${item.name}\` (${item.armorClass} 🛡 ${item.weight} 🪨)`)
            break
          case 'weapon':
            fields.push(`${cost} 🪙 | ${inventory.quantity} \`${item.name}\` (${item.damage} ⚔  ${item.damageType}) ${item.twoHanded ? '(Two handed)' : '' } (${item.weight} 🪨)`)
            break
          default:
            fields.push(`${cost} 🪙 | ${inventory.quantity} ${item.name} (${item.weight} 🪨)`)
          }
        }))
        messageEmbed.addField(`Inventory (${totalWeight} 🪨)`, fields.join('\n'), true)
      } else {
        messageEmbed.addField('Inventory', 'Such an empty inventory !', true)
      }
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}