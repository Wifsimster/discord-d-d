const Sequelize = require('sequelize')
const sequelize = require('../db')

const Monster = sequelize.define('Monster', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: Sequelize.STRING,
    defaultValue: 'Beast',
    allowNull: false,
  },
  size: {
    type: Sequelize.STRING,
    defaultValue: 'Small',
    allowNull: false
  },
  environment: {
    type: Sequelize.STRING,
    defaultValue: 'Forest',
    allowNull: false,
  },
  challengeRange: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  challenge: {
    type: Sequelize.INTEGER,
    defaultValue: 10,
    allowNull: false,
  },
  dice: {
    type: Sequelize.INTEGER,
    defaultValue: 10,
    allowNull: false,
  },
  action: {
    type: Sequelize.STRING,
    defaultValue: 'Bite',
    allowNull: false,
  },
  charisma: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  constitution: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  dexterity: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  intelligence: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  strength: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  wisdom: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
})

module.exports = Monster