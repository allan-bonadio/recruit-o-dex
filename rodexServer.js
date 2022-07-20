#!/usr/bin/env node
/*
** recruit o dex server -- the MongoDB interface and server for the Recruit-o-dex page
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

const fsp = require('fs/promises');
const express = require('express');
const cors = require('cors');
const mongodb = require('mongodb');


getErrMsg = (err) => err.stack || err.message || err;

/**************************************************** mongo interface */

const mongoServerPortNum = 27017;  // the default for mongo
const mongoUrl = `mongodb://localhost:${mongoServerPortNum}/Jobs`;

const ObjectID = mongodb.ObjectID;  // function we'll need to make record IDs

const MongoClient = mongodb.MongoClient;






/**
 * Print the names of all available databases
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listDatabases1(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function main1() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
//     const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/sample_airbnb?retryWrites=true&w=majority";

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(mongoUrl, {useUnifiedTopology: true})
     */
    const client = new MongoClient(mongoUrl);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await listDatabases1(client);

    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

//main1().catch(console.error);


//process.exit(0);




//
// let client;
// //let Jobs;  // the Jobs database, aka 'db'
// // let recruiters;  // the collection
//
// // call this to start a query.
// // returns the recruiters collection object
// function startQuery() {
// 	client = new mongodb.MongoClient(mongoUrl);
// 	const db = client.db('Jobs');
// 	const collProm = db.collection('recruiters');
// 	return collProm;
// }
//
// // when you're done... do we really need to do this?   doc is unclear. IN fact,
// // the doc kindof sucks.  Nowhere does it say if you can reuse a client obj, db
// // object or col object.  What if you never close, is that OK?  Looks like the
// // docs were written by a robot.
// function finishQuery() {
// 	// returns a promise but we don't care
// 	return client.close();
// }
//
// // take care of Mongo details, I just want to write the code for col.find() or similar
// function AskMongo(collectionName, inquirer) {
// // 	console.info(`--- 🐕  AskMongo()${collectionName}) ${__filename} inquirer:`, inquirer);
// //
// // 	mongodb.MongoClient.connect(mongoUrl, function(err, db) {
// // 		if (err) {
// // 			console.error(err);
// // 			process.exit(9);
// // 		}
// //
// // 		// inquirer must call this function when it's done with all its callbacks
// // 		function doneFunc() {
// // 			db.close();
// // 		}
// //
// // 		var col = db.collection(collectionName || 'recruiters');
// // 		console.info(`--- 🐕  AskMongo() got collection`, col);
// // 		inquirer(col, doneFunc);
// //
// // 		// must close ... later.  After all the callbacks in inquirer().  try this for now...
// // 		setTimeout(() => db.close(), 1000);
// // 		//setTimeout(() => db.close(), 300);
// // 	});
// }
//

// general interface to Mongo.  Callbacks:
// queryCallback(recruiters) - pass it collection object, must return a promise
// finshCallback(reply) - pass it some sort of reply object...??, returns nothing
// errorCallback(err) -
function AskMongo(queryCallback, finshCallback, errorCallback) {
    const client = new MongoClient(mongoUrl);
	//console.log(`client:`, client);

	let connProm =  client.connect();
	//console.log(`connProm:`, connProm);
	connProm
	.then(conn => {
		//console.log(`conn:`, conn);

		let db = client.db();
		//console.log(`db:`, db);

		let recruiters = db.collection('recruiters');
		//console.log("recruiters:", recruiters);

		// it returns a prom to wait for
		return queryCallback(recruiters);
	})
	.then(resp => {
		//console.log("AskMongo resp:", resp);
		finshCallback(resp);
	})
	.catch(err => errorCallback(err));
}

function getAllRecords4(recordsCallback, errorCallback) {
	AskMongo(recruiters => {
		// query callback
		let findings = recruiters.find();
		//console.log("findings:", findings);

		let listProm = findings.toArray();
		//console.log("listProm:", listProm);
		return listProm;
	},
	list => {
		// finish callback
		//console.log("getAllRecords4 list:", list);
		recordsCallback(list)
	},
	err => {
		console.error(`error in getAllRecords:`, getErrMsg(err));
		errorCallback(err);
	});
}

// yes it took a lot of tries


// function getAllRecords3(callback) {
//     const client = new MongoClient(mongoUrl);
// 	console.log(`client:`, client);
//
// 	let connProm =  client.connect();
// 	console.log(`connProm:`, connProm);
// 	connProm
// 	.then(conn => {
// 		console.log(`conn:`, conn);
//
// 		let db = client.db();
// 		console.log(`db:`, db);
//
// 		let recruiters = db.collection('recruiters');
// 		console.log("recruiters:", recruiters);
//
// 		let findings = recruiters.find();
// 		console.log("findings:", findings);
//
// 		let listProm = findings.toArray();
// 		console.log("listProm:", listProm);
// 		return listProm;
// 	})
// 	.then(list => {
// 		console.log("list:", list);
// 		callback(null, list);
// 	})
// 	.catch(err => callback(err, null));
// }
//


