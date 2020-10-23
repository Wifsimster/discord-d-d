const User = require('../models/user')
const { throwDice } = require('../utils')

module.exports = {
  name: 'charity',
  cooldown: 60,
  async execute(message) {
    let user = await User.findByPk(message.author.id)
    let randomCoins = throwDice()
    let randomCharisma = throwDice(user.charisma)

    message.channel.send(`**${user.username}** do charity on the sidewalk... (Charisma ${user.charisma})`)

    if(randomCharisma / user.charisma > 0.9) {
      message.channel.send(`**${user.username}** someone give you ${randomCoins} 🪙 (${randomCharisma} :game_die:)`)
      await user.increment('coins', { by: randomCoins })
    } else {
      message.channel.send(`**${user.username}**, nobody gives a fuck about you ! (${randomCharisma} :game_die:)`)
    }    
  }
}