const User = require('../models/user')
const { throwDice } = require('../utils')

module.exports = {
  name: 'steal',
  cooldown: 60,
  async execute(message) {
    let user = await User.findByPk(message.author.id)
    let randomCoins = throwDice() + throwDice()
    let randomDexterity = throwDice(user.charisma)

    message.channel.send(`**${user.username}** tried to stole someone on the sidewalk... (Dexterity ${user.dexterity})`)

    if(randomDexterity / user.dexterity > 0.9) {
      message.channel.send(`**${user.username}** stole ${randomCoins} 🪙 (${randomDexterity} :game_die:)`)
      await user.increment('coins', { by: randomCoins })
    } else {
      let randomValue = throwDice(6)
      await user.update({ currentHitPoint: user.currentHitPoint - randomValue < 0 ? 0 : user.currentHitPoint - randomValue })
      message.channel.send(`**${user.username}** the person caught you, you loose - ${randomValue} ❤ ! (${randomDexterity} :game_die:)`)
    }    
  }
}