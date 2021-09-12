const { React } = require('powercord/webpack');
const { Clickable, Tooltip, Button, Icons: { Person, Receipt, Tag } } = require('powercord/components');
const { open: openModal } = require('powercord/modal');
const { Modal } = require('powercord/components/modal');

module.exports = class Card extends React.Component {
	render() {
		const {message} = this.props;
        console.log(message);
        return <Modal className='pluginpreview'>
            <Modal.Header>
                <h2>Preview</h2>
            </Modal.Header>
            <Modal.Content className='scrollbarGhostHairline-1mSOM1'>
                {message.embeds.map(embed => <img src={embed.image.url} />)}
                {message.attachments.map(attachment => <img src={attachment.url} />)}
            </Modal.Content>
        </Modal>
	}
};
