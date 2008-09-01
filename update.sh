#! /bin/sh

rsync -vaP --exclude .svn --delete --delete-excluded ../tiddlywiki-svn/Trunk/core .
