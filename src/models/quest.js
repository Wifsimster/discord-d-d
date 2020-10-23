const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const Quest = sequelize.define('quest', {
  nbMonster: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  challenge: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  killedMonster: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
})

module.exports = Quest