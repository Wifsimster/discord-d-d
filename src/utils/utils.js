
function random(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function throwDice(die = 20) {
  return Math.floor((Math.random() * die) + 1)
}

function multipleThrowDice(number, die = 20) {
  let result = 0
  for(let i = 0; i < number; i++) {
    result += throwDice(die)
  }
  return result
}

function triggerEvent() {
  return throwDice() === throwDice()
}

function combatTriggerMessage(players) {
  let player = players[random(0, players.length - 1)]
  let triggers = [`🤨 **${player.username}** see something ...`, 
    `🤫 **${player.username}** heard something ...`, 
    `🤫 **${player.username}** walk on something ...`
  ]
  return triggers[random(0, triggers.length - 1)]
}

module.exports = { random, throwDice, multipleThrowDice, triggerEvent, combatTriggerMessage }