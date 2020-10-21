const User = require('../models/user')
const { throwDice, triggerEvent, random } = require('../utils')

module.exports = {
  name: 'prostitue',
  cooldown: 60,
  async execute(message) {
    let user = await User.findByPk(message.author.id)
    let randomValue = throwDice()

    message.channel.send(`:dancer: **${user.username}** tries to seduce a stranger..`)

    if(triggerEvent()) {
      message.channel.send(`:orgasm: **${user.username}** your actions brought you ${randomValue} 🪙`)
      await user.increment('coins', { by: randomValue })
    } else {
      let responses = [
        `**${user.username}**, nobody want you ass !`,
        `:face_vomiting: **${user.username}**, the stranger threw up and walk away !`,        
        `:frowning2: **${user.username}** you disgusted the stranger, he ran away !`
      ]
      message.channel.send(responses[random(0, responses.length - 1)])
    }    
  }
}