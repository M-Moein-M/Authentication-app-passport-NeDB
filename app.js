const express = require("express");

// create app
const app = express();

// listen to port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));

app.use(express.json());
app.use(express.static("public"));
