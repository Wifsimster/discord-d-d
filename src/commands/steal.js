const User = require('../models/user')
const { throwDice, triggerEvent } = require('../utils')

module.exports = {
  name: 'steal',
  cooldown: 60,
  async execute(message) {
    let user = await User.findByPk(message.author.id)
    let randomValue = throwDice() + throwDice()

    message.channel.send(`**${user.username}** tried to stole someone on the sidewalk...`)

    if(triggerEvent()) {
      message.channel.send(`**${user.username}** stole ${randomValue} 🪙`)
      await user.increment('coins', { by: randomValue })
    } else {
      let randomValue = throwDice(6)
      await user.update({ currentHitPoint: user.currentHitPoint - randomValue < 0 ? 0 : user.currentHitPoint - randomValue })
      message.channel.send(`**${user.username}** the person caught you, you loose - ${randomValue} ❤ !`)
    }    
  }
}