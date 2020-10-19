const Sequelize = require('sequelize')
const sequelize = require('../db')

const Environment = sequelize.define('environment', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  challengeRangeMin: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  challengeRangeMax: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    allowNull: false,
  }
})

module.exports = Environment