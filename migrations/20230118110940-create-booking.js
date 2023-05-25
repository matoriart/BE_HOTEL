'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pemesanan', {
      id_pemesanan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id_user"
        }
      },
      id_customer: {
        type: Sequelize.INTEGER,
        references: {
          model: "customer",
          key: "id_customer"
        }
      },
      id_tipe_kamar: {
        type: Sequelize.INTEGER,
        references: {
          model: "tipe_kamar",
          key: "id_tipe_kamar"
        }
      },
      nomor_pemesanan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      nama_customer: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      tanggal_pemesanan: {
        type: Sequelize.DATE
      },
      tanggal_check_in: {
        type: Sequelize.DATE
      },
      tanggal_check_out: {
        type: Sequelize.DATE
      },
      nama_tamu: {
        type: Sequelize.STRING
      },
      total_kamar: {
        type: Sequelize.INTEGER
      },
      status_pemesanan: {
        type: Sequelize.ENUM('baru', 'check_in', 'check_out')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking');
  }
};