// REQUIRES FONCTION
const requires = paths => Object.entries(paths)?.map(folder => folder?.[1]?.map(path => require(`../listeners/${folder?.[0]}/${path}/${path}`) ?? []))

const paths = {
  batch: [
    // BATCH EVENTS
    "batchCreated",
    "batchUpdated"
  ],
  document: [
    // DOCUMENT EVENTS
    "documentCreated",
    "documentUpdated"
  ],
  project: [
    // PROJECT EVENTS
    "projectCreated"
  ]
}

const listeners = requires(paths).flat()
module.exports = listeners
