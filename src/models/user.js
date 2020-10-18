const { Sequelize } = require('sequelize')
const sequelize = require('../db')

const User = sequelize.define('User', {  
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  username: Sequelize.STRING,
  hitPoint: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,   
  },
  currentHitPoint: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,   
  },
  money: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
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
  title: Sequelize.STRING,
  experience: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  class: Sequelize.STRING,
  race: Sequelize.STRING,

  // Equipement
  armor: Sequelize.STRING,
  shield: Sequelize.STRING,
  weapon: Sequelize.STRING
}, { freezeTableName: true })

module.exports = User