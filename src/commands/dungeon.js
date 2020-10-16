module.exports = {
  name: 'dungeon',
  description: 'Enter the dungeon...',
  aliases: ['dungeon'],
  usage: '[commande name]',
  cooldown: 5,
  execute(message, args) {    
    console.log(message.author)
    // msg.reply('Enter a dungeon alone !')
    // msg.channel.send(`${user.username} enter a dungeon alone !`)
  }
}