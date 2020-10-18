const Discord = require('discord.js')

module.exports = {
  name: 'help',
  description: 'Forme more info: beta help [command/item/event]',
  aliases: ['h'],
  usage: '[commande name]',
  execute(message) {
    
    let messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Commands')
      .setDescription('Add `beta` before any command')
      .addFields(
        { name: 'Characters', value: '`create`, `profile`, `top`' },
        { name: 'Fighting commands', value: '`adventure`, `heal`' }
      )
    
    message.channel.send(messageEmbed)
  }
}