const Cron = require("@pulsecron/pulse").default

const cron = new Cron({
  processEvery: "1 minute",
  db: { address: process.env.MONGO_URI, collection: "jobs" }
}).setMaxListeners(300)

cron.on("fail", (error, job) => {
  console.error(`JOB ${job?.attrs?.name}, failed`, error)
})

module.exports = cron
