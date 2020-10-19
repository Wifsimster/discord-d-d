const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const Race = sequelize.define('race', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  abilityIncrease: Sequelize.STRING,
  abilityScore: Sequelize.INTEGER,
})

module.exports = Race