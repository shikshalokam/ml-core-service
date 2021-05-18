global.nodeScheduler = require("node-schedule");

require("./pending-assessments")();
require("./pending-observations")();
require("./completed-assessments")();
require("./completed-observations")();
require("./delete-read-notifications")();
require("./user-profile")();
// require("./delete-unread-notifications")(); < - Dirty Fix Not required for current use case ->





