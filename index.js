const {
    Plugin
} = require("powercord/entities");
const {
    inject,
    uninject
} = require("powercord/injector");
const {
    getModule,
    React
} = require("powercord/webpack");
const {
    findInReactTree
} = require("powercord/util")

const Card = require("./Components/Store/Card");
const Settings = require("./Components/Settings");


module.exports = class PowercordPluginDownloader extends Plugin {
    async startPlugin() {
        this.injectStore();
        this.loadStylesheet("style.scss")

        powercord.api.settings.registerSettings("PPD", {
            category: this.entityID,
            label: 'Powercord Plugin Downloader',
            render: (props) => React.createElement(Settings, {
                    ...props
                })
            
        })
    }


    async injectStore() {
        const MessageComponent = await getModule(m => m.default && m.default.displayName === "Message");

        inject("PowercordPluginDownloaderMessageComponent", MessageComponent, "default", (args, res) => {

            if(this.settings.get("beta", false) === false) return res;
            const props = findInReactTree(res, r => r && r.message);

            if (!props || props.channel?.id !== "755005584322854972") {
                return res;
            } else {
                return React.createElement(Card, {
                    message: props
                });
            }
        })
    }


    pluginWillUnload() {
        uninject("PowercordPluginDownloaderMessageComponent")
        powercord.api.settings.unregisterSettings("PPD")
    }
};