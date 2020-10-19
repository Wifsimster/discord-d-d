const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const User = require('./user')

const Class = sequelize.define('class', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: Sequelize.STRING,
  hitDie: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  primaryAbility: {
    type: Sequelize.STRING,
    allowNull: false
  },
  armor: Sequelize.STRING,
  shield: Sequelize.STRING,
  weapon: Sequelize.STRING
})

// Class.hasMany(User)

module.exports = Class