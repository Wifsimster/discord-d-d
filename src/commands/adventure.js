module.exports = {
  name: 'adventure',
  description: 'Adventure',
  aliases: ['adv'],
  usage: '[commande name]',
  cooldown: 5,
  execute(message) {
    let players = message.mentions.users

    if(players.size > 0) {
      message.channel.send(`Adventure start with ${players.map(user => { return user }) }`)

    }
    else {
      message.channel.send(`It's dangerous to go alone in an adventure ${message.author} ! Bring some friends next time.`)
    }
  }
}