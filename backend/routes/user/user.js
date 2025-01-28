const express = require("express");

const router = express.Router();

router.get("/", async function (req, res) {
    res.send("User Router");
});

module.exports = router;