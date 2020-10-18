const User = require('../models/user')

module.exports = {
  name: 'restore',
  description: 'Restore hit point',
  aliases: ['heal', 'recover'],
  usage: '[commande name]',
  cooldown: 5,
  async execute(message, args) {
    let user = await User.findByPk(message.author.id)
    
    if(user) {
      let value = Number(args[0] || user.hitPoint)
      await user.update({ currentHitPoint: value })
      message.channel.send('Your life have been restored !')
    }
  }
}