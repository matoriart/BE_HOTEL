const sequelize = require("sequelize");
const moment = require("moment");

const Op = sequelize.Op;

const model = require("../models/index");
const booking = model.pemesanan;
const detailBooking = model.detail_pemesanan;
const room = model.kamar;
const roomType = model.tipe_kamar;
const customer = model.customer;

const addBookingRoom = async (req, res) => {
    try {
        const data = {
            id_user: req.body.id_user,
            id_customer: req.body.id_customer,
            id_tipe_kamar: req.body.id_tipe_kamar,
            nomor_pemesanan: req.body.nomor_pemesanan,
            tanggal_pemesanan: req.body.tanggal_pemesanan,
            tanggal_check_in: req.body.tanggal_check_in,
            tanggal_check_out: req.body.tanggal_check_out,
            nama_tamu: req.body.nama_tamu,
            total_kamar: req.body.total_kamar,
            status_pemesanan: "baru",
        };

        // customer data
        const customerData = await customer.findOne({
            where: { id_customer: data.id_customer }
        })
        if (customerData == null) {
            return res.status(404).json({
                message: "Data customer not found!"
            });
        }

        data.nama_customer = customerData.nama_customer
        data.email = customerData.email

        // rooms data
        let roomsData = await room.findAll({
            where: {
                id_tipe_kamar: data.id_tipe_kamar
            }
        });

        //room type data
        let roomTypeData = await roomType.findAll({
            where: { id_tipe_kamar: data.id_tipe_kamar }
        })
        if (roomTypeData == null) {
            return res.status(404).json({
                message: "Data room type not found!"
            });
        }

        //cek room yang ada pada tabel booking_detail
        let dataBooking = await roomType.findAll({
            where: { id_tipe_kamar: data.id_tipe_kamar },
            include: [
                {
                    model: room,
                    as: "kamar",
                    attributes: ["id_kamar", "id_tipe_kamar"],
                    include: [
                        {
                            model: detailBooking,
                            as: "detail_pemesanan",
                            attributes: ["tanggal_akses"],
                            where: {
                                tanggal_akses: {
                                    [Op.between]: [data.tanggal_check_in, data.tanggal_check_out]
                                }
                            }
                        }
                    ]

                }
            ]
        })

        // get available rooms
        const bookedRoomIds = dataBooking[0].kamar.map((kamar) => kamar.id_kamar)
        const availableRooms = roomsData.filter((kamar) => !bookedRoomIds.includes(kamar.id_kamar))

        //proses add data room yang available to one array
        const roomsDataSelected = availableRooms.slice(0, data.total_kamar)

        //count day 
        const checkInDate = new Date(data.tanggal_check_in)
        const checkOutDate = new Date(data.tanggal_check_out)
        const dayTotal = Math.round((checkOutDate - checkInDate) / (1000 * 3600 * 24))

        //process add booking and detail
        try {
            if (roomsData == null || availableRooms.length < data.total_kamar || dayTotal == 0 || roomsDataSelected == null) {
                return res.status(404).json({
                    message: "Room not found",
                    code: 404,
                });
            }

            const result = await booking.create(data)
            //add detail
            for (let i = 0; i < dayTotal; i++) {
                for (let j = 0; j < roomsDataSelected.length; j++) {
                    const accessDate = new Date(checkInDate)
                    accessDate.setDate(accessDate.getDate() + i)
                    const dataDetailBooking = {
                        id_pemesanan: result.id_pemesanan,
                        id_kamar: roomsDataSelected[j].id_kamar,
                        tanggal_akses: accessDate,
                        total_harga: roomTypeData[0].harga

                    }
                    await detailBooking.create(dataDetailBooking)
                }

            }
            return res.status(200).json({
                data: result,
                message: "Success to create booking room",
                code: 200,
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error when create booking",
                err: err,
            });

        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
};

const deleteOneBooking = async (req, res) => {
    try {
        const idBooking = req.params.id_pemesanan
        const findDataBooking = await booking.findOne({
            where: { id_pemesanan: idBooking }
        })
        if (findDataBooking == null) {
            return res.status(404).json({
                message: "Data not found!",
            });
        }

        const findDataDetailBooking = await detailBooking.findAll({ where: { id_pemesanan: idBooking } })
        if (findDataDetailBooking == null) {
            return res.status(404).json({
                message: "Data not found!",
                err: err,
            });
        }

        await detailBooking.destroy({ where: { id_pemesanan: idBooking } })
        await booking.destroy({ where: { id_pemesanan: idBooking } })

        return res.status(200).json({
            message: "Success to delete booking",
            code: 200,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });
    }
}

const updateStatusBooking = async (req, res) => {
    try {
        const idx = { id_pemesanan: req.body.id_pemesanan }

        const result = booking.findOne({ where: idx })
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        const data = {
            status_pemesanan: req.body.status_pemesanan
        }

        if (data.status_pemesanan == "check_out") {
            await booking.update(data, { where: idx })

            const updateTglAccess = {
                tanggal_akses: null
            }
            await detailBooking.update(updateTglAccess, { where: idx })
            return res.status(200).json({
                message: "Success update status booking to check out",
                code: 200
            })
        }

        await booking.update(data, { where: idx })
        return res.status(200).json({
            message: "Success update status booking",
            code: 200
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal error",
            err: err,
        });

    }
}

const getOneBooking = async (req, res) => {
    try {
        const id = {
            id_pemesanan: req.params.id_pemesanan,
        };

        const result = await booking.findOne({
            include: ["user", "customer", "tipe_kamar"],
            where: id,
        });
        if (result == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        return res.status(200).json({
            message: "Succes to get one booking",
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

const getAllBooking = async (req, res) => {
    try {
        const result = await booking.findAll({
            include: ["tipe_kamar", "detail_pemesanan"],
        });

        return res.status(200).json({
            message: "Succes to get all booking",
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

const findBookingDataFilter = async (req, res) => {
    try {
        const keyword = req.body.keyword

        const result = await booking.findAll({
            include: ["user", "tipe_kamar", "customer"],
            where: {
                [Op.or]: {
                    nomor_pemesanan: { [Op.like]: `%${keyword}%` },
                    nama_customer: { [Op.like]: `%${keyword}%` },
                    status_pemesanan: { [Op.like]: `%${keyword}%` },
                    nama_tamu: { [Op.like]: `%${keyword}%` }
                },
                [Op.and]: {
                    id_customer: req.params.id_customer
                }
            }
        });

        return res.status(200).json({
            message: "Succes to get all booking by filter",
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

const findBookingDataFilterForUser = async (req, res) => {
    try {
        const keyword = req.body.keyword

        const result = await booking.findAll({
            include: ["user", "tipe_kamar", "customer"],
            where: {
                [Op.or]: {
                    nomor_pemesanan: { [Op.like]: `%${keyword}%` },
                    nama_customer: { [Op.like]: `%${keyword}%` },
                    status_pemesanan: { [Op.like]: `%${keyword}%` },
                    nama_tamu: { [Op.like]: `%${keyword}%` }
                }
            }
        });

        return res.status(200).json({
            message: "Succes to get all booking by filter",
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

const findBookingByNameCustomer = async (req, res) => {
    try {
        const keyword = req.body.keyword;

        const result = await booking.findAll({
            include: ["tipe_kamar"],
            where: {
                [Op.or]: {
                    nama_customer: { [Op.like]: `%${keyword}%` },
                },
            },
        });

        return res.status(200).json({
            message: "Succes to get all booking by customer name",
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

const findBookingByIdCustomer = async (req, res) => {
    try {
        const id = {
            id_customer: req.params.id_customer
        }

        const customerData = await customer.findOne({
            where: id
            
        })
        if (customerData == null) {
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        const result = await booking.findAll({ where: id , include: ["tipe_kamar"],})
        return res.status(200).json({
            message: "Succes to get all booking by id customer",
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

module.exports = {
    addBookingRoom,
    deleteOneBooking,
    updateStatusBooking,
    getAllBooking,
    getOneBooking,
    findBookingDataFilter,
    findBookingByNameCustomer,
    findBookingByIdCustomer,
    findBookingDataFilterForUser
};