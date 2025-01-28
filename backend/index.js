const express = require("express");
const movieRouter = require("./routes/movie/movie");
const userRouter = require("./routes/user/user");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello, World!");
})

app.use("/movies", movieRouter);
app.use("/users", userRouter);

app.listen(port, () => {
    console.log("App is listening on port ", port);
})