const db = require("mongoose")
const cron = require("../../../services/cron")

cron.define(
  "documentProcess",
  async (job, done) => {
    let counter
    console.log(`CRON RUNNING AND ${counter} DOCUMENTS PROCESSED`)

    return done()
  },
  { priority: "normal", concurrency: 1 }
)

cron.on("ready", async () => {
  await cron.processEvery(2000)
  await cron.every("*/2 * * * *", "documentProcess")
  await cron.start()
})

module.exports = cron
