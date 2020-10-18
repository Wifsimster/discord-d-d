const Sequelize = require('sequelize')
const sequelize = require('./db')

const Race = sequelize.define('race', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: Sequelize.STRING,
  traits: Sequelize.STRING
})

module.exports = Race