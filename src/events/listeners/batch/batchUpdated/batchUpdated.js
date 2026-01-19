const { Import, Listener, Subject, QueueGroupName } = require("test_swe_common")
const Batch = Import("Batch", "scheduler")

// CHILDREN CLASS
class BatchUpdatedList extends Listener {
  subject = Subject.BATCH_UPLOADER_UPDATED
  queueGroupName = QueueGroupName.SCHEDULER_SERVICE

  async onMessage(data, msg) {
    const batch = await Batch.findOne({ _id: data._id })

    // AVOID MS ERRORS
    if (!batch) {
      console.error(`Batch ${data._id} not found on ${this.subject} for ${this.queueGroupName}.`)
      return msg.ack()
    }

    try {
      // UPDATE BATCH
      await Batch.updateOne({ _id: batch._id }, { $set: data })
      return msg.ack()
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = BatchUpdatedList
