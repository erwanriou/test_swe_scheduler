const { Publisher, Subject } = require("test_swe_common")

// CHILDREN CLASS
class DocumentUpdatedPub extends Publisher {
  subject = Subject.DOCUMENT_SCHEDULER_UPDATED
}

exports.DocumentUpdatedPub = DocumentUpdatedPub
