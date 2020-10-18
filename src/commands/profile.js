const Discord = require('discord.js')
const User = require('../models/user')

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
    
    let user = await User.findByPk(target.id)

    if(user) {
      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s profile`, target.displayAvatarURL(), 'https://discord.js.org')
        .setTitle(user.title)
        .setDescription(`${user.race} ${user.class}`)
        .setThumbnail(target.displayAvatarURL())
        .addField('Progression', '\u200b')
        .addFields(
          { name: 'Level', value: `${user.level} (0%)`, inline: true },
          { name: 'XP', value: `${user.experience}`, inline: true }
        )
        .addField('Abilities', '\u200b')
        .addFields(
          { name: 'Charisma', value: `${user.charisma}`, inline: true },
          { name: 'Constitution', value: `${user.constitution}`, inline: true },
          { name: 'Dexterity', value: `${user.dexterity}`, inline: true },
          { name: 'Intelligence', value: `${user.intelligence}`, inline: true },
          { name: 'Strength', value: `${user.strength}`, inline: true },
          { name: 'Wisdom', value: `${user.wisdom}`, inline: true }
        )
        .addField('Equipment', '\u200b')
        .addFields(
          { name: 'Weapon', value: `${user.armor || 'none' }`, inline: true },
          { name: 'Shield', value: `${user.shield || 'none' }`, inline: true },
          { name: 'Weapon', value: `${user.weapon || 'none' }`, inline: true }
        )
        .addField('\u200b', '\u200b')
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !`)
    }
  }
}