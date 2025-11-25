const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
    const child = spawn("node", ["Bot.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        if (code == 2) {
            log.info("Restarting Bot...");
            startProject();
        }
    });
}

startProject();

// Start dashboard (optional)
if (process.env.DASHBOARD === 'true') {
    const { startDashboard } = require('./dashboard/app.js');
    startDashboard();
}
