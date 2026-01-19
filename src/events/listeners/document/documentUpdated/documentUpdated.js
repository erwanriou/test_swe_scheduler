const { Import, Listener, Subject, QueueGroupName } = require("test_swe_common")
const Document = Import("Document", "scheduler")

// CHILDREN CLASS
class DocumentUpdatedList extends Listener {
  subject = Subject.DOCUMENT_UPLOADER_UPDATED
  queueGroupName = QueueGroupName.SCHEDULER_SERVICE

  async onMessage(data, msg) {
    const document = await Document.findOne({ _id: data._id })

    // AVOID MS ERRORS
    if (!document) {
      console.error(`Document ${data._id} not found on ${this.subject} for ${this.queueGroupName}.`)
      return msg.ack()
    }

    try {
      // UPDATE BATCH
      await Document.updateOne({ _id: document._id }, { $set: data })
      return msg.ack()
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = DocumentUpdatedList
