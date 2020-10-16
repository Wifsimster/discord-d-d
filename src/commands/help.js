const Discord = require('discord.js')

module.exports = {
  name: 'help',
  description: 'Forme more info: beta help [command/item/event]',
  usage: '[commande name]',
  execute(message) {
    
    let messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Commands')
      .setDescription('Add `beta` before any command')
      .addFields(
        { name: 'Statistics commands', value: '`profile` `inventory`, `professions`, `quest`, `cd`' },
        { name: 'Fighting commands', value: '`adventure`, `fight`, `heal`, `escape`' },
        // { name: 'Economy commands', value: '`shop`, `give`, `buy`, `sell`' },
      )
    
    message.channel.send(messageEmbed)
  }
}