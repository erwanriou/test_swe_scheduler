const { Import, Listener, Subject, QueueGroupName } = require("test_swe_common")
const Batch = Import("Batch", "scheduler")

// CHILDREN CLASS
class BatchCreatedList extends Listener {
  subject = Subject.BATCH_UPLOADER_CREATED
  queueGroupName = QueueGroupName.SCHEDULER_SERVICE

  async onMessage(data, msg) {
    // CHECK IF BATCH EXIST
    const batch = await Batch.findOne({ _id: data._id })

    // AVOID MS ERRORS
    if (batch) {
      console.error(`Batch ${data._id} already exist on ${this.subject} for ${this.queueGroupName}.`)
      return msg.ack()
    }

    // SAVE BATCH IN DATABASE
    await new Batch(data).save()
    return msg.ack()
  }
}

module.exports = BatchCreatedList
