const mongoose = require("mongoose")

module.exports = async client => {
  // CONNECT MONGOOSE
  await mongoose.set("strictQuery", true)
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true, maxPoolSize: 30, minPoolSize: 10 })
  // IF THE CONNECTION IS SUCCESSFUL
  if (mongoose.connection.readyState === 1) {
    console.log(`${client} Mongodb Connected`)
  }

  // IF THE CONNECTION THROW AN ERROR
  mongoose.connection.on("error", err => {
    console.log("Mongoose default connection error: " + err)
  })

  // IF THE CONNECTION IS DISCONECTED
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose default connection disconnected")
  })

  // IF THE NODE PROCESS END, CLOSE THE CONNECTION
  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      console.log("Mongoose default connection disconnected through app termination")
      process.exit(0)
    })
  })
}
