const User = require('../models/user')

module.exports = {
  name: 'wololo',
  async execute(message) {
    if(message.author.id === '134047703343562752') {
      let users = await User.findAll()

      if(users.length > 0) {
        await Promise.all(users.map(async user => {
          await user.update({ currentHitPoint : user.maxHitPoint })
        }))
        users = users.map(u => u.username)
        message.channel.send(`:man_mage: **${users}** are all maxed out !`)
      }
    } else {
      message.channel.send(`:man_facepalming: **${message.author.username}** thinks he is playing AoE !`)
    }
  }
}