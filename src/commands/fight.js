module.exports = {
  name: 'fight',
  description: 'Fight',
  aliases: ['combat'],
  usage: '[commande name]',
  cooldown: 5,
  execute(message) {    
    let opponent = message.mentions.users.first()

    message.channel.send(`${message.author} fight ${opponent} !`)
  }
}