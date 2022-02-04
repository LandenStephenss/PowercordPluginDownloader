const { Plugin } = require("powercord/entities");
const { inject, uninject } = require("powercord/injector");
const { getModule, React } = require("powercord/webpack");
const { findInReactTree } = require("powercord/util");
const Button = require("./Components/Button")

module.exports = class Downloader extends Plugin {
    async startPlugin() {
        this.log("Injecting MiniPopover...")
        await this.injectPopover();
        this.log("Loading CSS...");
        this.loadStylesheet("style.scss");
    }

    // done
    async injectPopover() {
        const MiniPopover = await getModule(m => m.default && m.default.displayName === "MiniPopover");
        inject("PD-MiniPopover", MiniPopover, "default", (args, res) => {
            const props = findInReactTree(res, r => r && r.message && r.setPopout);
            if (!props || !["755005710323941386", "755005584322854972"].includes(props.channel?.id)) return res;
            this.log("Popover injected")
            res.props.children.unshift(
                React.createElement(Button, {
                    message: props.message,
                    main: this,
                    type: props.channel.id === "755005710323941386" ? "theme" : "plugin"
                })
            )
            return res;
        })
        MiniPopover.default.displayName = "MiniPopover";
    }

    async lazyPatchCtxMenu(displayName, patch) {
        const module = getModule(m => m.default && m.default.displayName === displayName);
        if (module) {
            patch(module);
        } else {
            const module = getModule(["openContextMenuLazy"], false);
            inject("pd-lazy-ctx-menu", module, "openContextMenuLazy", (args) => {
                const lazyRender = args[1];
                args[1] = async () => {
                    const render = await lazyRender(args[0])

                    return (config) => {
                        const menu = render(config);
                        if (menu?.type?.displayName === displayName && patch) {
                            uninject("pd-lazy-ctx-menu");
                            patch(getModule(m => m.default && m.default.displayName === displayName, false));
                            patch = false;
                        }
                        return false
                    }
                }
                return args;
            }, true)
        }
    }

    pluginWillUnload() {
        uninject("PD-MiniPopover")
    }
}