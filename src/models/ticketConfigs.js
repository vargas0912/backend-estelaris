'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ticketConfigs extends Model {
    static associate(models) {
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
    }
  }

  ticketConfigs.init({
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('sale', 'payment'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    header_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    footer_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    show_logo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    show_iva: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    show_barcode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    show_folio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    show_cashier: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    show_branch_address: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    paper_width: {
      type: DataTypes.ENUM('58mm', '80mm'),
      allowNull: false,
      defaultValue: '80mm'
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ticketConfigs',
    tableName: 'ticket_configs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return ticketConfigs;
};
