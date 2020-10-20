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
    defaultValue: 10
  },
  // Modifier can be from -5 to +10 (valued by a d30)
  modifier: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
})

module.exports = Ability