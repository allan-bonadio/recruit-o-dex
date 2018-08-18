// a dialog for things like alerts and quick messages
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {Component} from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';



class LittleDialog extends Component {
	constructor(props) {
		super(props);
		
		// gee can i have a non-redux component in a redux app?
		this.state = {modal: false};
		
		// try this instead of a global
		LittleDialog.the = this;

		this.clickOk = this.clickOk.bind(this);
		this.clickCancel = this.clickCancel.bind(this);
	}

	clickOk(ev) {
		if (this.state.callback)
			this.state.callback('ok', this.state.message);
		this.setState({modal: false});
	}
	
	clickCancel(ev) {
		if (this.state.callback)
			this.state.callback('cancel', this.state.message);
		this.setState({modal: false});
	}

	render() {
		return (
			<div className='little-dialog' >
				<Modal isOpen={this.state.modal} className={this.props.className}>
					<ModalHeader toggle={this.toggle}>{this.state.title}</ModalHeader>
					<ModalBody>
						{this.state.message}
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={this.clickCancel}
							style={{display: this.state.showCancel ? 'block' : 'none'}} >Cancel</Button>
						<Button color="primary" onClick={this.clickOk}>OK</Button>{' '}
					</ModalFooter>
				</Modal>
			</div>
		);
	}
	
	
	static alert(title, message, options) {
		
		LittleDialog.the.setState({...options, modal: true, title, message});
	}
	
}

export default LittleDialog;
