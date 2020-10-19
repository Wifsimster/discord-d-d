const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const User = require('./user')

const Race = sequelize.define('race', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: Sequelize.STRING
})

// Race.hasMany(User)

module.exports = Race