// save this record data under the id given.
function saveOneRecord(record, id, finishCallback, errorCallback) {
	var debug = false;
	if (debug) {
		console.log("saveOneRecord: pretending to save this record %j", record);
		setTimeout(function() {
			callback({});
		}, 300);
		return;
	}

	console.log("\n\nsaveOneRecord: actually saving this record", record);


	AskMongo(recruiters => {
		// query callback
		let query =  {_id: new ObjectID(id)};
		return recruiters.updateOne(query, {$set: record});
	},
	res => {
		// finish callback
		console.log(`saveOneRecord: ${res.matchedCount} docs matched, updated ${res.modifiedCount} docs`);
		finishCallback();  // if you care about when it finishes
	},
	err => {
		console.error(`error in saveOneRecord:`, getErrMsg(err));
		errorCallback(err);
	});

// 	// always to the current db!  even if it originated on some other.
// 	AskMongo('recruiters', (col, doneFunc) => {
// 		// it took me half a day to write the following line of code cuz it's nowhere in the docs
// 		var query =  {_id: new ObjectID(id)};
// 		// as in db.getCollection('recruiters').find({"_id" : ObjectId("5a0e0e81a45ced6059aa145d")})
//
// 		////console.log("|| Gonna search for same id="+ record._id +".");
// 		col.find(
// 			query
// 		).toArray(function(err, docs) {
// 			if (err) {
// 				console.error(err);
// 				callback({error: err.name +': '+ err.message});  // polite back to the user
// 				doneFunc();
// 				return;
// 			}
// 		});
//
//
// 		col.updateOne(
// 			query,
// 			{$set: record}, // what to change it to
// 			function(err, result) {  // when done
// 				if (err) {
// 					console.error(err);
// 					callback({error: err.name +': '+ err.message});  // polite back to the user
// 				}
// 				else {
// 					callback(result);
// 				}
// 			}
// 		);
//
// 	});
}

function addOneRecord(record, finishCallback, errorCallback) {
	console.log("\n\n|| addOneRecord: actually saving this record %j", record);

	AskMongo(recruiters  => {
		// query callback
		console.log("|| Gonna addOne on company_name="+ record.company_name +".");
		return recruiters.insertOne(record)
	},
	res => {
		// final callback
		console.log(`addOneRecord: added? ${res.acknowledged}`, res);
		finishCallback(res);
	},
	err => {
		// error callback
		console.error(`error in addOneRecord:`, getErrMsg(err));
		errorCallback(err);
	});
}

/************************************************************** Already Applied To */

// generate a list of companies in the db. ANd store it in the alreadyappliedto.txt file.
function generateAAT() {
	if (! process.env.RODEX_AAT_TARGET) {
		console.warn("process.env.RODEX_AAT_TARGET undefined so no AAT file generated");
		return;
	}

	console.log("============");
	console.log("generateAAT()");
	console.log("============");
	AskMongo(recruiters  => {
			// query callback
			// find, in the recruiters collection, all records, but just take the company names, sort, and then...
			return recruiters
				.find({}, {company_name: 1})  // just the company name
				.collation({locale: "en"})      //  case-insensitive
				.sort({company_name:1})  // sort on the only field
				.toArray();
		},
		list => {
			var content = list
						.map(doc => doc.company_name)
						.filter(cname => cname)
						.join('\n');

			// and get it out there before something else fails
			return fsp.fsPromises.writeFile(process.env.RODEX_AAT_TARGET, content, 'utf8');
			// promise... don't care
			// not needed fsp.chmod(process.env.RODEX_AAT_TARGET, 0o666);
		},
		err => {
			console.error('=================================== Error in generateAAT() =====');
			console.error(getErrMsg(err));
			console.error('================================================================');
		}
	);
}


// run when starting up and every few hours after that
generateAAT();
setInterval(generateAAT, 3 * 3600e3);


/**************************************************** http interface */

const rodexServerPortNum = 5555;


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
		//console.log(">> isBodyBad ... OK!  it's not.");
		return false;  // ok
	}

	const corsOpts = {
		origin: 'http://localhost:3300/',
		methods: 'GET,PUT,POST',
	};

	// Cross Origin Request System
	app.use(cors());

	app.options('*', cors());

	app.get('/getall',
		//cors(corsOpts),  // optional - no, breaks it
		function (req, res) {
			// console.info(`---------------------  apt.get req:`, req);
			// console.info(`---------------------  apt.get req.body:`, req.body);
			getAllRecords4(records => {
				res.status(200).json(records);  // send back an array
			},
			err => {
				res.status(500).send({error: err});
			});
		}
	);

	// put.  update.
	app.put('/one/:id', function (req, res) {
		// console.log("|| app.put /one: req started");    // too much text     , req);
		// console.log("|| %s %s %s", req.method, req.hostname, req.path);
		// console.log("    req.params: %j", req.params);
		// console.log("    req.body: %j", req.body);
		//console.log("    req.headers: %j", req.headers);
		//console.log("|| the whole req: ", req, '------');

		if (isBodyBad(req, res))
			return;

		delete req.body._id;
		saveOneRecord(req.body, req.params.id, function finish(results) {
			console.log("    saveOneRecord() gave me results", results);
			res.sendStatus(204);
		},
		function error(err) {
			res.sendStatus(500).send({error: err});
		});
	});

	// add.  insert.  post.
	app.post('/one', function (req, res) {
		// console.log("|| app.post /one: req started");    // too much text     , req);
		// console.log("|| %s %s %s", req.method, req.hostname, req.path);
		// console.log("    req.params: %j", req.params);
		// console.log("    req.body: %j", req.body);
		//console.log("    req.headers: %j", req.headers);

		if (isBodyBad(req, res))
			return;

		addOneRecord(req.body, function finish(results) {
			console.log("    addOneRecord() gave me results", results);
			res.sendStatus(201);
		},
		function error(err) {
			res.sendStatus(500).send({error: err});
		});
	});

	// actually start the server
	app.listen(rodexServerPortNum, function() {
		console.log(`rodexServer now accepting connections on `+
			`http://localhost:${rodexServerPortNum}\n\n\n`);
	});
}


setupServer();




