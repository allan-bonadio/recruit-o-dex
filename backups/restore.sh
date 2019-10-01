#!/bin/bash
# restore one of the backups in the archive dir

cd `dirname $0`

echo "Restoring a Mongo backup from the archive directory.  Available backups:"
echo
ls archives || exit 1
echo

echo "Copy and paste one of those names here, then hit return:"
read bName

mongorestore \
	--db=jobs --collection=recruiters archives/$bName/recruiters.bson


echo "how'd that go?"

