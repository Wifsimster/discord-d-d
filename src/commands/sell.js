const User = require('../models/user')
const Inventory = require('../models/inventory')

const { throwDice } = require('../utils')
const { getItem, determineItemValue } = require('../utils/item')

module.exports = {
  name: 'sell',
  async execute(message, args) {
    let messages = []
    let user = await User.findByPk(message.author.id)
    let item = await getItem(args[0])
    let cost = args[1] || await determineItemValue(item.id)

    if(user) {
      if(item) {
        let inventory = await Inventory.findOne({ where: { itemId: item.id, userId: user.id, equiped: 0 }})

        if(inventory) {
          messages.push(`:moneybag: **${user.username}** put his \`${item.name}\` for sale at ${cost} :coin: (shop ${await determineItemValue(item.id)} :coin:)`)

          if(cost > await determineItemValue(item.id)) {
            messages.push(`:moneybag: **${user.username}** tries to convince the merchant with his charisma (${user.charisma})...`)
            
            if(throwDice(user.charisma) / user.charisma > 0.9) {
              await user.increment('coins', { by: cost })
              messages.push(`:moneybag: **${user.username}** sell it for ${cost} :coin: !`)

              if(inventory.quantity > 1) {
                await inventory.decrement('quantity', { by: 1 })
              } else {
                await inventory.destroy()
              }
            } else {
              messages.push(`:moneybag: **${user.username}** failed to sell his \`${item.name}\` !`)
            }
          } else {
            await user.increment('coins', { by: cost })
            if(inventory.quantity > 1) {
              await inventory.decrement('quantity', { by: 1 })
            } else {
              await inventory.destroy()
            }
            messages.push(`:moneybag: **${user.username}** sell it for ${cost} :coin: !`)
          }
        } else {
          messages.push(`\`${args[0]}\` not found !`)
        }
      } else {
        messages.push(`**${message.author.username}** you don't have a character yet !`)
      }
      messages.map(m => message.channel.send(m))
    }
  }
}