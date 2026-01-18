const { connect } = require("nats")

class NatsWrapper {
  _nc // NATS connection
  _js // JetStream client

  client() {
    if (!this._nc) {
      throw new Error("Cannot access NATS connection before connecting")
    }
    return this._nc
  }

  js() {
    if (!this._js) {
      throw new Error("Cannot access JetStream before connecting")
    }
    return this._js
  }

  async connect(clientId, url) {
    this._nc = await connect({
      servers: url,
      name: clientId
    })

    this._js = this._nc.jetstream()
    console.log(`Scheduler connected to NATS (JetStream) as ${clientId}`)
  }

  async close() {
    if (!this._nc) return
    try {
      await this._nc.drain()
    } catch (e) {}
  }
}

exports.NatsWrapper = new NatsWrapper()
