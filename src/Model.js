/*
** Model -- ajax calls for RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import $ from "jquery";

// same place we get the website from, just a different port
const RODEX_SERVER = window.location.protocol +'//'+ window.location.hostname +':5555';

// ultimately this will have all the data in it
export let allRecruiters = [];

export let simulateErrors = {};

// simulateErrors.getError = new Error("Error loading from database: "+ 'FUBAR' +': '+ 'Fed up beyond all recognition');////
// simulateErrors.postError = new Error("Error stickin it into the database: "+ 'FUBAR' +': '+ 'Fed up beyond all recognition');////;////

// converts what jquery hands back for an error.
// Checks for suspicious pattern and if so, set message to something appropriate
function createErrorObj(what, status, message, jqxhr) {
// 	if (status == 'error' && message === '')
// 		return new Error('Security Error: not allowed to access data (CORS)');
	if ("rejected" == jqxhr.state())
		message = "Request was rejected; is the rodex server up?";
	else
		message = message || jqxhr.state();
	return new Error("Error "+ what +": "+ status +': '+ message);
}


// download the whole thing.  
// Call the callback either like (null, allData) or (errorObj, null) depending on success
export function moGetAll(callback) {
	if (simulateErrors.getError) {
		setTimeout(() => callback(simulateErrors.getError, null), 100);////
		return;////
	}

	fetch(RODEX_SERVER +'/getall', {})
	.then(resp => resp.json(),
		err => {
			err.message = "loading from database: "+ err.message;
			console.error(err);
			callback(err, null);
		})
	.then(
		list => {
			allRecruiters =list;
			callback(null, allRecruiters);
		}, 
		err => {
			err.message = "reading json from from database: "+ err.message;
			// special case: cors errors - they give us no clue as to what went wrong in js
			console.error("Error loading from database: ", err);
			callback(err, null);
		}
	);
}

// get a record given its position in the array
export function getBySerial(serial) {
	return allRecruiters[serial];
}

// put one to update an existing record. 
export function moPutOne(record, callback) {
	if (simulateErrors.putError) {
		setTimeout(() => callback(simulateErrors.putError, 100));////
		return;
	}
	
	let opts = {
		method: 'PUT',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(record),
    };

	fetch(RODEX_SERVER +'/one/'+ record._id, opts)
	.then(
		resp => {
			if (! resp.ok || 204 != resp.status)  // eslint-disable-line
				callback(new Error("Error updating: "+ resp.status +': '+ resp.statusText));
			else
				callback(null);  // success
		}, 
		err => {
			err.message = "updating database: "+ err.message;
			// special case: cors errors - they give us no clue as to what went wrong in js
			console.error("Error updating database: ", err);
			callback(err);
		}
	);


////
////	$.ajax({
////		url: RODEX_SERVER +'/one/'+ record._id, 
////		method: 'put',
////		contentType: 'application/json',  
////		data: JSON.stringify(record),
////		success: function(data, status, jqxhr) {
////			callback(null, jqxhr.status);
////		},
////		error: function(jqxhr, status, message) {
////			console.error("Error updating database: %s %s %s", jqxhr.status, status, message);
////
////			////{status, message} = createErrorObj(status, message);
////			////var er = new Error("Error updating database: "+ status +': '+ message);
////			var er = createErrorObj("updating database", status, message, jqxhr);
////			callback(er, jqxhr.status ||  jqxhr.state());
////		},
////	});
}

// a new one: add it in to the collection
export function moPostOne(record, callback) {
	if (simulateErrors.postError) {
		setTimeout(() => callback(simulateErrors.postError, 100));////
		return;
	}

	let opts = {
		method: 'POST',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(record),
    };

	fetch(RODEX_SERVER +'/one', opts)
	.then(
		resp => {
			if (! resp.ok || 201 != resp.status)  // eslint-disable-line
				callback(new Error("Error updating: "+ resp.status +': '+ resp.statusText));
			else
				callback(null);  // success
		}, 
		err => {
			err.message = "inserting into database: "+ err.message;
			// special case: cors errors - they give us no clue as to what went wrong in js
			console.error("inserting into database: ", err);
			callback(err);
		}
	);


////	$.ajax({
////		url: RODEX_SERVER +'/one', 
////		method: 'post',
////		contentType: 'application/json',  
////		data: JSON.stringify(record),
////		success: function(data, status, jqxhr) {
////			callback(null, jqxhr.status);
////		},
////		error: function(jqxhr, status, message) {
////			console.error("Error inserting into database: %s %s %s", jqxhr.status, status, message);
////// 			var er = new Error("Error inserting into database: "+ status +': '+ message);
////// 			{status, message} = createErrorObj(status, message);
////			var er = createErrorObj("inserting into database", status, message, jqxhr);
////
////			callback(er, jqxhr.status ||  jqxhr.state());
////		},
////	});
}
	

// delete an existing record
export function moDeleteOne(record, callback) {
	throw "nevert implemented";////
	
	$.ajax({
		url: RODEX_SERVER +'/one/'+ record._id, 
		method: 'delete',
		contentType: 'application/json',  
		success: function(data, status, jqxhr) {
			callback(null, jqxhr.status);
		},
		error: function(jqxhr, status, message) {
			console.error("Error deleting doc: %s %s %s", jqxhr.status, status, message);

			////{status, message} = createErrorObj(status, message);
			////var er = new Error("Error updating database: "+ status +': '+ message);
			var er = createErrorObj("deleting a document", status, message, jqxhr);
			callback(er, jqxhr.status ||  jqxhr.state());
		},
	});
}




