const { Publisher, Subject } = require("test_swe_common")

// CHILDREN CLASS
class BatchNotifiedPub extends Publisher {
  subject = Subject.BATCH_SCHEDULER_NOTIFIED
}

exports.BatchNotifiedPub = BatchNotifiedPub
