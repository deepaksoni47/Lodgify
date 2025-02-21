const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));