module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  usage: '[commande name]',
  cooldown: 5,
  execute(message, args) {    
    if(args.length > 0) {
      message.channel.send(`Adventure start with ${args}`)
    }
    else {
      message.channel.send(`It's dangerous to go alone in an adventure ${message.author.username} !`)
    }
  }
}