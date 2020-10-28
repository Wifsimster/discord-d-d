const Item = require('../models/item')
const Inventory = require('../models/inventory')
const { getUserEquipedItem } = require('./user')

module.exports = async function determineWeaponDamage(userId) {
  let weapon = await getUserEquipedItem(userId, 'weapon')

  if(weapon) {
    let inventoryWeapon = await Inventory.findOne({ where: { userId: userId, itemId: weapon.id }})
    if(inventoryWeapon) {
      let weapon = await Item.findByPk(inventoryWeapon.itemId)
      let maxDamage = Math.ceil(weapon.damage * (inventoryWeapon.condition / 100))
      return maxDamage
    }
  }
  return null
}

module.exports = async function determineArmorValue(userId, type = 'armor') {
  let armor = await getUserEquipedItem(userId, type)

  if(armor) {
    let inventoryArmor = await Inventory.findOne({ where: { userId: userId, itemId: armor.id }})
    if(inventoryArmor) {
      let armor = await Item.findByPk(inventoryArmor.itemId)
      let armorClass = Math.ceil(armor.armorClass * (inventoryArmor.condition / 100))
      return armorClass
    }
  }
  return 0
}

module.exports = async function decrementEquipedItemsCondition(userId) {
  let userWeapon = await getUserEquipedItem(userId, 'weapon')
  if(userWeapon) {
    let userIventoryWeapon = await Inventory.findOne({ where: { userId: userId, itemId: userWeapon.id }})
    await userIventoryWeapon.decrement('condition', { by: userWeapon.deteriorationRate })
  }
      
  let userArmor = await getUserEquipedItem(userId, 'armor')
  if(userArmor) {
    let userIventoryArmor = await Inventory.findOne({ where: { userId: userId, itemId: userArmor.id }})
    await userIventoryArmor.decrement('condition', { by: userArmor.deteriorationRate })
  }

  let userShield = await getUserEquipedItem(userId, 'shield')
  if(userShield) {
    let userIventoryShield = await Inventory.findOne({ where: { userId: userId, itemId: userShield.id }})
    await userIventoryShield.decrement('condition', { by: userShield.deteriorationRate }) 
  }
}

