const app = require("./app")
const transaction = require("./services/transactions")

// CONNECT DATABASE
transaction("Scheduler")

// LISTEN APP
app.listen(3000, () => console.log("Scheduler listening on port 3000!"))
