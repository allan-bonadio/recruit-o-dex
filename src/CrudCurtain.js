import React, { Component } from 'react';
import {connect} from 'react-redux';

// the white translucent sheet behind the control panel; signifies you're changing a record
export class CrudCurtain extends Component {
	constructor(props) {
		super(props);
		CrudCurtain.me = this;
		this.curtainClick = this.curtainClick.bind(this);
	}
	
	// clicking on the CrudCurtain does a Save
	curtainClick(ev) {
		this.props.dispatch({
			type: (this.props.selectedSerial >= 0) ? 'SAVE_EDIT_REQ' : 'SAVE_ADD_REQ',
		});
	}
	
	render() {
		let sel = this.props;
		if (!sel) return [];

		return <div className='crud-curtain' 
			onClick={this.curtainClick}
			style={{display: sel.editingRecord ? 'block' : 'none'}}>
		</div>;
	}
}

function mapStateToProps(state) {
	return state ? state.controlPanel : {};
}

export default connect(mapStateToProps)(CrudCurtain);

