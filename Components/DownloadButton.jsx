const {
  React,
  i18n: { Messages },
} = require("powercord/webpack");
const { Clickable } = require("powercord/components");
const DownloadPlugin = require("../downloadPlugin");
const downloadPlugin = require("../downloadPlugin");
class DownloadButton extends React.Component {
  render() {
    var GithubLink = this.props.message.content
      .replace(/(?:\n|<|>)/g, " ")
      .split(" ")
      .filter((f) =>
        f.match(/^https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/[\w-]+/)
      )[0];
    console.log(GithubLink);
    const repoName = GithubLink.match(/[\w-]+$/)[0];
    var installed = powercord.pluginManager.isInstalled(repoName);
    return (
      <div
        className={["PluginDownloaderApply", true && "applied"]
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

module.exports = DownloadButton;
