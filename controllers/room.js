const Sequelize = require("sequelize");

const model = require("../models/index");
const kamar = model.kamar;
const kamarType = model.tipe_kamar
const detailBooking = model.detail_pemesanan

const Op = Sequelize.Op

const addkamar = async (req, res) => {
    try {
        const data = {
            nomor_kamar: req.body.nomor_kamar,
            id_tipe_kamar: req.body.id_tipe_kamar,
        };

        await kamar.create(data);
        return res.status(200).json({
            message: "Success create kamar",
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

const updatekamar = async (req, res) => {
    try {
        const id = {
            id_kamar: req.params.id_kamar,
        };

        const data_edit = {
            nomor_kamar: req.body.nomor_kamar,
            id_tipe_kamar: req.body.id_tipe_kamar,
        };

        const result = await kamar.findOne({ where: id })
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        await kamar.update(data_edit, { where: id });
        return res.status(200).json({
            message: "Success update kamar",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const deletekamar = async (req, res) => {
    try {
        const id = {
            id_kamar: req.params.id_kamar,
        };

        const result = await kamar.findOne({ where: id })
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        await kamar.destroy({ where: id });
        return res.status(200).json({
            message: "Success to delete kamar",
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

//get all kamar include kamarType
const findAllkamar = async (req, res) => {
    try {
        const result = await kamar.findAll({
            include: ['tipe_kamar']
        });

        return res.status(200).json({
            message: "Success to get all kamar",
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

//findAllkamar berdasarkan kamartype
const findkamarByIdkamarType = async (req, res) => {
    try {
        const id = {
            id_tipe_kamar: req.params.id_tipe_kamar,
        };

        const resultkamarType = await kamarType.findOne({ where: id })
        if (resultkamarType == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        const result = await kamar.findAll({
            include: ["tipe_kamar"],
            where: params,
        });

        return res.status(200).json({
            message: "Succes to get all kamar by type kamar",
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

const findkamarByFilterDate = async (req, res) => {
    const checkInDate = req.body.tanggal_check_in
    const checkOutDate = req.body.tanggal_check_out

    if (checkInDate === "" || checkOutDate === "") {
        return res.status(200).json({
            message: "null",
            code: 200,
            kamar : []
        });
    }

    const kamarData = await kamarType.findAll({
        attributes: ["id_tipe_kamar", "nama_tipe_kamar", "harga", "deskripsi", "foto"],
        include: [
            {
                model: kamar,
                as: "kamar"

            }
        ]
    })

    const kamarBookedData = await kamarType.findAll({
        atrributes: ["id_tipe_kamar", "nama_tipe_kamar", "harga", "deskripsi", "foto"],
        include: [
            {
                model: kamar,
                as: "kamar",
                include: [
                    {
                        model: detailBooking,
                        as: "detail_pemesanan",
                        attributes: ["tanggal_akses"],
                        where: {
                            tanggal_akses: {
                                [Op.between]: [checkInDate, checkOutDate]
                            }
                        }
                    }
                ]
            }
        ]
    })

    const available = []
    const availableByType = []

    for (let i = 0; i < kamarData.length; i++) {
        kamarData[i].kamar.forEach((kamar) => {
            let isBooked = false
            kamarBookedData.forEach((booked) => {
                booked.kamar.forEach((bookedkamar) => {
                    if (kamar.id_kamar === bookedkamar.id_kamar) {
                        isBooked = true
                    }
                })
            })

            if (!isBooked) {
                available.push(kamar)
            }
        })
    }

    for (let i = 0; i < kamarData.length; i++) {
        let kamarType = {}
        kamarType.id_tipe_kamar = kamarData[i].id_tipe_kamar
        kamarType.nama_tipe_kamar = kamarData[i].nama_tipe_kamar
        kamarType.harga = kamarData[i].harga
        kamarType.deskripsi = kamarData[i].deskripsi
        kamarType.foto = kamarData[i].foto
        kamarType.kamar = []
        available.forEach((kamar) => {
            if (kamar.id_tipe_kamar === kamarData[i].id_tipe_kamar) {
                kamarType.kamar.push(kamar)
            }
        })
        if (kamarType.kamar.length > 0) {
            availableByType.push(kamarType)
        }
    }

    return res.status(200).json({
        message: "Succes to get available room by room type",
        code: 200,
        kamarAvailable: available,
        kamarAvailableCount: available.length,
        kamar: availableByType,
        typekamarCount: availableByType.length
    });

}

const findkamarDataFilter = async (req, res) => {
    try {
        const keyword = req.body.keyword

        const result = await kamar.findAll({
            include: ["tipe_kamar"],
            where: {
                [Op.or]: {
                    nomor_kamar: { [Op.like]: `%${keyword}%` }
                }
            }
        });

        return res.status(200).json({
            message: "Succes to get all kamar by filter",
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
    addkamar,
    updatekamar,
    deletekamar,
    findAllkamar,
    findkamarByIdkamarType,
    findkamarByFilterDate,
    findkamarDataFilter
};
