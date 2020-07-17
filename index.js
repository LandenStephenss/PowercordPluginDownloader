const { join } = require("path");
const { Plugin } = require("powercord/entities");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { spawn } = require("child_process");
const fs = require("fs");
const { findInReactTree, forceUpdateElement } = require("powercord/util");
const DownloadButton = require("./Components/DownloadButton");
const DownloadPlugin = require("./downloadPlugin")
module.exports = class PowercordPluginDownloader extends Plugin {
  async startPlugin() {
    this.injectContextMenu();
    this.injectMiniPopover();
    this.loadStylesheet('styles/style.scss')
  }

  async injectMiniPopover() {
    const MiniPopover = await getModule(
      (m) => m.default && m.default.displayName === "MiniPopover"
    );
    inject("PluginDownloaderButton", MiniPopover, "default", (args, res) => {
      const props = findInReactTree(res, (r) => r && r.message && r.setPopout);
      if (!props || props.channel.id !== "546399060907524106") {
        return res;
      }

      res.props.children.unshift(
        React.createElement(DownloadButton, {
          message: props.message,
          main: this,
        })
      );
      return res;
    });
    MiniPopover.default.displayName = "MiniPopover";
  }

  async injectContextMenu() {
    const menu = await getModule(["MenuItem"]);
    const mdl = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );
    inject("PluginDownloader", mdl, "default", ([{ target }], res) => {
      var match = target.href.match(
        /^https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/[\w-]+/
      );
      if (target.tagName.toLowerCase() === "a" && match) {
        res.props.children.splice(
          4,
          0,
          React.createElement(menu.MenuItem, {
            name: "Install Plugin",
            separate: false,
            id: "PluginDownloaderContextLink",
            label: "Install Plugin",
            action: () => DownloadPlugin(target.href, powercord),
          })
        );
      }
      return res;
    });
    mdl.default.displayName = "MessageContextMenu";
  }
  async downloadPlugin(url) {
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
      if (data.includes("already exists"))
        status = "You already have this plugin installed";
    });
    c.on("exit", async (code) => {
      if (code === 0) {
        let files;
        try {
          files = fs.readdirSync(join(pluginDir, repoName));
        } catch (e) {
          // handle this error eventually, means the folder is nowhere to be found
        }
        if (files.includes("manifest.json")) {
          await powercord.pluginManager.remount(repoName);
          if (powercord.pluginManager.plugins.has(repoName)) {
            // tell the user the plugin is installed
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

  pluginWillUnload() {
    uninject("PluginDownloader");
  }
};
