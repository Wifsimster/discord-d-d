const Sequelize = require('sequelize')
const sequelize = require('../db')

const Weapon = sequelize.define('weapon', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'simple melee'
  },
  cost: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  damage: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  damageType: Sequelize.STRING,
  weight: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  twoHanded: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  ammunition: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
})

module.exports = Weapon