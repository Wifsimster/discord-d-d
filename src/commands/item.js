const { getItem } = require('../utils')

module.exports = {
  name: 'item',
  async execute(message, args) {

    if(args[0]) {
      let item = await getItem(args[0])

      if(item) {
        message.channel.send(`\`${item.name}\`: ${item.description}`)
      } else {
        message.channel.send('')
      }
    } else {
      message.channel.send('')
    }
  }
}