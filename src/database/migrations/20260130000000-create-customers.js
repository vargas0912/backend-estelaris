'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      tax_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      is_international: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'México'
      },
      billing_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      municipality_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'municipalities'
          },
          key: 'id'
        }
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'branches'
          },
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Crear índices para mejorar rendimiento de queries
    await queryInterface.addIndex('customers', ['email']);
    await queryInterface.addIndex('customers', ['user_id']);
    await queryInterface.addIndex('customers', ['is_active']);
    await queryInterface.addIndex('customers', ['municipality_id']);
    await queryInterface.addIndex('customers', ['branch_id']);
    await queryInterface.addIndex('customers', ['is_international']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customers');
  }
};
