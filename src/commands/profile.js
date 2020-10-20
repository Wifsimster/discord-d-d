const Discord = require('discord.js')
const { getLevelByExperience } = require('../utils')

const User = require('../models/user')
const Race = require('../models/race')
const Class = require('../models/class')
const Inventory = require('../models/inventory')
const Item = require('../models/item')

module.exports = {
  name: 'profile',
  description: 'Profile',
  aliases: ['p'],
  usage: '[beta profile]',
  async execute(message, args) {
    let target

    if(args[0]) {
      target = message.mentions.users.first()
    } else {
      target = message.author
    }
    
    let user = await User.findByPk(target.id, { include: Inventory })

    if(user) {
      let level = getLevelByExperience(user.experience)
      let race = await Race.findByPk(user.raceId)
      let classe = await Class.findByPk(user.classId)

      let items = await Promise.all(user.inventories.map(async inventory => {
        if(inventory.equiped) {
          return await Item.findByPk(inventory.itemId)
        }
      }))

      items = items.filter(i => i)

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s profile`, target.displayAvatarURL(), 'https://discord.js.org')
        .setTitle(`${race.name} ${classe.name}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Level', value: `${level.level} (${((user.experience - level.min)/level.max * 100).toFixed(1)}%)`, inline: true },
          { name: 'XP', value: `${user.experience}/${level.max}`, inline: true },
          { name: 'HP', value: `${user.currentHitPoint}/${user.maxHitPoint}`, inline: true }
        )
        .addFields(
          { name: 'Charisma', value: `${user.charisma}`, inline: true },
          { name: 'Constitution', value: `${user.constitution}`, inline: true },
          { name: 'Dexterity', value: `${user.dexterity}`, inline: true },
          { name: 'Intelligence', value: `${user.intelligence}`, inline: true },
          { name: 'Strength', value: `${user.strength}`, inline: true },
          { name: 'Wisdom', value: `${user.wisdom}`, inline: true }
        )
        
      // Wealth
      let fields = [`💰 ${user.coins}`, `💎 ${user.gemstones}`]
      messageEmbed.addField('Wealth', fields.join('\n'), true)

      // Equipments
      if(items) {
        fields = []
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
      }
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}