const mongoDbConnect = require("./mongoDb")
const nats = require("./nats")

module.exports = async client => {
  try {
    await nats()
    await mongoDbConnect(client)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
