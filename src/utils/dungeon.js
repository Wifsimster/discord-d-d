const { canParticipate } = require('./user')

async function handleDungeon(message) {  
  if(message.content.startsWith('Who is ready to enter the')) {
    message.react('👍')
    let group = []

    const filter = (reaction, user) => {
      return reaction.emoji.name === '👍' && !user.bot && user.id !== message.author.id
    }
    
    const collector = message.createReactionCollector(filter, { time: 2000 })

    collector.on('collect', async (reaction, user) => {
      let results = await canParticipate(user.id)
      if(results.value) {
        group.push(user)
      } else {
        message.channel.send(results.message)
      }
    })
    
    collector.on('end', async collected => { 
      let dungeonEnvironment = message.content.includes('Forest') ? 'Forest' : null

      if(group.length > 0) {
        message.channel.send(`:synagogue: **${group}** enter the **${dungeonEnvironment}** dungeon !`)
        firstDay(group)
      } else {
        message.channel.send('No one is ready !')
      }
    })
  }
}

async function firstDay(group) {
  let messages = []

  await Promise.all(group.map(async player => {
    let user = await User.findBy(player.id)
  }))
}

module.exports = { handleDungeon }