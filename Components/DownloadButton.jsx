const {
    React,
    i18n: { Messages },
  } = require("powercord/webpack");
  const { Clickable } = require("powercord/components");
  const downloadPlugin = require("../downloadPlugin");
  class DownloadButton extends React.Component {
    render() {
      var [GithubLink, , , repoName] = this.props.message.content.match(/https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/([\w-\._]+)\/?/) ?? [];
      if (!GithubLink) return <></>;
      var installed = powercord.pluginManager.isInstalled(repoName);
      if (!this.props.message.content.includes("https://github.com")) {
        return (
          <div
            className={["PluginDownloaderApply", installed ? "applied" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <Clickable
              onClick={() => {
                if (installed) return;
                downloadPlugin(GithubLink, powercord);
              }}
            >
              No Plugin
            </Clickable>
          </div>
        );
      } else {
        return (
          <div
            className={["PluginDownloaderApply", installed && "applied"]
              .filter(Boolean)
              .join(" ")}
          >
            <Clickable
              onClick={() => {
                if (installed) return;
                downloadPlugin(GithubLink, powercord);
              }}
            >
              {installed ? "Plugin Installed" : "Download Plugin"}
            </Clickable>
          </div>
        );
      }
    }
  }
  
  module.exports = DownloadButton;