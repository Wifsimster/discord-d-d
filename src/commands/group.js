const User = require('../models/user')
const Group = require('../models/group')

const { random } = require('../utils')

function getRandomGroupName() {
  let list = [
    'Nonsense', 
    'Knights in Shining Armor', 
    'Strong Bong', 
    'Clever Cats', 
    'Connected Souls', 
    'God\'s Favorites', 
    'Smoking Aces', 
    'Freedom Flowers', 
    'Karate Chop' , 
    'Republic of Restless', 
    'Cute Cousins', 
    'Tech Ninjas', 
    'Ignorant Buddies',
    'Secret Squad',
    'Family Club', 
    'Kung-Fu-Pandoo',
    'Shining Stars', 
    'Frustrated Vagabonds', 
    'The Fantastic Four', 
    'Insomaniacs',
    'Amazing Pals',
    'Drama Club',
    'Bomb Squad',
    'Tribe of Butterflies',
    'Spartans',
    'None of your Business'
  ]
  return list[random(0, list.length - 1)]
}

module.exports = {
  name: 'group',
  aliases: ['grp'],
  // cooldown: 5,
  async execute(message) {
    let mentions = message.mentions.users.array()
    let leader = await User.findByPk(message.author.id)
    let players = []

    const filter = m => m.content.includes('y')

    let collector = message.channel.createMessageCollector(filter, { time: 15000 })

    message.channel.send(`**${leader.username}** wants to create a group with ${mentions} ! You can respond with \`yes\` (You have 15s)`)
    
    collector.on('collect', m => {
      if(!m.client.user.bot) {
        mentions.map(mention => {
          if(mention.id === m.client.user.id) {
            players.push(m.client.user)
          }
        })
      }
    })
    
    collector.on('end', async collected => {
      if(collected.size > 1) {
        let randomGroupName = getRandomGroupName()
        let group = await Group.create({ name: randomGroupName })
      
        if(group) {
          await leader.setGroup(group.id)
          await Promise.all(players.map(async player => { await player.setGroup(group.id) }))          
          message.channel.send(`:crossed_swords: **${leader.username}** form a group with ${players}, your group it's called **${group.name}** !`)
        }
      } else {
        message.channel.send('Group creation cancelled !')
      }
    })
   
  }
}
