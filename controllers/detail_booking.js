const model = require("../models/index");
const pemesananDetail = model.detail_pemesanan;
const sequelize = require("sequelize")

const Op = sequelize.Op

const getAllpemesananDetail = async (req, res) => {
    try {
        const result = await pemesananDetail.findAll({
            include: ["pemesanan", "kamar"],
        });

        return res.status(200).json({
            message: "Succes to get all pemesanan",
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

const findpemesananDetail = async (req, res) => {
    try {
        const keyword = new Date(req.body.keyword)

        const result = await pemesananDetail.findAll({
            include: ["pemesanan", "kamar"],
            where: {
                [Op.or]: {
                    tanggal_akses: { [Op.like]: `%${keyword}%` }
                }
            }
        })

        return res.status(200).json({
            message: "Succes to get pemesanan",
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
}

const deletepemesananDetail = async (req, res) => {
    try {
        const id = {
            id_detail_pemesanan: req.params.id_detail_pemesanan
        }

        const findData = await pemesananDetail.findOne({ where: id })
        if (findData == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        await pemesananDetail.destroy({ where: id })
        return res.status(200).json({
            message: "Succes to delete detail pemesanan",
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
}

module.exports = {
    getAllpemesananDetail,
    findpemesananDetail,
    deletepemesananDetail
};
