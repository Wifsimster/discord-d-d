module.exports = {
  name: 'dice',
  description: 'Dice',
  usage: '[commande name]',
  cooldown: 5,
  execute(message, args) {
    let author = message.author
    let dice = args[0] || 20

    message.channel.send(`:game_die: ${author.username} roll a d${dice}...`)

    setTimeout(() => {
      let result = Math.floor((Math.random() * dice) + 1)
      message.channel.send(`:game_die: ${author.username} made a ${result}`)
    }, 2000)
  }
}