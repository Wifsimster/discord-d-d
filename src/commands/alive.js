const User = require('../models/user')
const { Op } = require('sequelize')

module.exports = {
  name: 'alive',
  async execute(message) {
    let users = await User.findAll({ where: { currentHitPoint : { [Op.gte] : 0 }}})

    if(users.length > 0) {
      users = users.map(u => '**' + u.username + '**')
      users.join(' ')
      message.channel.send(`${users} are alive !`)
    } else {
      message.channel.send('Nobody is alive !')
    }
  }
}