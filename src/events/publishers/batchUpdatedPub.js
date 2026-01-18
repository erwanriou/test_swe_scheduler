const { Publisher, Subject } = require("test_swe_common")

// CHILDREN CLASS
class BatchUpdatedPub extends Publisher {
  subject = Subject.BATCH_SCHEDULER_UPDATED
}

exports.BatchUpdatedPub = BatchUpdatedPub
