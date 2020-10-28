const Discord = require('discord.js')
const User = require('../models/user')
const Quest = require('../models/quest')
const Monster = require('../models/monster')

const { random, multipleThrowDice } = require('../utils')

module.exports = {
  name: 'quest',
  description: 'Get a awesome quest !',
  cooldown: 5,
  async execute(message) {
    let user = await User.findByPk(message.author.id, { include: [{ model: Quest, include: [{ model: Monster }] }] })

    if(user) {      
      if(user.quests) {
        let quest = user.quests[0]

        let messageEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor(`${user.username}'s quest`, message.author.displayAvatarURL(), 'https://discord.js.org')
          .setDescription(`Kill ${quest.nbMonster} **${quest.monster.name}** : (${quest.killedMonster}/${quest.nbMonster})`)
          
        message.channel.send(messageEmbed)
      } else {     
        let monsters = await Monster.findAll()
        message.channel.send(`:face_with_monocle: **${message.author.username}** look for a quest on the city board...`)

        let quests = []
        let nbQuest = 5
        for(let i = 0 ; i < nbQuest; i++) {
          quests.push(generateQuest(monsters))
        } 
      
        let messageEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor('Town\'s board')
          .setTitle(':crossed_swords: Quests')

        quests.map((quest, index) => {
          messageEmbed.addField(`\`${index}\` - Quest`, `Kill ${quest.nbMonster} **${quest.monster.name}** : ${quest.challenge} XP & ${quest.coins} :coin:`)
        })

        messageEmbed.setFooter('You have 15s to choose a `number` !')

        message.channel.send(messageEmbed)

        let answers_01 = quests.map((quest, index) => index)
        let filter_01 = response => answers_01.some(answer => {
          if(response.content.length === 1 && !isNaN(Number(response.content))) {
            return answer === Number(response.content)
          }
          return false
        })

        let collection_01 = await message.channel
          .awaitMessages(filter_01, { max: 1, time: 15000, errors: ['time'] })      
          .catch(() => { message.channel.send(':bookmark: Quest\'s choice stopped !') })
        
        if(collection_01.first().author.id === message.author.id) {
          message.channel.send(`:bookmark: **${message.author}** choose the quest \`${collection_01.first().content}\` !`)
          let quest = quests[collection_01.first().content]
          await Quest.create({ userId: user.id, monsterId: quest.monster.id, nbMonster: quest.nbMonster, challenge: quest.challenge, coins: quest.coins })
        }
      }
    } else {      
      message.channel.send(`:astonished: **${message.author}** doesn't have a character yet !\n \`beta create\` to create a character`)
    }
  }
}

function generateQuest(monsters) {  
  let monster = monsters[random(0, monsters.length - 1)]
  let nbMonster = random(1, 10)  
  let randomChallenge = monster.challenge * nbMonster
  let randomCoins = multipleThrowDice(nbMonster)
  return { monster: monster, nbMonster: nbMonster, challenge: randomChallenge, coins: randomCoins}
}