const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()
const cooldowns = new Discord.Collection()

const Monster = require('./models/monster')

const sequelize = require('./db')

const { prefix, token } = require('../config.json')

const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(__dirname + `/commands/${file}`)
  client.commands.set(command.name, command)
}

client.login(token)

client.once('ready', async () => {
  await sequelize.sync({})
  // await sequelize.sync({ force: true })

  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')

    // Create monsters if not exist
    await Monster.bulkCreate([{
      name: 'Baboon',
      type: 'Beast',
      size: 'Small',
      environment: 'Forest',
      challengeRange: 0,
      challenge: 10,
      dice: 6,
      action: 'Bite',
      charisma: 6,
      constitution: 11,
      dexterity: 14,
      intelligence: 4,
      strength: 8,
      wisdom: 12
    }, {
      name: 'Badger',
      type: 'Beast',
      size: 'Tiny',
      environment: 'Forest',
      challengeRange: 0,
      challenge: 10,
      dice: 4,
      action: 'Bite',
      charisma: 5,
      constitution: 12,
      dexterity: 11,
      intelligence: 2,
      strength: 4,
      wisdom: 12
    }, {
      name: 'Cat',
      type: 'Beast',
      size: 'Tiny',
      environment: 'Forest',
      challengeRange: 0,
      dice: 4,
      action: 'Bite',
      strength: 3,
      dexterity: 15,
      constitution: 10,
      intelligence: 3,
      wisdom: 12,
      charisma: 7
    }, {
      name: 'Deer',
      type: 'Beast',
      size: 'Medium',
      environment: 'Forest',
      challengeRange: 0,
      dice: 8,
      action: 'Bite',
      strength: 11,
      dexterity: 16,
      constitution: 11,
      intelligence: 2,
      wisdom: 14,
      charisma: 5
    }, {
      name: 'Owl',
      type: 'Beast',
      size: 'Tiny',
      environment: 'Forest',
      challengeRange: 0,
      dice: 4,
      action: 'Talons',
      strength: 3,
      dexterity: 13,
      constitution: 8,
      intelligence: 2,
      wisdom: 12,
      charisma: 7
    }])
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
})

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag} !`)
})

client.on('message', async message => {
  if(!message.content.toLowerCase().startsWith(prefix) || message.author.bot) {
    return
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()  
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) {
    return
  }
  
  if(command.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments, ${message.author} !`)
  }
  
  if(!client.commands.has(command.name)) {
    return
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000
  
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
  
  try {
    client.commands.get(command.name).execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('There was an error trying to execute that command !')
  }
})