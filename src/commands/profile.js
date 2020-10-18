const Discord = require('discord.js')
const User = require('../models/user')

function getLevelByExperience(xp) {
  if(xp >= 0 && xp < 1000) { return { level: 1, min: 0, max: 1000 } }
  if(xp >= 1000 && xp < 3000) { return { level: 2, min: 1000, max: 3000 } }
  if(xp >= 3000 && xp < 6000) { return { level: 3, min: 3000, max: 6000 } }
  if(xp >= 6000 && xp < 10000) { return { level: 4, min: 6000, max: 10000 } }
  if(xp >= 1000 && xp < 15000) { return { level: 5, min: 1000, max: 15000 } }
  if(xp >= 15000 && xp < 21000) { return { level: 6, min: 15000, max: 21000 } }
  if(xp >= 21000 && xp < 28000) { return { level: 7, min: 21000, max: 28000 } }
  if(xp >= 28000 && xp < 36000) { return { level: 8, min: 28000, max: 36000 } }
  if(xp >= 36000 && xp < 45000) { return { level: 9, min: 36000, max: 45000 } }
  if(xp >= 45000 && xp < 55000) { return { level: 10, min: 45000, max: 55000 } }
  if(xp >= 55000 && xp < 66000) { return { level: 11, min: 55000, max: 66000 } }
  if(xp >= 66000 && xp < 78000) { return { level: 12, min: 66000, max: 78000 } }
  if(xp >= 78000 && xp < 91000) { return { level: 13, min: 78000, max: 91000 } }
  if(xp >= 91000 && xp < 105000) { return { level: 14, min: 91000, max: 105000 } }
  if(xp >= 105000 && xp < 120000) { return { level: 15, min: 105000, max: 120000 } }
  if(xp >= 120000 && xp < 136000) { return { level: 16, min: 120000, max: 136000 } }
  if(xp >= 136000 && xp < 153000) { return { level: 17, min: 136000, max: 153000 } }
  if(xp >= 153000 && xp < 171000) { return { level: 18, min: 153000, max: 171000 } }
  if(xp >= 171000 && xp < 190000) { return { level: 19, min: 171000, max: 190000 } }
  if(xp >= 190000) { return { level: 20, min: 190000 } }
}

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
      let level = getLevelByExperience(user.experience)

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s profile`, target.displayAvatarURL(), 'https://discord.js.org')
        .setTitle(`${user.race} ${user.class}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Level', value: `${level.level} (${(user.experience/level.max).toFixed(2)}%)`, inline: true },
          { name: 'XP', value: `${user.experience}/${level.max}`, inline: true },
          { name: 'HP', value: `${user.currentHitPoint}/${user.hitPoint}`, inline: true }
        )
        .addFields(
          { name: 'Charisma', value: `${user.charisma}`, inline: true },
          { name: 'Constitution', value: `${user.constitution}`, inline: true },
          { name: 'Dexterity', value: `${user.dexterity}`, inline: true },
          { name: 'Intelligence', value: `${user.intelligence}`, inline: true },
          { name: 'Strength', value: `${user.strength}`, inline: true },
          { name: 'Wisdom', value: `${user.wisdom}`, inline: true }
        )
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