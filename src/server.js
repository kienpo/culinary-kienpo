import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/view-engine";
import webRoutes from "./router/web";

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
webRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("App is running at the port" + port);
})
