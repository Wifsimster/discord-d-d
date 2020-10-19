const Sequelize = require('sequelize')
const sequelize = require('../db')

const Ability = sequelize.define('ability', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  description: Sequelize.STRING,
  value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
})

module.exports = Ability