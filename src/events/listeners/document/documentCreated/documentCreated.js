const { Import, Listener, Subject, QueueGroupName } = require("test_swe_common")
const Document = Import("Document", "scheduler")

// CHILDREN CLASS
class DocumentCreatedList extends Listener {
  subject = Subject.DOCUMENT_UPLOADER_CREATED
  queueGroupName = QueueGroupName.SCHEDULER_SERVICE

  async onMessage(data, msg) {
    // CHECK IF DOCUMENT EXIST
    const document = await Document.findOne({ _id: data._id })

    // AVOID MS ERRORS
    if (document) {
      console.error(`Document ${data._id} already exist on ${this.subject} for ${this.queueGroupName}.`)
      return msg.ack()
    }

    // SAVE DOCUMENT IN DATABASE
    await new Document(data).save()
    return msg.ack()
  }
}

module.exports = DocumentCreatedList
