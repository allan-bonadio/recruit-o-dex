#!/bin/bash
# backs up your recruiter data.  The way I like it.  Use this for a cron job.
# maybe like this: 47 11,18 * * 1-5 /dvl/recruit-o-dex/backups/backup.sh
cd `dirname $0`

# default creates dump/jobs/twofiles
#/dvl/mongodb/mongodb-osx-ssl/bin/
/usr/local/bin/mongodump \
	--db=jobs --collection=recruiters

# i also want a text json copy.  This isn't really json, it's json for each 
# document, separated by newlines.  
# Must convert it if you want to make it really json: \n => , wrap with [ ]
# but I think mongoimport will read this.
#/dvl/mongodb/mongodb-osx-ssl/bin/
/usr/local/bin/mongoexport \
	--db=jobs --collection=recruiters --out=dump/jobs/recruiters.json

# make sure this works!
mkdir -pv ./dump ./archives

# so label and store them
d=`date +%Y-%m-%d,%H.%M`
mv ./dump/jobs ./archives/jobs$d

# now delete an old one.  Randomly chosen.
# lineNum=$(( $RANDOM * 20 / 32768 + 10 ))
# fileName=` ls -1t archives | tail -n +$lineNum | head -1 `
# /bin/rm -rf archives/$fileName

# tell Allan
open -a "Google Chrome" backedUp.html


