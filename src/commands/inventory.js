const Discord = require('discord.js')

const User = require('../models/user')
const Armor = require('../models/armor')
const Shield = require('../models/shield')
const Weapon = require('../models/weapon')
const Item = require('../models/item')

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
    
    let user = await User.findByPk(target.id)

    if(user) {
      let items = await Item.findAll({ where: { userId: user.id }})
      let weapons = []
      let shields = []
      let armors = []

      await Promise.all(items.map(async item => {
        if(item.armorId) {
          armors.push(await Armor.findByPk(item.armorId))
        }
        if(item.weaponId) {
          weapons.push(await Weapon.findByPk(item.weaponId))
        }
        if(item.shieldId) {
          shields.push(await Shield.findByPk(item.shieldId))
        }
      }))

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s inventory`, target.displayAvatarURL(), 'https://discord.js.org')
        .setThumbnail(target.displayAvatarURL())

      weapons.map(weapon => {
        messageEmbed.addField(weapon.name, `⚔  ${weapon.damage}`, true)
      })

      shields.map(shield => {
        messageEmbed.addField(shield.name, `🛡  ${shield.armorClass}`, true)
      })

      armors.map(armor => {
        messageEmbed.addField(armor.name, `🛡  ${armor.armorClass}`, true)
      })
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}