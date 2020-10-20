const User = require('../models/user')

module.exports = {
  name: 'restore',
  description: 'Restore hit point',
  aliases: ['heal', 'recover'],
  usage: '[commande name]',
  cooldown: 5,
  async execute(message, args) {    
    if(message.author.id === '134047703343562752' && args[0] === 'all') {
      let users = await User.findAll()
      
      await Promise.all(users.map(async user => {
        await user.update({ currentHitPoint: user.maxHitPoint })
      }))
      
      message.channel.send(`${message.author} healed everyone !`)
    } else {

      let user = await User.findByPk(message.author.id)

      if(user) {
        await user.update({ currentHitPoint: user.maxHitPoint })
        message.channel.send(`${message.author} your life have been restored !`)
      } else {
        message.channel.send(`${message.author} doesn't have a character yet !
  \`beta create\` to create a character`)
      }
    }
  }
}