const Sequelize = require('sequelize')
const sequelize = require('./db')

const Class = sequelize.define('Class', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  modifier: Sequelize.STRING,
  armor: Sequelize.STRING,
  shield: Sequelize.STRING,
  weapon: Sequelize.STRING
})

module.exports = Class