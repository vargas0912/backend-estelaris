const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class states extends Model {
    static associate(models) {
      // Un estado tiene muchos municipios
      this.hasMany(models.municipalities, { as: 'municipio', foreignKey: 'state_id' });
    }
  }
  states.init({
    key: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    abrev: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: DataTypes.BOOLEAN
  }, {
    sequelize,
    paranoid: true,
    modelName: 'states'
  });

  return states;
};
