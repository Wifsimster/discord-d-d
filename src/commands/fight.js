const User = require('../models/user')

const { getUserEquipedItem, random, throwDice, giveXP, triggerEvent, getLevelByExperience } = require('../utils')

module.exports = {
  name: 'fight',
  description: 'Fight an other player',
  aliases: ['vs', 'versus'],
  cooldown: 5,
  async execute(message) {
    if(message.mentions.users.first()) {    
      let leader = await User.findByPk(message.author.id)
      let leaderWeapon = await getUserEquipedItem(leader.id, 'weapon')

      if(!leaderWeapon) {
        message.channel.send(`**${leader.username}** you don't have equiped a weapon !`)
        return
      }
  
      let opponent = await User.findByPk(message.mentions.users.first().id)      
      let opponentWeapon = await getUserEquipedItem(opponent.id, 'weapon') 
      
      if(!opponentWeapon) {
        message.channel.send(`**${opponentWeapon.username}** you don't have equiped a weapon !`)
        return
      }

      let messages = []
      messages.push(`⚔ **${leader.username}** (❤ ${leader.currentHitPoint}/${leader.maxHitPoint}) vs **${opponent.username}** (❤ ${opponent.currentHitPoint}/${opponent.maxHitPoint})`)
      messages.push(`⚔ **${leader.username}** with his ${leaderWeapon.name} (🗡 ${leaderWeapon.damage}) defie **${opponent.username}** with his ${opponentWeapon.name} (🗡 ${opponentWeapon.damage})`)

      if(opponent.currentHitPoint <= 0) {
        messages.push(`🤪 **${leader.username}** tried to fight the corpse of **${opponent.username}**...`)
      } else {
        if(leader.currentHitPoint <= 0) {
          messages.push(`🤪 **${opponent.username}** tried to fight the corpse of **${leader.username}**...`)
        }
      }

      while(leader.currentHitPoint > 0 && opponent.currentHitPoint > 0) {        
        if(leader.currentHitPoint > 0) {
          leader = await User.findByPk(leader.id)
          opponent = await User.findByPk(opponent.id)
      
          let results = await attack(leader, opponent)  
          messages = [...messages, ...results]
        }

        if(opponent.currentHitPoint > 0) {
          leader = await User.findByPk(leader.id)
          opponent = await User.findByPk(opponent.id)
              
          let results = await attack(opponent, leader)
          messages = [...messages, ...results]
        }
      }

      // Send all messages at the end
      messages.map(m => { message.channel.send(m) })
    } else {
      message.channel.send('You have to choose a opponent !')
    }
  }
}

async function attack(leader, opponent) {
  let messages = []
  
  leader = await User.findByPk(leader.id)
  opponent = await User.findByPk(opponent.id)
  
  let leaderWeapon = await getUserEquipedItem(leader.id, 'weapon')  
  let opponentArmor = await getUserEquipedItem(opponent.id, 'armor')
  let opponentShield = await getUserEquipedItem(opponent.id, 'shield')

  if(leader.currentHitPoint > 0 && opponent.currentHitPoint > 0) {
    if(!leaderWeapon) {
      messages.push(`🤨 **${leader.username}** go in an fight without a weapon !`)
      return messages
    }
     
    let randomValue = throwDice()
    let opponentArmorClass = (opponentArmor ? opponentArmor.armorClass : 0 + opponentShield ? opponentShield.armorClass : 0)
    let armorDamage = opponentArmorClass - randomValue
    let firstDamageDice = Math.round(throwDice(leader.hitDie) * leaderWeapon.damage / leader.hitDie)
    let secondDamageDice =  Math.round(throwDice(leader.hitDie) * leaderWeapon.damage / leader.hitDie)

    switch(randomValue) {
    case 20:          
      messages.push(`⚔ **${leader.username}** made a critical hit with his **${leaderWeapon.name}** ! (:game_die: ${firstDamageDice} + :game_die: ${secondDamageDice} => 🗡 -${firstDamageDice + secondDamageDice})`)
      opponent.currentHitPoint = opponent.currentHitPoint - (firstDamageDice + secondDamageDice)
      break
    case 1:
      messages.push(`⚔ **${leader.username}** missed **${opponent.username}** ! (:game_die: ${randomValue})`)
      break
    default:
      if(armorDamage < 0 ) {
        messages.push(`⚔ **${leader.username}** hit **${opponent.username}** (🛡 ${opponentArmorClass} - :game_die: ${randomValue} => 🗡 ${armorDamage})`)
        opponent.currentHitPoint = opponent.currentHitPoint - firstDamageDice
      } else {
        messages.push(`⚔ **${leader.username}** hit **${opponent.username}** but his armor prevent any damage ! (🛡 ${opponentArmorClass} - :game_die: ${randomValue} => 🗡 0)`)
      }
    }

    await opponent.update({ currentHitPoint: opponent.currentHitPoint })
    
    if(opponent.currentHitPoint <= 0) {
      messages.push(`🎺 **${leader.username}** killed **${opponent.username}** !`)

      if(triggerEvent() && opponent.coins > 0) {
        let randomCoins = random(0, opponent.coins)
        await leader.update({ coins: randomCoins })
        messages.push(`☠ **${leader.username}** stoled ${randomCoins} from **${opponent.username}** corpse !`)
      }

      let randomExperience = random(0, opponent.experience)
      await leader.update({ experience: leader.experience + randomExperience })
      messages.push(`🎁 **${leader.username}** got **${randomExperience} XP** !`)
    }
  } else {
    // messages.push(`☠ **${leader.username}** is dead !`)
  }
  return messages
}