const Sequelize = require('sequelize')
const sequelize = require('../db')

const Inventory = sequelize.define('inventory', {  
  equiped: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  condition: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
})

module.exports = Inventory