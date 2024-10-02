const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class municipalities extends Model {
    static associate(models) {
      // Un municipio pertenece a un estado
      this.belongsTo(models.states, { as: 'estado', foreignKey: 'state_id' });
      this.hasMany(models.branches, { as: 'municipio', foreignKey: 'municipality_id' });
    }
  }
  municipalities.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: DataTypes.BOOLEAN
  }, {
    sequelize,
    paranoid: true,
    modelName: 'municipalities'
  });

  return municipalities;
};
