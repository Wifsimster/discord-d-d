const User = require('../models/user')
const Environment = require('../models/environment')

module.exports = {
  name: 'dungeon',
  aliases: ['dg'],
  cooldown: 5,
  async execute(message,) {
    let leader = await User.findByPk(message.author.id, { include: [{ model: Environment }] })
    message.channel.send(`Who is ready to enter the **${leader.environment.name}** dungeon ? (You have 15s to respond)`)
  }
}