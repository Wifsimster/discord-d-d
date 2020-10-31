const { Channel } = require('discord.js')
const User = require('../models/user')

module.exports = {
  name: 'group',
  aliases: ['grp'],
  // cooldown: 5,
  async execute(message) {
    let group = []
    let mentions = message.mentions.users.array()
    let leader = await User.findByPk(message.author.id)

    const filter = m => m.content.includes('y')

    let collector = message.channel.createMessageCollector(filter, { time: 15000 })

    message.channel.send(`**${leader.username}** wants to create a group with ${group} ! You can respond with \`yes\` (You have 15s)`)
    
    collector.on('collect', m => {
      if(!m.client.user.bot) {
        mentions.map(mention => {
          if(mention.id === m.client.user.id) {
            group.push(m.client.user)
          }
        })
      }
    })
    
    collector.on('end', collected => {
      if(collected.size > 1) {
        message.channel.send(`**${leader.username}** form a group with ${group} !`)
      } else {
        message.channel.send('Group creation cancelled !')
      }
    })
   
  }
}