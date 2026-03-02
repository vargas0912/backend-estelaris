'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class transfers extends Model {
    static associate(models) {
      this.belongsTo(models.branches, { as: 'fromBranch', foreignKey: 'from_branch_id' });
      this.belongsTo(models.branches, { as: 'toBranch', foreignKey: 'to_branch_id' });
      this.belongsTo(models.users, { as: 'user', foreignKey: 'user_id' });
      this.belongsTo(models.users, { as: 'receiver', foreignKey: 'received_by' });
      this.belongsTo(models.employees, { as: 'driver', foreignKey: 'driver_id' });
      this.hasMany(models.transferDetails, { as: 'details', foreignKey: 'transfer_id' });
    }
  }

  transfers.init({
    from_branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    to_branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transfer_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Borrador', 'En_Transito', 'Recibido', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Borrador'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    received_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    transport_plate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    received_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'transfers',
    tableName: 'transfers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return transfers;
};
