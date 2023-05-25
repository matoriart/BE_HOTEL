const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const model = require("../models/index");
const roomType = model.tipe_kamar;

const Op = Sequelize.Op;

const addRoomType = async (req, res) => {
    try {
        const data = {
            nama_tipe_kamar: req.body.nama_tipe_kamar,
            harga: req.body.harga,
            deskripsi: req.body.deskripsi,
            foto: req.file.filename,
        };

        await roomType.create(data);
        return res.status(200).json({
            message: "Success create room type",
            data: data,
            code: 200,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const updateRoomType = async (req, res) => {
    try {
        const id = {
            id_tipe_kamar: req.params.id_tipe_kamar
        };
        const data_edit = {
            nama_tipe_kamar: req.body.nama_tipe_kamar,
            harga: req.body.harga,
            deskripsi: req.body.deskripsi,
        };

        const result = await roomType.findOne({ where: id });
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        if (req.file) {
            try {
                const oldFileName = result.foto;

                //delete old file
                const dir = path.join(__dirname, "../uploads/image", oldFileName);
                fs.unlink(dir, (err) => console.log(err));
            } catch (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error while update file",
                    err: err,
                });
            }

            data_edit.foto = req.file.filename;
        }

        await roomType.update(data_edit, { where: id });
        return res.status(200).json({
            message: "Success update room type",
            code: 200,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const deleteRoomType = async (req, res) => {
    try {
        const id = {
            id_tipe_kamar: req.params.id_tipe_kamar
        };
        const result = await roomType.findOne({ where: id });
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }
        try {
            const oldFileName = result.foto;

            //delete old file
            const dir = path.join(__dirname, "../uploads/image", oldFileName);
            fs.unlink(dir, (err) => console.log(err));
        } catch (err) {
            console.log(err);
        }

        await roomType.destroy({ where: id });
        return res.status(200).json({
            message: "Success to delete room type",
            code: 200,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const getAllRoomType = async (req, res) => {
    try {
        const result = await roomType.findAll();
        return res.status(200).json({
            message: "Success to get all room type",
            code: 200,
            count: result.length,
            data: result,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const getOneRoomType = async (req, res) => {
    try {
        const params = {
            id_tipe_kamar: req.params.id_tipe_kamar,
        };
        const result = await roomType.findOne({ where: params });
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }
        
        return res.status(200).json({
            message: "Success to get one room type",
            code: 200,
            data: result,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const findRoomTypeDataFilter = async (req, res) => {
    try {
        const keyword = req.body.keyword

        const result = await roomType.findAll({
            where: {
                [Op.or]: {
                    nama_tipe_kamar: { [Op.like]: `%${keyword}%` },
                    harga: { [Op.like]: `%${keyword}%` },
                }
            }
        });

        return res.status(200).json({
            message: "Succes to get all room type by filter",
            count: result.length,
            data: result,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

module.exports = {
    addRoomType,
    updateRoomType,
    deleteRoomType,
    getAllRoomType,
    getOneRoomType,
    findRoomTypeDataFilter
};