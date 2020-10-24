const { random, throwDie } = require('../utils')
const User = require('../models/user')

module.exports = {
  name: 'tavern',
  async execute(message) {
    let messages = []
    let user = await User.findByPk(message.author.id)

    if(user) {
      messages.push(`:beers: **${user.username}** walked into a tavern, you can : \`eat\` (30 :coin:) or \`drink\` (10 :coin:)`)
          
      // Wait reaction
      let filter = response => ['eat', 'drink'].some(answer => answer === response.content)
      const collector = message.channel.createMessageCollector(filter, { time: 20000 })

      collector.on('collect', async m => {
        if(!m.author.bot && m.author.id === message.author.id) {
          if(m.content === 'eat') {
            if(user.coins >= 30) {
              let meals = ['hotdog', 'poultry_leg', 'meat_on_bone', 'hamburger', 'pizza', 'sandwich', 'stuffed_flatbread', 'taco', 'burrito' ]
              let meal = meals[random(0, meals.length - 1)]
              await user.update({ currentHitPoint: user.maxHitPoint })
              await user.decrement('coins', { by: 30 })
              message.channel.send(`:heart: **${user.username}** eat a big :${meal}:, his life is fully restored !`)
            } else {
              message.channel.send(`**${user.username}** you don't have 30 :coin: !`)
            }
          }
          if(m.content === 'drink') {
            if(user.coins >= 10) {
              await user.increment('alcool', { by: 10 })
              await user.decrement('coins', { by: 10 })
              let randomValue = throwDie(user.hitDie)

              if(user.currentHitPoint + random <= user.maxHitPoint) {                
                await user.update({ currentHitPoint: randomValue })                
                message.channel.send(`:beer: **${user.username}** drinks a mug of ale ! (+ ${randomValue} :heart: )`)
              } else {
                await user.update({ currentHitPoint: user.maxHitPoint })
                message.channel.send(`:heart: **${user.username}** drinks a mug of ale, his life is fully restored !`)
              }
            } else {
              message.channel.send(`**${user.username}** you don't have 10 :coin: !`)
            }
          }
        }
      })

      collector.on('end', async collected => {
        if(collected.size === 0) {
          message.channel.send(`**${user.username}** changes his mind, and leaves the tavern !`)
        }
      })
    } else {
      messages.push(`**${message.author.username}** you don't have a character yet !`)
    }
    messages.map(m => message.channel.send(m))
  }
}