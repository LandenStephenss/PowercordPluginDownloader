const { React } = require("powercord/webpack");
const { Clickable, Tooltip, Button, Icons: { Person, Receipt, Tag } } = require("powercord/components");
const { shell: { openExternal } } = require('electron');
const DownloadPlugin = require("../../downloadPlugin");

module.exports = class Card extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.message = props.message;

        let [, , , repoName] = this.message.message.content.match(/https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/([\w-\._]+)\/?/) ?? [];
        this.state = {
            installed: powercord.pluginManager.isInstalled(repoName)
        }
    }
    render() {

        let [GithubLink, , , repoName] = this.message.message.content.match(/https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/([\w-\._]+)\/?/) ?? [];



        if (!GithubLink) {
            return null
        } else {
            return (
                <div className="PPD-StoreCard">
                    <h1 className="PPD-CardTitle">
                        <span>{repoName}</span>
                        <Tooltip position="top" text="Go to repository">
                            <Clickable className="redirect" onClick={() => { openExternal(GithubLink)}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </Clickable>
                        </Tooltip>
                    </h1>

                    <div className="PPD-Details">
                        <div className="PPD-CardContent">
                            <div className="PPD-CardDescription">
                                <Tooltip position="top" text="Description">
                                    <Receipt height={24} width={24} />
                                </Tooltip>
                                <span>This is a description test of a plugin</span>
                            </div>

                            <div className="PPD-Metadata">
                                <div className="PPD-Author">
                                    <Tooltip position="top" text="Author">
                                        <Person width={24} height={24} />
                                    </Tooltip>
                                    <span>{this.message.author.nick}</span>
                                </div>
                                <div className="PPD-Version">
                                    <Tooltip position="top" text="Version">
                                        <Tag width={24} height={24} />
                                    </Tooltip>
                                    <span> Version </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="PPD-StoreCardFooter">
                        <div className="PPD-StoreButtons">
                            {this.state.installed ?
                                <Button disabled color={Button.Colors.RED}>Already Installed</Button> :
                                <Button onClick={() => {
                                    if (this.state.installed) return;
                                    DownloadPlugin(GithubLink, powercord);
                                    this.setState({installed: true});
                                }}>Install</Button>
                            }
                        </div>
                    </div>

                </div>
            )
        }
    }
}