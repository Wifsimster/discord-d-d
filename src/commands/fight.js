module.exports = {
  name: 'fight',
  description: 'Fight',
  aliases: ['combat'],
  usage: '[commande name]',
  cooldown: 5,
  execute(message) {    
    message.channel.send('Fight hardly !')
  }
}