module.exports = {
  name: 'environment',
  description: 'Environment',
  aliases: ['env'],
  usage: '[commande name]',
  cooldown: 5,
  execute(message, args) {    
    let area = args[0]
    
    message.channel.send(`${message.author} fight ${opponent} !`)
  }
}