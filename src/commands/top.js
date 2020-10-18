const Discord = require('discord.js')
const User = require('../models/user')

module.exports = {
  name: 'top',
  description: 'Top',
  usage: '[commande name]',
  cooldown: 5,
  async execute(message) {
    let users = await User.findAll({ order: [['experience', 'DESC']] })
    
    if(users) {      
      let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Leaderboard (Experience)')
      
      users.map((user, index) => {
        messageEmbed.addField(`${index + 1}.${user.username}`, `${user.experience} XP`)
      })  

      message.channel.send(messageEmbed)    
    }
  }
}