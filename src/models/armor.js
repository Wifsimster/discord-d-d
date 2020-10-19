const Sequelize = require('sequelize')
const sequelize = require('../db')

const Armor = sequelize.define('armor', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {    
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 0
  },
  cost: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  armorClass: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  weight: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
})

module.exports = Armor