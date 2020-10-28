
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

module.exports = { random, throwDice, multipleThrowDice, triggerEvent }