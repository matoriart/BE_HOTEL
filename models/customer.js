'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //1 customer dapat melakukan many pemesanan
      this.hasMany(models.pemesanan, {
        foreignKey: 'id_customer',
        as : 'customer'
      })
    }
  }
  customer.init({
    id_customer : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nik: DataTypes.STRING,
    nama_customer: DataTypes.STRING,
    alamat: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'customer',
    tableName: 'customer'
  });
  return customer;
};