'use strict'
const express = require("express")

const kamarController = require("../controllers/room")
const router = new express.Router()
const auth = require("../auth/auth")

router.post("/add", auth.authVerify, kamarController.addkamar)
router.put("/update/:id_kamar", auth.authVerify, kamarController.updatekamar)
router.delete("/delete/:id_kamar", auth.authVerify, kamarController.deletekamar)
router.get("/", kamarController.findAllkamar)
router.get("/kamar-type/:id_tipe_kamar", kamarController.findkamarByIdkamarType)
router.post("/find/available", kamarController.findkamarByFilterDate)
router.post("/find/filter", kamarController.findkamarDataFilter)

module.exports = router