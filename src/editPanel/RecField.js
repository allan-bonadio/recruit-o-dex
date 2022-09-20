/*
** RecField -- a text blank on any form
**
** Copyright (C) 2022-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React from 'react';
import PropTypes from 'prop-types';
import {rxStore} from '../reducer';

// a function-based component: just renders a text field and its label
function RecField(props) {
	//console.info('executing RecField');
	let fieldName = props.fieldName;
	let dval = props.rec[fieldName] || '';
	let placeholder = props.placeholder;
	//console.log(":: field %s depicted with value %s", fieldName, dval);

	const passThru = () => {};

	// form the <input or <textarea.
	// Keystroke handler in RecForm, not here.  But, react gets snappy if no handler here.
	let entryElement;
	if (props.element != 'textarea')  // eslint-disable-line
		entryElement = <input value={dval} name={fieldName} placeholder={placeholder}
			onChange={passThru}/>;
	else
		entryElement = <textarea value={dval} name={fieldName} placeholder={placeholder}
			onChange={passThru}/>;

	return <div key={fieldName}>
		<label className="edit-label">{props.label}</label>
		<div className={'edit-blank '+ fieldName}>
			{entryElement}
		</div>
		<br clear='left' />
	</div>;
}

RecField.propTypes = {
	element: PropTypes.string,
	fieldName: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	rec: PropTypes.object.isRequired,
};

RecField.defaultValues = {
	placeholder: '',
	element: 'input',
};


// blur handler - for all the text boxes in the form.  trim off leading and trailing whitespace.
RecField.deFocusBlank =
(ev) => {
	var targ = ev.target;
	rxStore.dispatch({type: 'CHANGE_TO_RECORD',
		fieldName: targ.name, newValue: targ.value.trim()});
}


// take apart an email with name of the form ` "My Name" <myname@wherever.what>`
// If such a string is pasted into recruiter name or email, parse and fill in both
// optional quote, grouped name chars, optional quote, <, grouped email, >
function gobbleNameEmail(tValue) {
	// matches 'Joe M. de Blow <joe-blow@wher.e-ver.what>' or
	// ' "Joe M. de Blow" <joe-blow@wher.e-ver.what>'
	let m = /"?([-\w ,.()]+)"? <([-\w+@.]+)>/i.exec(tValue);
	if (m) {
		let name = m[1];
		if (name.indexOf(',')) {
			name = name.replace(/^([-\w .()]+), ?([-\w .()]+)$/, '$2 $1');
		}
		let email = m[2];
		rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_name',
			newValue: name});
		rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_email',
			newValue: email});
		return true;
	}
	return false;
}

// see if user pasted in text with a phone number in it, if so, chop out everything
// else and register the change
function gobblePhone(tValue) {
	// area code ... first three ... last 4 ... optional extension
	let ma = /\b(\d\d\d)\D{0,2}(\d\d\d)\D?(\d\d\d\d)(\D+(\d*))?/i.exec(tValue);
	if (ma) {
		console.info(`you got ma match length ${ma.length}: ‹${ma[1]}•${ma[2]}•${ma[3]}›‹${ma[4]}›‹${ma[5]}›‹${ma[6]}›`);
		let newVal = `${ma[1]}.${ma[2]}.${ma[3]}`;
		if (ma[5])
			newVal += ` x ${ma[5]}`;  // optional extension, any numbers of digits
		rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_phone',
			newValue: newVal});
		return true;
	}
	else
		console.log(`no phone ext in  '${tValue}'`)
	return false;
}


// keystroke handler - for all the text boxes in the form.  Also gets paste, etc
RecField.typeInBlank =
(ev) => {
	var targ = ev.target;
	let tValue = targ.value;

	switch(targ.name) {
	case 'recruiter_name':
	case 'recruiter_email':
		if (gobbleNameEmail(tValue))
			return;
		break;

	case 'recruiter_phone':
		if (gobblePhone(tValue))
			return;
		break;
	}

	// normal change to some record
	rxStore.dispatch({type: 'CHANGE_TO_RECORD',
			fieldName: targ.name, newValue: targ.value});
}




export default RecField;
