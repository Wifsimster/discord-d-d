module.exports = {
  name: 'marketplace',
  description: 'Marketplace',
  usage: '[commande name]',
  cooldown: 5,
  execute(message) {
    message.channel.send('🏛 Marketplace')
  }
}