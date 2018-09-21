#!/usr/bin/env node
/*
** recruit o dex server -- the MongoDB interface and server for the Recruit-o-dex page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

let fs = require('fs');

/**************************************************** starting up */
let express = require('express');

// the mongo interface
let portNum = 5555;
let mongoUrl = "mongodb://localhost/jobs";

var ObjectID = require('mongodb').ObjectID;  // function we'll need to make record IDs
var MongoClient = require('mongodb').MongoClient;  // the channel


// run when starting up and every few hours after that
generateAAT();
setInterval(generateAAT, 3 * 3600e3);

setupServer();

// the end.

/**************************************************** http interface */

function setupServer() {
	let app = express();

	// this parses our json.  and it knows where to get the raw text.  recommended plugin.
	var bodyParser = require('body-parser');
	app.use(bodyParser.json());

	// pass it a body on a PUT or POST request.  returns true if it failed.
	function isBodyBad(req, res) {
		if (! req.body) {
			res.status(415).send("no body sent");
			console.error(">> isBodyBad no body sent");
			return true;
		}
		var noFields = true;
		for (var k in req.body)
			noFields = false;
		if (noFields) {
			res.status(422).send("no data in body");
			console.error(">> isBodyBad no data in body");
			return true;
		}
		console.log(">> isBodyBad ... OK!  it's not.");
		return false;  // ok
	}

	// Cross Origin Request System
	let cors = require('cors');
	app.use(cors());
	
	app.options('*', cors())

	app.get('/getall', function (req, res) {
		getAllRecords(function(records) {
			res.json(records);  // an array
		});
	})

	// put.  update.  
	app.put('/one/:id', function (req, res) {
		console.log("|| app.put /one: req started");    // too much text     , req);
		console.log("|| %s %s %s", req.method, req.hostname, req.path);
		console.log("    req.params: %j", req.params);
		console.log("    req.body: %j", req.body);
		//console.log("    req.headers: %j", req.headers);
		//console.log("|| the whole req: ", req, '------');
	
		if (isBodyBad(req, res))
			return;
	
		delete req.body._id;
		saveOneRecord(req.body, req.params.id, function(results) {
			console.log("    saveOneRecord() gave me results %j", results);
			res.sendStatus(204);
		});
	})

	// add.  insert.  post.  
	app.post('/one', function (req, res) {
		console.log("|| app.post /one: req started");    // too much text     , req);
		console.log("|| %s %s %s", req.method, req.hostname, req.path);
		console.log("    req.params: %j", req.params);
		console.log("    req.body: %j", req.body);
		//console.log("    req.headers: %j", req.headers);
	
		if (isBodyBad(req, res))
			return;
	
		addOneRecord(req.body, function(overall, results) {
			console.log("    addOneRecord() gave me results ‹%s› %j", overall, results);
			res.sendStatus(201);
		});
	})



	// actually start the server
	app.listen(portNum, function() {
		console.info("Server now accepting connections on http://localhost:"+ portNum +
			'\n\n\n');
	});
}




/**************************************************** mongo interface */

// take care of Mongo details, I just want to write the code for col.find() or similar
// to do: convert the other functions to use this
function AskMongo(inquirer) {
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) {
			console.error(err);
			process.exit(9);
		}
	
		var col = db.collection('recruiters');
		inquirer(col);
		db.close();
	});
}

function getAllRecords(callback) {
	AskMongo(
		col.find({}).sort({company_name:1}).toArray(function(err, docs) {
			if (err) {
				console.error(err);
				process.exit(3);
			}
	
			callback(docs);
		});
	
	});
}


function saveOneRecord(record, id, callback) {
	var debug = false;
	if (debug) {
		console.log("saveOneRecord: pretending to save this record %j", record);
		setTimeout(function() {
			callback({});
		}, 300);
		return;
	}
	
	console.log("\n\nsaveOneRecord: actually saving this record %j", record);
	
	AskMongo(col => {
		// it took me half a day to write the following line of code cuz it's nowhere in the docs
		//var query = {recruiter_name: record.recruiter_name};
		//var query =  {_id: id};  // selects which one
		//var query =  {_id: ObjectId(id)};
		//var query =  {'_id.str': id};
		var query =  {_id: new ObjectID(id)};
		// as in db.getCollection('recruiters').find({"_id" : ObjectId("5a0e0e81a45ced6059aa145d")})
	
		console.log("|| Gonna search for same id="+ record._id +".");
		col.find(
			query
		).toArray(function(err, docs) {
			if (err) {
				console.error(err);
				process.exit(3);
			}
	
			console.log("|| *************kill me before I log again**********saveOneRecord: RETRIEVED %d records, first record %j", docs.length, docs);
		});


		console.log("|| Gonna updateOne on company_name="+ record.company_name +".");
		col.updateOne(
			query,
			{$set: record}, // what to change it to
			function(err, result) {  // when done
				if (err) {
					console.error(err);
					process.exit(5);
				}
	
				callback(result);
			}
		);

	});
}

function addOneRecord(record, callback) {
	console.log("\n\n|| addOneRecord: actually saving this record %j", record);
	
	AskMongo(col => {

		console.log("|| Gonna addOne on company_name="+ record.company_name +".");
		col.insertOne(
			record,
			function(err, result) {  // when done
				if (err) {
					console.error(err);
					process.exit(5);
				}
	
				callback('success', result);
			});
	});
}

/************************************************************** Already Applied To */

// generate a list of companies in the db. ANd store it in the alreadyappliedto.txt file.
function generateAAT() {
	if (! process.env.ROX_AAT_TARGET) {
		console.warn("process.env.ROX_AAT_TARGET undefined so no AAT file generated");
		return;
	}
	
	console.log("============");
	console.log("generateAAT()");
	console.log("============");
	AskMongo(function(col) {
		
		// find, in the recruiters collection, all records, but just take the company names, sort, and then...
		col
				.find({}, {company_name: 1})  // just the company name
				.collation({locale: "en"})      //  case-insensitive
				.sort({company_name:1})  // sort on the only field
				.toArray(function(err, docs) {
			if (err) {
				console.error(err);
				process.exit(33);
			}
	
			var content = docs
						.map(doc => doc.company_name)
						.filter(cname => cname)
						.join('\n');
			
			// and get it out there before something else fails
			fs.writeFileSync(process.env.ROX_AAT_TARGET, content);
			fs.chmodSync(process.env.ROX_AAT_TARGET, 0o666);
		});
	});
}

