module.exports = {
  name: 'profile',
  description: 'Profile',
  aliases: ['p'],
  usage: '[beta profile]',
  cooldown: 5,
  execute(message, args) {
    console.log(message.author)
    // msg.reply('Enter a dungeon alone !')
    // msg.channel.send(`${user.username} enter a dungeon alone !`)
  }
}