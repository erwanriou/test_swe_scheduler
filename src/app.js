require("express-async-errors")
const express = require("express")
const helmet = require("helmet")
const compression = require("compression")
const bodyParser = require("body-parser")
const cookieSession = require("cookie-session")
const cookieParser = require("cookie-parser")
const { isError } = require("test_swe_common")

// IMPORT CRONS
require("./jobs")

// LAUNCH EXPRESS
const app = express()
const secure = process.env.NODE_ENV !== "test"

// USE MAIN MIDDELWWARE
app.set("trust proxy", true)
app.use(helmet())
app.disable("x-powered-by")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieSession({ name: "express:sess", signed: false, secure }))
app.use(cookieParser())
app.use(compression())

// USE ROUTES
app.get("/", (_, res) => res.status(200).send("Scheduler"))
app.get("/healthz.js", (_, res) => res.status(200).send("Healthz Check"))

// USE CUSTOM MIDDLWWARE
app.use(isError)

module.exports = app
