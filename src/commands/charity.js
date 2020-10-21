const User = require('../models/user')
const { throwDice, triggerEvent } = require('../utils')

module.exports = {
  name: 'charity',
  cooldown: 60,
  async execute(message) {
    let user = await User.findByPk(message.author.id)
    let randomValue = throwDice()

    message.channel.send(`**${user.username}** do charity on the sidewalk...`)

    if(triggerEvent()) {
      message.channel.send(`**${user.username}** someone give you ${randomValue} 🪙`)
      await user.increment('coins', { by: randomValue })
    } else {
      message.channel.send(`**${user.username}** nobody gives a fuck about you !`)
    }    
  }
}