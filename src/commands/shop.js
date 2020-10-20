const Discord = require('discord.js')

const Item = require('../models/item')

module.exports = {
  name: 'shop',
  description: 'Shop',
  async execute(message, args) {
    let page = 1
    let limit = 10
    let type = 'weapon'

    if(args[0]) {
      type = args[0]
    }
    
    if(args[1]) {
      page = args[1]
    }

    let count = await Item.count({ where: { objectType: type } })
    let maxPages = Math.ceil(count/limit)
    let items = await Item.findAll({ where: { objectType: type }, order: [[ 'cost' ]], offset: ((page - 1) * limit), limit: limit })
      
    let messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Shop')

    if(items.length > 0) {
      let fields = []
      items.map(item => {
        switch(item.objectType) {
        case 'armor':
          fields.push(`${item.cost} 🪙 | \`${item.name}\` (🛡 ${item.armorClass} 🪨 ${item.weight})`)
          break
        case 'shield':
          fields.push(`${item.cost} 🪙 | \`${item.name}\` (🛡 ${item.armorClass} 🪨 ${item.weight}`)
          break
        case 'weapon':
          fields.push(`${item.cost} 🪙 | \`${item.name}\` (🗡 ${item.damage} 🪨 ${item.weight} ${item.twoHanded ? '(Two handed)' : '' }`)
          break
        default:
          fields.push(`${item.name}`)
        }
      })    
      messageEmbed.addField(`${type.toUpperCase()} ${page}/${maxPages}`, fields.join('\n'), true)
    } else {
      messageEmbed.addField('Items', 'Such an empty shop !', true)
    }
    
    message.channel.send(messageEmbed)
  } 
}