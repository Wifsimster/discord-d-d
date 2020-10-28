// const { handleDungeon, firstDay } = require('./dungeon')
// const { determineWeaponDamage, determineArmorValue, decrementEquipedItemsCondition } = require('./equipment')
// const { randomDamage, savingThrow } = require('./fight')
// const { getPotionFromUser, heal, } = require('./heal')
// const { getItem, determineItemValue, getUserItemCondition, getUserEquipedItem, getUserContainer, getUserUnequipItems } = require('./item')
// const { getUserLevel, getMaxExperience, levelUp, giveExperience } = require('./level')
// const { initializeMonster } = require('./monster')
// const { getUserCurrentWeight, canMove, giveTrinket, canParticipate } = require('./user')
const { random, throwDice, multipleThrowDice, triggerEvent } = require('./utils')

module.exports = { random, throwDice, multipleThrowDice, triggerEvent }