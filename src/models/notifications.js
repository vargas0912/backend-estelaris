'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class notifications extends Model {
    static associate(models) {
      this.belongsTo(models.users, { as: 'recipient', foreignKey: 'user_id' });
      this.belongsTo(models.users, { as: 'creator', foreignKey: 'created_by' });
    }
  }
  notifications.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    scheduled_at: DataTypes.DATE,
    due_at: DataTypes.DATE,
    read_at: DataTypes.DATE,
    cancelled_at: DataTypes.DATE,
    archived_at: DataTypes.DATE,
    batch_id: { type: DataTypes.UUID, allowNull: false },
    ref_type: DataTypes.STRING,
    ref_id: DataTypes.INTEGER
  }, {
    sequelize,
    paranoid: true,
    modelName: 'notifications',
    tableName: 'notifications',
    underscored: true,
    timestamps: true
  });

  return notifications;
};
