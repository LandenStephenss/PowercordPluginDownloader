const { Plugin } = require("powercord/entities");
const { inject, uninject } = require("powercord/injector");
const { getModule, React } = require("powercord/webpack");
const { findInReactTree } = require("powercord/util");
const Button = require("./Components/Button")
const { get } = require("powercord/http");
const download = require("./download.js");

module.exports = class Downloader extends Plugin {
    async startPlugin() {
        this.log("Injecting MiniPopover...")
        await this.injectPopover();
        this.log("Loading CSS...");
        this.loadStylesheet("style.scss");
        this.log("Injecting MessageContextMenu...");
        await this.injectCtxMenu();
        this.registerCommand();
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

    async injectCtxMenu() {
        await this.lazyPatchCtxMenu('MessageContextMenu', async (mod) => {
            const menu = await getModule(["MenuItem"]);

            inject("PD-ContextMenu", mod, "default", ([{ target }], res) => {
                if (!target || !target?.href || !target?.tagName || target.tagName.toLowerCase() !== "a") return res;
                const parsedUrl = new URL(target.href);
                const isGitHub = parsedUrl.hostname.split(".").slice(-2).join(".") === "github.com";
                const [, username, reponame] = parsedUrl.pathname.split("/");

                if (isGitHub && username && reponame) {
                    get(`https://github.com/${username}/${reponame}/raw/HEAD/powercord_manifest.json`).then((r) => {
                        if (r?.statusCode === 302) {
                            res.props.children.splice(
                                4,
                                0,
                                React.createElement(menu.MenuItem, {
                                    name: `Install Theme`,
                                    seperate: true,
                                    id: "DownloaderContextLink",
                                    label: `Install Theme`,
                                    action: () => download(target.href, powercord, "theme")
                                })
                            )
                        }
                    }).catch(null);
                    get(`https://github.com/${username}/${reponame}/raw/HEAD/manifest.json`).then((r) => {
                        if (r?.statusCode === 302) {
                            res.props.children.splice(
                                4,
                                0,
                                React.createElement(menu.MenuItem, {
                                    name: `Install Plugin`,
                                    seperate: true,
                                    id: "DownloaderContextLink",
                                    label: `Install Plugin`,
                                    action: () => download(target.href, powercord, "plugin")
                                })
                            )
                        }
                    }).catch(null);
                }

                return res;
            })

            mod.default.displayName = "MessageContextMenu";
        })
    }

    async lazyPatchCtxMenu(displayName, patch) {
        const filter = m => m.default && m.default.displayName === displayName;
        const m = getModule(filter, false);
        if (m) patch(m);
        else {
            const module = getModule(['openContextMenuLazy'], false);
            inject('pd-lazy-contextmenu', module, 'openContextMenuLazy', args => {
                const lazyRender = args[1];
                args[1] = async () => {
                    const render = await lazyRender(args[0]);

                    return config => {
                        const menu = render(config);
                        if (menu?.type?.displayName === displayName && patch) {
                            uninject('pd-lazy-contextmenu');
                            patch(getModule(filter, false));
                            patch = false;
                        }
                        return menu;
                    };
                };
                return args;
            },
                true
            );
        }
    }

    registerCommand() {
        powercord.api.commands.registerCommand({
            command: "download",
            description: "Download a Powercord plugin or theme",
            usage: "{c} [url]",
            executor: (args) => {
                if (!args.length) return;
                try {
                    const parsedUrl = new URL(args[0]);
                    const isGitHub = parsedUrl.hostname.split(".").slice(-2).join(".") === "github.com";
                    const [, username, reponame] = parsedUrl.pathname.split("/");
                    if (isGitHub && username && reponame) {
                        get(`https://github.com/${username}/${reponame}/raw/HEAD/manifest.json`).then((r) => {
                            if (r?.statusCode === 302) {
                                download(args[0], powercord, "plugin");
                            }
                        }).catch(null);
                        get(`https://github.com/${username}/${reponame}/raw/HEAD/powercord_manifest.json`).then((r) => {
                            if (r?.statusCode === 302) {
                                download(args[0], powercord, "theme");
                            }
                        }).catch(null);
                    } else {
                        return { result: "Invalid github repository" };
                    }
                } catch (e) {
                    return { result: "Invalid URL" };
                }
            }
        });
    }



    pluginWillUnload() {
        uninject("PD-MiniPopover");
        uninject("PD-ContextMenu");
        uninject('pd-lazy-contextmenu');
        powercord.api.commands.unregisterCommand("download");
    }
}
