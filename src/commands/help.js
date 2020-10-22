const Discord = require('discord.js')

module.exports = {
  name: 'help',
  description: 'Forme more info: beta help [command/item/event]',
  aliases: ['h'],
  cooldown: 5,
  usage: '[commande name]',
  execute(message) {
    let messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Commands')
      .setDescription('Add `beta` before any command')
      .addFields(
        { name: 'Characters', value: '`create`, `destroy`, `profile`, `top`' },
        { name: 'Fighting commands', value: '`adventure`, `fight`, `heal`' },
        { name: 'Inventory', value: '`inventory`, `equip`, `unequip`, `shop`, `buy`, `repair`' },
        { name: 'Items', value: '`item' },
        { name: 'Interactions', value: '`steal`, `charity`, `prostitute`' },
        { name: 'Utilities', value: '`wololo`, `alive`' }
      )    
    message.channel.send(messageEmbed)
  }
}