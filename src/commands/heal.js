const User = require('../models/user')
const Inventory = require('../models/inventory')
const { throwDice, getPotionFromUser } = require('../utils')

module.exports = {
  name: 'heal',
  description: 'Restore hit point',
  aliases: ['restore', 'recover'],
  cooldown: 1,
  async execute(message) {
    let user = await User.findByPk(message.author.id, { include: { model: Inventory }})

    if(user) {
      let target
      let firstThrowValue
      let secondThrowValue
      let randomHitPoint = 0

      if(message.mentions.users.first()) {
        target = await User.findByPk(message.mentions.users.first().id)
      } else {
        target = await User.findByPk(message.author.id)
      }

      if(target.currentHitPoint < target.maxHitPoint) {     
        let inventoryPotion = await getPotionFromUser(user.id)
    
        if(inventoryPotion && inventoryPotion.quantity > 0) {
          firstThrowValue = throwDice(4)
          secondThrowValue = throwDice(4)
          randomHitPoint = firstThrowValue + secondThrowValue + 2
          let toHeal = target.maxHitPoint - target.currentHitPoint
          if(randomHitPoint > toHeal) {
            randomHitPoint = toHeal
          }
          await target.increment('currentHitPoint', { by: randomHitPoint })
        } else {
          message.channel.send(`**${user.username}** you don't have any \`Life_potion\` !`)
          return
        }

        // Get new currentHitPoint
        if(message.mentions.users.first()) {
          target = await User.findByPk(message.mentions.users.first().id)
        } else {
          target = await User.findByPk(message.author.id)
        }

        message.channel.send(`**${user.username}** throws : ${firstThrowValue} :game_die: + ${secondThrowValue} :game_die: + 2 ❤ = ${randomHitPoint} ❤`) 

        if(user.id !== target.id) {
          message.channel.send(`**${user.username}** restored **${target.username}** life : ${target.currentHitPoint}/${target.maxHitPoint} ❤`) 
        } else {
          message.channel.send(`**${target.username}** restored his life : ${target.currentHitPoint}/${target.maxHitPoint} ❤`) 
        }

        if(inventoryPotion.quantity === 1) {
          await inventoryPotion.destroy()
        } else {
          await inventoryPotion.decrement('quantity', { by: 1 })
        }
        
      } else {      
        message.channel.send(`**${target.username}** is already full life (${target.currentHitPoint}/${target.maxHitPoint} ❤)`) 
      }
    } else {
      message.channel.send(`${message.author} doesn't have a character yet !
  \`beta create\` to create a character`)
    }
  }
}