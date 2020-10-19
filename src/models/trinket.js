const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const Trinket = sequelize.define('trinket', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
})

module.exports = Trinket