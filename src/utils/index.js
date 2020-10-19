const ATTACK_MATRIX_01 = [...Array(20).keys()]

function random(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function throwDice(dice = 20) {
  return Math.floor((Math.random() * dice) + 1)
}

function randomDamage(diceValue, strength) {
  return Math.round(ATTACK_MATRIX_01[diceValue - 1] * strength / 10)
}

module.exports = { random, throwDice, randomDamage }