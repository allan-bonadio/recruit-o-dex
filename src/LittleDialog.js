/*
** LittleDialog -- a dialog for things like alerts and quick messages
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import 'bootstrap/dist/css/bootstrap.min.css';
import React, {Component} from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {connect} from 'react-redux';



export class LittleDialog extends Component {
	constructor(props) {
		super(props);
		
		// gee can i have a non-redux component in a redux app?
		////this.state = {modal: false};
		
		LittleDialog.me = this;
		this.clickOk = this.clickOk.bind(this);
		this.clickCancel = this.clickCancel.bind(this);
console.info('constructed LittleDialog');
	}

	render() {
console.info('rendering LittleDialog');
		return (
			<div className='little-dialog' >
				<Modal isOpen={this.props.modal} >
					<ModalHeader /* toggle={this.toggle} */ >{this.props.title}</ModalHeader>
					<ModalBody>
						{this.props.message}
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={this.clickCancel}
							style={{display: this.props.showCancel ? 'block' : 'none'}} >Cancel</Button>
						<Button color="primary" onClick={this.clickOk}>OK</Button>{' '}
					</ModalFooter>
				</Modal>
			</div>
		);
	}
	
	clickOk(ev) {
		this.props.dispatch({type: 'CLOSE_LITTLE_DIALOG'});
		if (this.props.callback)
			this.props.callback('ok', this.props.message);
		////this.setState({modal: false});
	}
	
	clickCancel(ev) {
		this.props.dispatch({type: 'CLOSE_LITTLE_DIALOG'});
		if (this.props.callback)
			this.props.callback('cancel', this.props.message);
		////this.setState({modal: false});
	}

	// reducer handler - actually set the state to be open with this message and stuff
	static openLittleDialog(state, action) {
		state = {
			...state,
			littleDialog: {
				modal: true,
				title: action.title,
				message: action.message,
				callback: action.callback,
			},
			
		};
		return state;
	}
	
	// reducer handler - get rid of dialog
	static closeLittleDialog(state, action) {
		state = {
			...state,
			littleDialog: {
				modal: false,
			},
			
		};
		return state;
	}
	
	/******************************************************************* end-user functions */
	
	// call this to make a popup alert = dialog with simple message.
	// Actual dialog comes up just after, in the next event loop
	static alert(title, message, callback) {
////		debugger;
		// cannot dispatch from inside a reducer, so do it later
		setTimeout(() => {
			LittleDialog.me.props.dispatch({
				type: 'OPEN_LITTLE_DIALOG', 
				title,
				message,
				callback,
			});
		}, 0);
	}
	
}

function mapStateToProps(state) {
	console.info("MS2P little dialog");
	return state ? state.littleDialog : {};
}

export default connect(mapStateToProps)(LittleDialog);

// for manual testing
// eslint-disable-next-line
function testMe() {
	setTimeout(() => {
////		debugger;
		LittleDialog.alert('test alert', 'Elvis has left the building');
	}, 5000);
}
//testMe();


