const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class municipalities extends Model {
    static associate (models) {
      // Un municipio pertenece a un estado
      this.belongsTo(models.states, { as: 'estado', foreignKey: 'state_id' });
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
    modelName: 'municipalities'
  });
  return municipalities;
};
