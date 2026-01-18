const { Storage } = require("@google-cloud/storage")

// CONNECT TO GOOGLE CLOUD STORAGE
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    private_key: process.env.GOOGLE_STORAGE_SSH.replace(/\\n/gm, "\n"),
    client_email: process.env.GOOGLE_STORAGE_EMAIL
  }
})

exports.storage = storage
