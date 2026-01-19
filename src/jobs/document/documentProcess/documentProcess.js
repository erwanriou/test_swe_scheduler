const db = require("mongoose")
const cron = require("../../../services/cron")

// IMPORT LIBRARY + MODELS
const { Import } = require("test_swe_common")
const Batch = Import("Batch", "scheduler")
const Document = Import("Document", "scheduler")

// IMPORT SERVICES
const { storage } = require("../../../services/googleStorage")

// IMPORT EVENTS
const { NatsWrapper } = require("../../../services/natsWrapper")
const { DocumentUpdatedPub } = require("../../../events/publishers/documentUpdatedPub")
const { BatchUpdatedPub } = require("../../../events/publishers/batchUpdatedPub")
const { BatchNotifiedPub } = require("../../../events/publishers/batchNotifiedPub")

// HELPERS
const getGcsHash = async key => {
  const file = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET).file(key)
  const [meta] = await file.getMetadata()
  const crc32c = meta?.crc32c
  const md5Hash = meta?.md5Hash
  return crc32c || md5Hash || null
}

cron.define(
  "documentProcess",
  async (job, done) => {
    let processedDocs = 0
    let processedBatches = 0

    // GET A LIMITED LIST OF BATCH
    const batchs = await Batch.find({ status: "FINALIZING" }).limit(25)
    if (!batchs?.length) {
      console.log(`[CRON] documentProcess: nothing to process`)
      return done()
    }

    console.log(`[CRON] documentProcess: ${batchs.length} batch(s) found`)

    // GENERATE MATRIX OF BATCHES OF DOCUMENTS
    for (const batch of batchs) {
      // GET DOCUMENTS OF THIS BATCH THAT ARE READY
      const documents = await Document.find({
        _batch: batch._id,
        _project: batch._project,
        _user: batch._user,
        uploadStatus: { $in: ["UPLOADED"] },
        processStatus: "PENDING"
      }).limit(2000)

      if (!documents?.length) {
        // IF NO PENDING DOCS LEFT, MARK AS DONE
        const allDone = await Document.countDocuments({
          _batch: batch._id,
          processStatus: "PENDING"
        })

        if (allDone === 0) {
          await batch.set({ status: "DONE" }).save()
          await new BatchUpdatedPub(NatsWrapper).publish(batch)
          console.log(`[CRON] batch ${batch._id} DONE (no pending docs)`)
        }

        continue
      }

      // IN-MEMORY HASH MAP FOR THIS BATCH
      const seen = new Set()

      let localProcessed = 0
      let localDuplicated = 0
      for (const document of documents) {
        // BASIC SAFETY
        if (!document?.storage?.key) continue

        try {
          const hash = await getGcsHash(document.storage.key)
          if (!hash) {
            await document.set({ uploadStatus: "FAILED" }).save()
            continue
          }

          // UPDATE DOCUMENT STATUS DEPENDING OF HASH STATE
          if (seen.has(hash)) {
            localDuplicated += 1
            await document.set({ processStatus: "DUPLICATED", uploadStatus: "DISCARDED" }).save()
          } else {
            seen.add(hash)
            await document.set({ processStatus: "VALIDATED", uploadStatus: "VERIFIED" }).save()
          }

          localProcessed += 1
          processedDocs += 1
          // GENERATE DOCUMENT EVENT
          await new DocumentUpdatedPub(NatsWrapper).publish(document)
        } catch (e) {
          console.error(`[CRON] document ${document._id} failed`, e?.message || e)
          // KEEP PENDING SO IT CAN RETRY NEXT RUN
          continue
        }
      }

      // UPDATE BATCH COUNTERS
      await batch
        .set({
          "totals.processedFiles": (batch.totals.processedFiles || 0) + localProcessed,
          "totals.duplicateFiles": (batch.totals.duplicateFiles || 0) + localDuplicated
        })
        .save()

      // IF FULLY PROCESSED, MARK DONE
      if (batch.totals.processedFiles >= batch.totals.expectedFiles) {
        await batch.set({ status: "DONE" }).save()
        await new BatchUpdatedPub(NatsWrapper).publish({ batch, message: "BATCH_PROCESSED" })
      }

      // GENERATE BATCH EVENT
      await new BatchNotifiedPub(NatsWrapper).publish(batch)

      console.log(
        `[CRON] batch ${batch._id} processed=${localProcessed} duplicated=${localDuplicated} totals=${batch.totals.processedFiles}/${batch.totals.expectedFiles}`
      )
    }

    console.log(`[CRON] documentProcess done: batches=${processedBatches} docs=${processedDocs}`)
    return done()
  },
  { priority: "normal", concurrency: 1 }
)

cron.on("ready", async () => {
  await cron.processEvery(2000)
  await cron.every("*/5 * * * *", "documentProcess")
  await cron.start()
})

module.exports = cron
