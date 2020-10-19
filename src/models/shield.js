const Sequelize = require('sequelize')
const sequelize = require('../db')

// Shield increase armor class by 2
const Shield = sequelize.define('shield', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  // wood | metal
  type: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'wood'
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

module.exports = Shield