const Discord = require('discord.js')
const Keyv = require('keyv')
const keyv = new Keyv('sqlite://db.sqlite', { namespace: 'user' })
keyv.on('error', err => console.error('Keyv connection error:', err))

module.exports = {
  name: 'profile',
  description: 'Profile',
  aliases: ['p'],
  usage: '[beta profile]',
  async execute(message) {
    let author = message.author
    let user = await keyv.get('user')

    let messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`${message.author.username}'s profile`, author.displayAvatarURL(), 'https://discord.js.org')
      .setTitle(user.title)
      .setDescription(`${user.race} ${user.class}`)
      .setThumbnail(author.displayAvatarURL())
      .addField('Progression', '\u200b')
      .addFields(
        { name: 'Level', value: `${user.level} (0%)`, inline: true },
        { name: 'XP', value: `${user.xp}`, inline: true }
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
        { name: 'Weapon', value: `${user.armor}`, inline: true },
        { name: 'Shield', value: `${user.shield}`, inline: true },
        { name: 'Weapon', value: `${user.weapon}`, inline: true }
      )
      .addField('\u200b', '\u200b')
    
    message.channel.send(messageEmbed)
  }
}