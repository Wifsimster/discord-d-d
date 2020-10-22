const User = require('../models/user')
const { getItem } = require('../utils')
const Inventory = require('../models/inventory')

module.exports = {
  name: 'drop',
  async execute(message, args) {
    let messages = []
    let user = await User.findByPk(message.author.id)
    let item = await getItem(args[0])

    if(user) {
      if(item) {
        let inventory = await Inventory.findOne({ where: { itemId: item.id, userId: user.id, equiped: false }})

        if(inventory) {
          messages.push(`**${user.username}** drop \`${item.name}\` on the floor, you have 20s to pick it up : \`pickup\``)
          
          // Wait reaction
          const filter = message => message.content.includes('pickup')
          const collector = message.channel.createMessageCollector(filter, { time: 20000 })

          collector.on('collect', async m => {
            if(!m.author.bot) {
              await inventory.update({ userId: m.author.id})
              message.channel.send(`**${m.author.username}** pick up the \`${item.name}\` !`)
            }
          })

          collector.on('end', async collected => {
            if(collected.size === 0) {
              if(inventory.quantity > 1) {
                await inventory.decrement('quantity', { by: 1 })
              } else {
                await inventory.destroy()
              }
              message.channel.send('Nobody pick it up, it\'s now lost forever !')
            }
          })
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