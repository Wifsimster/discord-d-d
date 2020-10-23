const User = require('../models/user')
const { throwDice, random } = require('../utils')

module.exports = {
  name: 'prostitute',
  cooldown: 60,
  async execute(message) {
    let user = await User.findByPk(message.author.id)
    let randomCoins = throwDice()
    let randomCharisma = throwDice(user.charisma)

    message.channel.send(`:dancer: **${user.username}** tries to seduce a stranger.. (Charisma ${user.charisma})`)

    if(randomCharisma / user.charisma > 0.9) {
      message.channel.send(`:blush: **${user.username}** your actions brought you ${randomCoins} 🪙 (${randomCharisma} :game_die:)`)
      await user.increment('coins', { by: randomCoins })
    } else {
      let responses = [
        `**${user.username}**, nobody want you ass ! (${randomCharisma} :game_die:)`,
        `**${user.username}** failed to seduce ! (${randomCharisma} :game_die:)`,
        `:face_vomiting: **${user.username}**, the stranger threw up and walk away ! (${randomCharisma} :game_die:)`,        
        `:frowning2: **${user.username}** you disgusted the stranger, he ran away ! (${randomCharisma} :game_die:)`
      ]
      message.channel.send(responses[random(0, responses.length - 1)])
    }    
  }
}