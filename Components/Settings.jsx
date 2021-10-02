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
                    note='This feature will completely change #plugin-links and is still being worked on.'
                    value={this.props.getSetting('beta', false)}
                    onChange={() => this.props.toggleSetting('beta')}
                >
                    Plugin Cards
                    <div className='PPD-Beta' >BETA</div>
                </SwitchItem>
            </div>
        )
    }
};