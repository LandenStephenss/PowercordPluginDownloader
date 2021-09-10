const { React } = require("powercord/webpack");
const { Clickable, Tooltip, Button, Icons: { Person, Receipt, Tag } } = require("powercord/components");
const DownloadPlugin = require("../../downloadPlugin");

module.exports = class Card extends React.Component {

    constructor(props) {
        console.log(props);
        super(props);
        this.props = props;
        this.message = props.message;

        let [GithubLink, , , repoName] = this.message.message.content.match(/https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/([\w-\._]+)\/?/) ?? [];
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
                    <Clickable className="PPD-CardTitle"><strong>{repoName}</strong></Clickable>

                    <div className="PPD-Details">
                        <div className="PPD-CardContent">
                            <div className="PPD-CardDescription">
                                <Tooltip position="top" text="Description">
                                    <Receipt height={24} width={24} />
                                </Tooltip>
                                <span>Test</span>
                            </div>

                            <div className="PPD-Metadata">
                                <div className="PPD-Author">
                                    <Tooltip position="top" text="Author">
                                        <Person width={24} height={24} />
                                    </Tooltip>
                                    <span>{this.message.author.nick}</span>
                                </div>
                                <div className="PPD-Version">
                                    <Tag width={24} height={24} />
                                    <span> v1</span>
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