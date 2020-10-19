const Discord = require('discord.js')
const { getLevelByExperience } = require('../utils')

const User = require('../models/user')
const Race = require('../models/race')
const Class = require('../models/class')
const Armor = require('../models/armor')
const Shield = require('../models/shield')
const Weapon = require('../models/weapon')
const Ability = require('../models/ability')

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
      let race = await Race.findByPk(user.raceId)
      let classe = await Class.findByPk(user.classId)
      let armor = await Armor.findByPk(user.armorId)
      let shield = await Shield.findByPk(user.shieldId)
      let weapon = await Weapon.findByPk(user.weaponId)

      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${target.username}'s profile`, target.displayAvatarURL(), 'https://discord.js.org')
        .setTitle(`${race.name} ${classe.name}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Level', value: `${level.level} (${(user.experience/level.max * 100).toFixed(2)}%)`, inline: true },
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
        .addFields(
          { name: 'Armor', value: `${armor ? armor.name : 'none' }`, inline: true },
          { name: 'Shield', value: `${shield ? shield.name + ' 🛡 ' + shield.armorClass : 'none' }`, inline: true },
          { name: 'Weapon', value: `${weapon ? weapon.name + ' ⚔ ' + weapon.damage : 'none' }`, inline: true }
        )
    
      message.channel.send(messageEmbed)
    } else {
      message.channel.send(`${target} doesn't have a character yet !
\`beta create\` to create a character`)
    }
  }
}