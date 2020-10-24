const Sequelize = require('sequelize')
const sequelize = require('../db')

const Item = sequelize.define('item', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  description: Sequelize.STRING,
  objectType: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'trinket'
  },
  type: {
    type: Sequelize.STRING
  },
  cost: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  weight: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  armorClass: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  damage: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  // Generic value
  value: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  condition: {
    type: Sequelize.INTEGER,
    defaultValue: 100
  },
  deteriorationRate: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  equiped: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  // Weapon properties
  damageType: Sequelize.STRING,  
  twoHanded: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  needAmmunition: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
})

module.exports = Item