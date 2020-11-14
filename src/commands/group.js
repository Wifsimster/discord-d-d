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
  async execute(message, args) {
    let leader = await User.findByPk(message.author.id, { include: [{ model: Group }] })
    let action = args[0]

    if(leader.groupId) {
      if(action === 'destroy') {
        let users = await User.findAll({ include: [{ model: Group, where: { id: leader.groupId }}]})
        await Promise.all(users.map(async user => { await user.update({ groupId: null }) })) 
        await Group.destroy({ where: { id: leader.groupId }})
        message.channel.send(`**${leader.username}** destroyed the group !`)
      } else {
        let users = await User.findAll({ include: [{ model: Group, where: { id: leader.groupId }}]})
        if(users) {
          let players = users.map(user => user.username)
          message.channel.send(`:crossed_swords: **${leader.username}** is already in a group called **${leader.group.name}** with **${players}** !`)
        }
      }
    } else {
      let mentions = message.mentions.users.array()

      if(mentions.length > 0) {
        let answers = ['yes', 'y']
        let filter = response => answers.some(answer => !response.author.bot && answer.toLowerCase() === response.content.toLowerCase())

        let collector = message.channel.createMessageCollector(filter, { time: 15000 })
        
        message.channel.send(`**${leader.username}** wants to create a group with ${mentions} ! You can respond with \`yes\` (You have 15s)`)
    
        collector.on('end', async collected => {
          if(collected.size > 1) {
            let collection = collected.array()
            let players = collection.map(c => { if(!c.author.bot && c.author.id !== leader.id) { return c.author.id }})
            players = players.filter(p => p)
            players.push(leader.id)

            if(players.length > 1) {
              let randomGroupName = getRandomGroupName()
              let group = await Group.create({ name: randomGroupName })
      
              if(group) {
                await leader.setGroup(group.id)
                await Promise.all(players.map(async player => { await player.setGroup(group.id) }))          
                message.channel.send(`:crossed_swords: **${leader.username}** formed a group with ${players}, your group it's called **${group.name}** !`)
              }
            } else {
              message.channel.send(`:no_entry: **${leader.username}** not enough response to create a group !`)
            }
          } else {
            message.channel.send(':no_entry: Group creation cancelled !')
          }
        })
      } else {
        message.channel.send(':no_entry: You can\'t create a group without others players !')
      }
    }   
  }
}
