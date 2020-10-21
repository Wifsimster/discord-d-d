module.exports = [
  {
    name: 'Life potion',    
    description: 'Magical red fluid which give 2d4 + 2 ❤, use 1 with `heal`',
    objectType: 'consumable',
    type: 'heal',
    cost: 1,
    weight: 0
  },
  {
    name: 'Rations',    
    description: 'rations consist of dry foods suitable for extended travel like dungeons',
    objectType: 'consumable',
    type: 'heal',
    cost: 250,
    weight: 2
  },
  {
    name: 'Arrows',
    description: 'Arrows are used with range weapons like `Light crossbow` or `Shortbow`',
    objectType: 'ammunition',
    type: 'ammunition',
    cost: 150,
    weight: 1
  },
  {
    name: 'Bomb',
    description: 'Characther can light this bomb and throw it. Monster take a 3d6 damage',
    objectType: 'ammunition',
    type: 'ammunition',
    cost: 150000,
    weight: 1
  },
]