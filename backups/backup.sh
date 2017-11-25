#!/bin/bash

cd `dirname $0`

# default creates dump/jobs/twofiles
/dvl/mongo/mongodb-osx-x86_64-3.4.6/bin/mongodump --db jobs --collection recruiters

# so label and store them
d=`date +%Y.%m.%d-%H.%M`
mv ./dump/jobs ./archives/jobs$d


