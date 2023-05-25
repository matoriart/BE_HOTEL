'use strict'
const express = require("express")

const kamarTypeController = require("../controllers/room_type")
const { upload } = require("../utils/upload")
const router = new express.Router()
const auth = require("../auth/auth")

router.post("/add", auth.authVerify, upload.single("foto"), kamarTypeController.addRoomType)
router.put("/update/:id_tipe_kamar", auth.authVerify, upload.single("foto"), kamarTypeController.updateRoomType)
router.delete("/delete/:id_tipe_kamar", auth.authVerify, kamarTypeController.deleteRoomType)
router.get("/", kamarTypeController.getAllRoomType)
router.get("/:id_tipe_kamar", kamarTypeController.getOneRoomType)
router.post("/find/filter", kamarTypeController.findRoomTypeDataFilter)

module.exports = router