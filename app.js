const express = require("express");

// create app
const app = express();

// using handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// listening to port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));

app.use(express.json());

// rendering homepage
app.use(express.static("public"));

// for diffrent styling we pass in the css file name to style the page in addition to syle.css(default) file
app.get("/", (req, res) => res.render("home", { style: "home.css" }));
