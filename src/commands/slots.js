const Discord = require('discord.js')
const { random } = require('../utils')
const User = require('../models/user')

module.exports = {
  name: 'slots',
  description: 'Slots',
  cooldown: 5,
  async execute(message, args) {
    let user = await User.findByPk(message.author.id)

    if(user) {
      if(args[0]) {
        let bet = args[0]
        if(user.coins >= bet) {
          let fruits = [':apple:', ':pear:', ':tangerine:', ':lemon:', ':banana:',
            ':watermelon:', ':grapes:', ':blueberries:', ':strawberry:', ':melon:',
            ':cherries:', ':peach:', ':mango:', ':pineapple:', ':coconut:', ':kiwi:', 
            ':tomato:']
          let firstSlot = fruits[random(0, fruits.length - 1)]
          let secondSlot = fruits[random(0, fruits.length - 1)]
          let thirdSlot = fruits[random(0, fruits.length - 1)]
          let prize = 0
          let result
          let variant = random(0, fruits.length)

          if(firstSlot === secondSlot === thirdSlot) {
            prize = Math.pow(bet + variant, 3)
          }
          if(firstSlot === secondSlot || secondSlot === thirdSlot || firstSlot === thirdSlot) {
            prize = bet * variant
          }

          if(prize > 0) {
            result = `You win ${prize} :coin: !`
            await user.increment('coins', { by: prize })
          } else {
            result = `You lost ${bet} :coin: !`
            await user.decrement('coins', { by: bet })
          }

          let messageEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(`${user.username}'s slots`, message.author.displayAvatarURL(), 'https://discord.js.org')
            .addField(`${firstSlot} ${secondSlot} ${thirdSlot}`, result)

          message.channel.send(messageEmbed)
        } else {
          message.channel.send(`**${message.author}** you don't have ${bet} :coin: !`)
        }
      } else {
        message.channel.send(`**${message.author}** you need to specified a bet !`)
      }
    } else {
      message.channel.send(`**${message.author}** doesn't have a character yet !\n\`beta create\` to create a character`)  
    }
  }
}