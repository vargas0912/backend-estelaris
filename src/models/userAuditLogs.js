'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class userAuditLogs extends Model {
    static associate() {}
  }

  userAuditLogs.init(
    {
      action: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      caller_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      target_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      paranoid: false,
      modelName: 'userAuditLogs',
      tableName: 'user_audit_logs',
      underscored: true
    }
  );

  return userAuditLogs;
};
