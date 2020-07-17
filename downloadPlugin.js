const { join } = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
async function downloadPlugin(url, powercord) {
  const pluginDir = join(__dirname, "..");
  const repoName = url.match(/[\w-]+$/)[0];
  let status;
  let c;
  try {
    c = spawn("git", ["clone", url], {
      cwd: pluginDir,
      windowsHide: true,
    });
  } catch (e) {
    console.error("Could not install plugin");
  }
  c.stdout.on("data", (data) => console.log(data.toString()));
  c.stderr.on("data", (data) => {
    data = data.toString();
    console.error(data);
    if (data.includes("already exists")) {
        powercord.api.notices.sendToast('PDAlreadyInstalled', {
            header: 'Plugin Already Installed', // required
            content: 'Plugin Already Installed',
            type: 'info',
            timeout: 10e3,
            buttons: [ {
              text: 'Got It', // required
              color: 'green',
              size: 'medium',
              look: 'outlined',
            } ],
          });
    }
  });
  c.on("exit", async (code) => {
    if (code === 0) {
      let files;
      try {
        files = fs.readdirSync(join(pluginDir, repoName));
        console.log(files);
      } catch (e) {
        // handle this error eventually, means the folder is nowhere to be found
        console.error(e);
      }
      if (files.includes("manifest.json")) {
        await powercord.pluginManager.remount(repoName);
        if (powercord.pluginManager.plugins.has(repoName)) {
          powercord.api.notices.sendToast("PDPluginInstalled", {
            header: "Plugin Installed", // required
            content: "Plugin Installed",
            type: "info",
            timeout: 10e3,
            buttons: [
              {
                text: "Got It", // required
                color: "green",
                size: "medium",
                look: "outlined",
              },
            ],
          });
        } else {
          // remount failed, might just force restart
        }
      } else {
        // means there is no manifest
      }
    } else {
      // show the error
    }
  });
}

module.exports = downloadPlugin;
