const Sequelize = require('sequelize')
const sequelize = require('../db')

const Ability = sequelize.define('ability', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
})

module.exports = Ability