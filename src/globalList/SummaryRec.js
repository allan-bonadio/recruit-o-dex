/*
** SummaryRec -- per-rec summary box, displayed in yellow, seen in global list
*/
/* eslint-disable eqeqeq, default-case */

import React, {Component} from 'react';
import {rxStore} from '../reducer';

import GlobalList from './GlobalList';

// each recruiter/job cell, shown in the Global List, the front page.
// This is NOT a redux component because I need multiple ones of them.
export class SummaryRec extends Component {
	constructor(props) {
		super(props);
		this.mouseDownEv = this.mouseDownEv.bind(this);
		this.mouseMoveEv = this.mouseMoveEv.bind(this);
		this.mouseUpEv = this.mouseUpEv.bind(this);
console.info('constructed SummaryRec');
	}

	render() {
console.info('rendering SummaryRec');

		// for each field, make a <div with the current value in it
		let Field = (props) => {
console.info('executing Field');

			return <div className={'summary-field '+ props.name}>
						{props.record ? props.record[props.name] : ''}
					</div>;
		}

		let r = this.props.record;

		let itsAge = Date.now() - (new Date(r.updated || r.created)).getTime();
		itsAge = itsAge / 86400000;  // to days
		let ageClass = itsAge > 90 ? 'quarterOld'
			: itsAge > 30 ? 'monthOld'
				: itsAge > 7 ? 'weekOld'
					: itsAge > 1 ? 'dayOld'
						: itsAge > .08 ? 'hoursOld' : 'minutesOld';
		return <section
				className={'summary '+
					(this.props.selectedSerial == this.props.serial
						? 'selected '
						: '') +
					ageClass}
				onMouseDown={this.mouseDownEv} onMouseMove={this.mouseMoveEv}
				onMouseUp={this.mouseUpEv} onMouseLeave={this.mouseUpEv}
				serial={this.props.serial} key={this.props.serial} >
			<Field record={r} name='company_name' />
			<Field record={r} name='recruiter_name' />
			<br clear="left" />

			<Field record={r} name='recruiter_email' />
			<Field record={r} name='recruiter_phone' />
			<Field record={r} name='agency' />

			<Field record={r} name='status' />
			<Field record={r} name='notes' />
		</section>;
	}

	/* ******************************************************** clicking */
	// distinguish between a click and a drag.  If there's any moving, it's a drag.
	// Then, ignore the drags; probably user selecting text.

	// remember where
	mouseDownEv(ev) {
		this.down = {x: ev.clientX, y: ev.clientY};
	}

	// see if it moved
	mouseMoveEv(ev) {
		GlobalList.mouseMoved();

		if (!this.down)
			return;
		if (Math.abs(this.down.x - ev.clientX) + Math.abs(this.down.y - ev.clientY) > 5)
			this.down = null;
	}

	// start edit only if no movement
	mouseUpEv(ev) {
		if (!this.down)
			return;

		// yes this was a click
		this.down = null;
		rxStore.dispatch({
			type: 'START_EDIT_RECORD',
			serial: this.props.serial,
			record: this.props.record,
		});
	}
}

export default SummaryRec;

