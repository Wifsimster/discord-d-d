const Discord = require('discord.js')
const Keyv = require('keyv')
const keyv = new Keyv('sqlite://db.sqlite', { namespace: 'user' })
keyv.on('error', err => console.error('Keyv connection error:', err))

const races = require('../races')
const classes = require('../classes')
const abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']

module.exports = {
  name: 'create',
  description: 'Create your character',
  usage: '[commande name]',
  cooldown: 5,
  async execute(message) {
    let author = message.author

    let data = {
      id: message.author.id,
      title: 'Noobie',
      level: 1,
      xp: 0,
      race: null,
      class: null
    }

    await message.channel.send(`${author.username} do you want to create your character ? (\`yes\`/\`no\`)
This is a one time thing, be sure to understand what you are doing !`)    

    let answers_01 = ['yes', 'y', 'no', 'n']
    let filter_01 = response => answers_01.some(answer => answer.toLowerCase() === response.content.toLowerCase())

    let collection_01 = await message.channel
      .awaitMessages(filter_01, { max: 1, time: 30000, errors: ['time'] })
      .catch(err => { console.error(err) })

    if(collection_01.first().content.startsWith('y')) {
      let msg = 'I. Choose a race: \n'
      races.map((race, index) => { msg += `${index} - ${race.name} \n` })
      message.channel.send(msg)
      
      let answers_02 = races.map((race, index) => index.toString())
      let filter_02 = response => answers_02.some(answer => answer === response.content)
    
      let collection_02 = await message.channel
        .awaitMessages(filter_02, { max: 1, time: 30000, errors: ['time'] })
        .catch(err => { console.error(err) })

      if(answers_02.includes(collection_02.first().content)) {
        let selectedRace = races.find((race, index) => collection_02.first().content === index.toString())
        message.channel.send(`You chose the race ${selectedRace.name} !`)

        data.race = selectedRace.name

        msg = 'II. Choose a class: \n'
        classes.map((item, index) => { msg += `${index} - ${item.name} \n` })
        message.channel.send(msg)
      
        let answers_03 = classes.map((item, index) => index.toString())
        let filter_03 = response => answers_03.some(answer => answer === response.content)
    
        let collection_03 = await message.channel
          .awaitMessages(filter_03, { max: 1, time: 30000, errors: ['time'] })
          .catch(err => { console.error(err) })
          
        let selectedClass = classes.find((item, index) => collection_03.first().content === index.toString())
        message.channel.send(`You chose the class ${selectedClass.name} !`)

        data.class = selectedClass.name
        data.armor = selectedClass.armor
        data.shield = selectedClass.shield
        data.weapon = selectedClass.weapon

        message.channel.send(`III. Determination of you ability scores
Bot will now randomly set your 6 abilities between 8 to 15 :\n`)

        abilities.map(ability => {          
          let value = Math.floor(Math.random() * (15 - 8 + 1) + 8)
          data[ability.toLowerCase()] = value

          if(ability.toLowerCase() === 'charisma' && selectedClass.charismaModifier) {
            data.charisma =  value + selectedClass.charismaModifier
          }
          if(ability.toLowerCase() === 'constitution' && selectedClass.constitutionModifier) {
            data.constitution =  value + selectedClass.constitutionModifier
          }
          if(ability.toLowerCase() === 'dexterity' && selectedClass.dexterityModifier) {
            data.dexterity =  value + selectedClass.dexterityModifier
          }
          if(ability.toLowerCase() === 'intelligence' && selectedClass.intelligenceModifier) {
            data.intelligence =  value + selectedClass.intelligenceModifier
          }
          if(ability.toLowerCase() === 'strength' && selectedClass.strengthModifier) {
            data.strength =  value + selectedClass.strengthModifier
          }
          if(ability.toLowerCase() === 'wisdom' && selectedClass.wisdomModifier) {
            data.wisdom =  value + selectedClass.wisdomModifier
          }

          message.channel.send(`:game_die: ${ability} : ${value} \n`)
        })
          
        //  =====================================================

        await keyv.set('user', data)

        let user = await keyv.get('user')

        let messageEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor(`${message.author.username}'s profile`, author.displayAvatarURL(), 'https://discord.js.org')
          .setTitle(user.title)
          .setDescription(`${user.race} ${user.class}`)
          .setThumbnail(author.displayAvatarURL())
          .addField('Progression', '\u200b')
          .addFields(
            { name: 'Level', value: `${user.level} (0%)`, inline: true },
            { name: 'XP', value: `${user.xp}`, inline: true }
          )
          .addField('Abilities', '\u200b')
          .addFields(
            { name: 'Charisma', value: `${user.charisma}`, inline: true },
            { name: 'Constitution', value: `${user.constitution}`, inline: true },
            { name: 'Dexterity', value: `${user.dexterity}`, inline: true },
            { name: 'Intelligence', value: `${user.intelligence}`, inline: true },
            { name: 'Strength', value: `${user.strength}`, inline: true },
            { name: 'Wisdom', value: `${user.wisdom}`, inline: true }
          )
          .addField('Equipment', '\u200b')
          .addFields(
            { name: 'Weapon', value: `${user.armor}`, inline: true },
            { name: 'Shield', value: `${user.shield}`, inline: true },
            { name: 'Weapon', value: `${user.weapon}`, inline: true }
          )
          .addField('\u200b', '\u200b')
    
        message.channel.send(messageEmbed)

      } else {
        message.channel.send('Okay, next time then ;)')
      }
    } else {
      message.channel.send('Okay, next time then ;)')
    }
  }
}