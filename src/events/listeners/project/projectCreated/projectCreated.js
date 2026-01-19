const { Import, Listener, Subject, QueueGroupName } = require("test_swe_common")
const Project = Import("Project", "scheduler")

// CHILDREN CLASS
class ProjectCreatedList extends Listener {
  subject = Subject.PROJECT_UPLOADER_CREATED
  queueGroupName = QueueGroupName.SCHEDULER_SERVICE

  async onMessage(data, msg) {
    // CHECK IF PROJECT EXIST
    const project = await Project.findOne({ _id: data._id })

    // AVOID MS ERRORS
    if (project) {
      console.error(`Project ${data._id} already exist on ${this.subject} for ${this.queueGroupName}.`)
      return msg.ack()
    }

    // SAVE PROJECT IN DATABASE
    await new Project(data).save()
    return msg.ack()
  }
}

module.exports = ProjectCreatedList
