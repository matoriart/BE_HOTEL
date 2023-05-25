'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pemesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //menerima sambungan dari user
      this.belongsTo(models.user, {
        foreignKey: 'id_user',
        as: 'user'
      })
      //menerima sambungan dari customer
      this.belongsTo(models.customer, {
        foreignKey: 'id_customer',
        as: 'customer'
      })
      //menerima sambungan dari kamar type
      this.belongsTo(models.tipe_kamar, {
        foreignKey: 'id_tipe_kamar',
        as: 'tipe_kamar'
      })

      //mengirim 1 to many ke detail
      this.hasMany(models.detail_pemesanan, {
        foreignKey: 'id_pemesanan',
        as: 'detail_pemesanan'
      })
    }
  }
  pemesanan.init({
    id_pemesanan : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: DataTypes.INTEGER,
    id_customer: DataTypes.INTEGER,
    id_tipe_kamar: DataTypes.INTEGER,
    nomor_pemesanan: DataTypes.INTEGER,
    nama_customer: DataTypes.STRING,
    email: DataTypes.STRING,
    tanggal_pemesanan: DataTypes.DATE,
    tanggal_check_in: DataTypes.DATE,
    tanggal_check_out: DataTypes.DATE,
    nama_tamu: DataTypes.STRING,
    total_kamar: DataTypes.INTEGER,
    status_pemesanan: DataTypes.ENUM('baru', 'check_in', 'check_out')
  }, {
    sequelize,
    modelName: 'pemesanan',
    tableName: 'pemesanan'
  });
  return pemesanan;
};