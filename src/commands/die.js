module.exports = {
  name: 'die',
  description: 'Die',
  usage: '[commande name]',
  cooldown: 5,
  execute(message, args) {
    let author = message.author
    let die = args[0] || 20

    message.channel.send(`:game_die: ${author.username} roll a d${die}...`)

    setTimeout(() => {
      let result = Math.floor((Math.random() * die) + 1)
      message.channel.send(`:game_die: ${author.username} made a ${result}`)
    }, 2000)
  }
}