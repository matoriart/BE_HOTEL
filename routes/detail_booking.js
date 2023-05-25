'use strict'
const express = require("express")

const pemesananDetailController = require("../controllers/detail_booking")
const router = new express.Router()

router.get("/", pemesananDetailController.getAllpemesananDetail)
router.delete("/delete/:id_detail_pemesanan", pemesananDetailController.deletepemesananDetail)
router.post("/find/access_date", pemesananDetailController.findpemesananDetail)

module.exports = router