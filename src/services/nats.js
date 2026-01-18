const { NatsWrapper } = require("./natsWrapper")
const { Subject } = require("test_swe_common")

const events = require("../events/listeners")

function getAllSubjects() {
  return Array.from(new Set(Object.values(Subject).filter(Boolean))).sort()
}

async function ensureStream(nc, streamName = "EVENTS") {
  const jsm = await nc.jetstreamManager()
  const subjects = getAllSubjects()

  try {
    const info = await jsm.streams.info(streamName)
    await jsm.streams.update(streamName, { ...info.config, subjects })
    console.log(`Stream ensured (updated): ${streamName}`)
    return
  } catch (e) {
    await jsm.streams.add({ name: streamName, subjects, retention: "limits", storage: "file" })
    console.log(`Stream ensured (created): ${streamName}`)
  }
}

module.exports = async () => {
  // CONNECT NATS
  await NatsWrapper.connect(process.env.NATS_CLIENT_ID, process.env.NATS_URL)
  await ensureStream(NatsWrapper.client(), process.env.NATS_STREAM || "EVENTS")

  // Graceful shutdown
  const shutdown = async () => {
    console.log("NATS draining...")
    await NatsWrapper.close()
    process.exit(0)
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)

  // LISTENERS
  events.forEach(Event => new Event(NatsWrapper).listen())
}
