#!/bin/bash

# backs up your recruiter data.  The way I like it.  Use this for a cron job.
# maybe like this: 47 11,18 * * 1-5 /dvl/recruit-o-dex/backups/backup.sh
# '--onceTodayOnly' will make it quit if there's already an archive today.

cd `dirname $0`

# canceled always
# if [ "$1" == '--onceTodayOnly' ]
# then
# 	today=`date +%Y-%m-%d`
# 	hits=./archives/jobs$today*
# 	if [ -n "$hits" ]
# 	then
# 		echo "Already did it today, quitting."
# 		exit 0
# 	fi
# fi


echo "now backing up..."

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

# now delete an old one.  Randomly chosen, but keep around the most recent 2.
lineNum=$(( $RANDOM * 8 / 32768 + 2 ))
fileName=` ls -1t archives | tail -n +$lineNum | head -1 `
/bin/rm -rfv archives/$fileName

# tell Allan
open -a "Google Chrome" backedUp.html


