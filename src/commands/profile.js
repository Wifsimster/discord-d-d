const Discord = require('discord.js')
const { getMaxExperience } = require('../utils')

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
          { name: 'Level', value: `${user.level} (${(user.experience/getMaxExperience(user.level)).toFixed(1)}%)`, inline: true },
          { name: 'XP', value: `${user.experience}/${getMaxExperience(user.level)}`, inline: true },
          { name: 'HP', value: `${user.currentHitPoint < 0 ? 0 : user.currentHitPoint}/${user.maxHitPoint}`, inline: true }
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
      let fields = [`🪙 ${user.coins}`, `💎 ${user.gemstones}`]
      messageEmbed.addField('Wealth', fields.join('\n'), true)

      // Equipments
      if(items.length > 0) {
        fields = []
        await Promise.all(items.map(async item => {
          let inventory = await Inventory.findOne({ where: { userId: user.id, itemId: item.id }})
          switch(item.objectType) {
          case 'armor':
            fields.push(`\`${item.name}\` 🛡 ${item.armorClass} :tools: ${inventory.condition} %`)
            break
          case 'shield':
            fields.push(`\`${item.name}\` 🛡 ${item.armorClass} :tools: ${inventory.condition} %`)
            break
          case 'weapon':
            fields.push(`\`${item.name}\` ⚔ ${item.damage} :tools: ${inventory.condition} % ${item.twoHanded ? '(Two Handed)' : '' }`)
            break
          default:
            if(item.name === 'Torch') {
              fields.push(`\`${item.name}\` :fire:`)
            } else {
              fields.push(`\`${item.name}\``)
            }
          }
        }))
        messageEmbed.addField('Equipments', fields.join('\n'), true)
      }
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}