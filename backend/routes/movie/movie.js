const express = require("express");

const router = express.Router();

router.get("/all", async function (req, res) {
    res.send("Movies Router");
})

module.exports = router;// hello