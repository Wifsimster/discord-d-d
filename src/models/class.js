const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const Class = sequelize.define('class', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: Sequelize.STRING,
  hitDie: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  hitPoint: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  hitPointAugmentation: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  armor: Sequelize.STRING,
  shield: Sequelize.STRING,
  weapon: Sequelize.STRING,
})

module.exports = Class