const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');
module.exports = class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <div>
                <SwitchItem
                    note='Enable beta features'
                    value={this.props.getSetting('beta', false)}
                    onChange={() => this.props.toggleSetting('beta')}
                >
                    Beta Features
                </SwitchItem>
            </div>
        )
    }
};