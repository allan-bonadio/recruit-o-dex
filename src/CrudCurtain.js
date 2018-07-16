import React, { Component } from 'react';
import {connect} from 'react-redux';

import {rxStore, getStateSelection} from './Reducer';
import LoadSave from './LoadSave';

export let theCrudCurtain = null;

// the white translucent sheet behind the control panel; signifies you're changing a record
export class CrudCurtain extends Component {
	constructor(props) {
		super(props);
		////this.state = {display: 'none'};
		theCrudCurtain = this;
		this.curtainClick = this.curtainClick.bind(this);
	}
	
	// clicking on the CrudCurtain does a Save
	curtainClick(ev) {
		this.props.dispatch({
			type: (this.props.selectedSerial >= 0) ? 'SAVE_EDIT_REQ' : 'SAVE_ADD_REQ',
		});
	}
	
	render() {
		let sel = getStateSelection();
		if (!sel) return [];

		return <div className='crud-curtain' 
			onClick={this.curtainClick}
			style={{display: sel.selectedRecord ? 'block' : 'none'}}>
		</div>;
	}
}

function mapStateToProps(state) {
	return state ? state.selection : {};  // i don't think i really use these props
}

export default connect(mapStateToProps)(CrudCurtain);

