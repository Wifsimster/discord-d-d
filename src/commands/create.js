const User = require('../models/user')
const Race = require('../models/race')
const Class = require('../models/class')
const Armor = require('../models/armor')
const Shield = require('../models/shield')
const Weapon = require('../models/weapon')
const Ability = require('../models/ability')

const { random } = require('../utils')

module.exports = {
  name: 'create',
  description: 'Create your character',
  usage: '[commande name]',
  cooldown: 5,
  async execute(message) {
    let author = message.author

    let data = {
      id: message.author.id,
      username: message.author.username,
      hitPoint: 0,
      currentHitPoint: 0,
      charisma: 0,
      constitution: 0,
      dexterity: 0,
      intelligence: 0,
      strength: 0,
      wisdom: 0,
      title: 'Noobie',
      experience: 0,
      coins: 0,
      gemstones: 0
    }

    const races = await Race.findAll()

    await message.channel.send(`${author.username} do you want to create your character ? (\`yes\`/\`no\`)
This is a one time thing, be sure to understand what you are doing !`)    

    let answers_01 = ['yes', 'y', 'no', 'n']
    let filter_01 = response => answers_01.some(answer => answer.toLowerCase() === response.content.toLowerCase())

    let collection_01 = await message.channel
      .awaitMessages(filter_01, { max: 1, time: 30000, errors: ['time'] })      
      .catch(() => { message.channel.send('Creation stopped !') })

    if(collection_01.first().content.toLowerCase().startsWith('y')) {
      let msg = 'I. Choose a race: \n'
      races.map((race, index) => { msg += `\`${index}\` - ${race.name} \n` })
      message.channel.send(msg)
      
      let answers_02 = races.map((race, index) => index.toString())
      let filter_02 = response => answers_02.some(answer => answer === response.content)
    
      let collection_02 = await message.channel
        .awaitMessages(filter_02, { max: 1, time: 30000, errors: ['time'] })
        .catch(() => { message.channel.send('Creation stopped !') })

      if(answers_02.includes(collection_02.first().content)) {        
        let selectedRace = races.find((race, index) => collection_02.first().content === index.toString())
        message.channel.send(`You chose the race ${selectedRace.name} !`)
        
        data.raceId = selectedRace.id

        const classes = await Class.findAll()

        msg = 'II. Choose a class: \n'
        classes.map((item, index) => { msg += `\`${index}\` - ${item.name} \n` })
        message.channel.send(msg)
      
        let answers_03 = classes.map((item, index) => index.toString())
        let filter_03 = response => answers_03.some(answer => answer === response.content)
    
        let collection_03 = await message.channel
          .awaitMessages(filter_03, { max: 1, time: 30000, errors: ['time'] })
          .catch(() => { message.channel.send('Creation stopped !') })
          
        let selectedClass = classes.find((item, index) => collection_03.first().content === index.toString())
        message.channel.send(`You chose the class ${selectedClass.name} !`)

        data.classId = selectedClass.id

        if(selectedClass.armor) { 
          let armor = await Armor.findOne({ where: { name: selectedClass.armor }}) 
          data.armorId = armor.id
        }
        if(selectedClass.shield) { 
          let shield = await Shield.findOne({ where: { name: selectedClass.shield }})
          data.shieldId = shield.id
        }
        if(selectedClass.weapon) { 
          let weapon = await Weapon.findOne({ where: { name: selectedClass.weapon }})
          data.weaponId = weapon.id
        }

        const abilities = await Ability.findAll()

        message.channel.send(`III. Determination of you ability scores
Bot will now randomly set your 6 abilities between 8 to 15...\n`)

        msg = ''

        abilities.map(ability => {
          let randomValue = random(8, 15)
          
          // Add race ability increase score
          if(selectedRace.abilityIncrease === ability.name) {
            msg += `:game_die: ${ability.name} : ${randomValue} + ${selectedRace.abilityScore} \n`
            randomValue = randomValue + selectedRace.abilityScore
          } else {            
            msg += `:game_die: ${ability.name} : ${randomValue}\n`
          }

          data[ability.name.toLowerCase()] = randomValue
        })

        message.channel.send(msg)

        data.hitDie = selectedClass.hitDie
        data.maxHitPoint = selectedClass.hitPoint + data.constitution
        data.hitPointAugmentation = selectedClass.hitPointAugmentation
        data.currentHitPoint = data.maxHitPoint

        let user = await User.create(data).catch(err => {
          console.error(err)
          if(err.name === 'SequelizeUniqueConstraintError') {
            message.channel.send('It seems you have already create your character dude !')
          } else {
            message.channel.send('Something went wrong !')
          }
        })

        if(user) {
          message.channel.send('It\'s all done ! You can go out and get killed now ☠')
        }
      } else {
        message.channel.send('Okay, next time then ;)')
      }
    } else {
      message.channel.send('Okay, next time then ;)')
    }
  }
}