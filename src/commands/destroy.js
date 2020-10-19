const User = require('../models/user')

module.exports = {
  name: 'destroy',
  description: 'Destroy your character',
  usage: '[commande name]',
  cooldown: 5,
  async execute(message) {
    let author = message.author

    let user = await User.findByPk(message.author.id)

    if(user) {
      await message.channel.send(`${author.username} do you want to destroyed your character ? (\`yes\`/\`no\`)
This is a definitve thing, be sure to understand what you are doing !`)    

      let answers_01 = ['yes', 'y', 'no', 'n']
      let filter_01 = response => answers_01.some(answer => answer.toLowerCase() === response.content.toLowerCase())

      let collection_01 = await message.channel
        .awaitMessages(filter_01, { max: 1, time: 30000, errors: ['time'] })      
        .catch(() => { message.channel.send('Destruction stopped !') })

      if(collection_01.first().content.toLowerCase().startsWith('y')) {
        await user.destroy()
        message.channel.send(`😱 ${user.username} your character have ben destroyed !`)
      } else {
        message.channel.send('🤗 Okay, your character is safe !')
      }
    } else {
      message.channel.send('It seems you don\'t have create your character yet !')
    }
  }
}