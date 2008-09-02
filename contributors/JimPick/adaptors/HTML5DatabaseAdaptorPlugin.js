//{{{

// The following code came from WebKit HTML 5 SQL Storage Notes Demo

var db;

try {
	if (window.openDatabase) {
		// FIXME: Need to use unique names here so TiddlyWiki's loaded
		// from file: urls will have separate databases.
		db = openDatabase("TiddlyWiki", "1.0", "TiddlyWiki", 200000);
		if (!db)
			alert("Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
		} else
			alert("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
} catch(err) { }

// Borrows liberally from TiddlyWebAdaptorPlugin and FileAdaptor

function HTML5DatabaseAdaptor()
{
}


HTML5DatabaseAdaptor.prototype = new AdaptorBase();

HTML5DatabaseAdaptor.serverType = 'html5db'; // MUST BE LOWER CASE

HTML5DatabaseAdaptor.dbConnectOrCreate = function(callback)
{
	// FIXME: too much nesting
	db.transaction(function(tx) {
		tx.executeSql("SELECT COUNT(*) FROM Tiddlers",
			[],
			function(result) {
				callback();
			},
			function(tx, error) {
				tx.executeSql(
					"CREATE TABLE Tiddlers (title TEXT UNIQUE, text TEXT, revision INTEGER)", 
					[],
					function(result) {
						callback();
					}
				);
			}
		);
	});
}

HTML5DatabaseAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
        context.workspaces = [{title:"(default)"}];
        context.status = true;
        if(callback)
                window.setTimeout(function() {callback(context,userParams);},10);
        return true;
};

HTML5DatabaseAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	console.log("Jim1: getTiddlerList " + context)
	context = this.setContext(context,userParams,callback);

	context.tiddlers = [];

	HTML5DatabaseAdaptor.dbConnectOrCreate(function() {}); // FIXME: Remove callback

	db.transaction(function(tx) {
		tx.executeSql("SELECT rowid, title, text, revision FROM Tiddlers",
			[],
			function(tx, result) {
			// Process results
				for (var i = 0; i < result.rows.length; ++i) {
					var row = result.rows.item(i);
					// alert("Jim: " + row['title']);
					t = new Tiddler(row['title']);
					t.fields['server.type'] = HTML5DatabaseAdaptor.serverType;
					t.fields['server.workspace'] = "default";
					t.fields['server.page.revision'] = row['revision'];
					context.tiddlers.push(t);
				}
			}

		);
	});

	context.status = true;

        if(callback)
                window.setTimeout(function() {callback(context,userParams);},10);

	return true;
};

HTML5DatabaseAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision) {
		context.revision = revision;
	}
	return this.getTiddler(title,context,userParams,callback);
};

HTML5DatabaseAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

HTML5DatabaseAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	console.log("Jim getTiddler " + title + " " + context);
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = HTML5DatabaseAdaptor.getTiddlerComplete;
	return context.complete(context,context.userParams);
};

HTML5DatabaseAdaptor.getTiddlerComplete = function(context,userParams)
{
	if(context.title == "trivial1" || context.title == "trivial2") {
		t = new Tiddler(context.title);
		t.fields['server.type'] = HTML5DatabaseAdaptor.serverType;
		t.fields['server.workspace'] = "default";
		t.fields['server.page.revision'] = "2";
		t.fields['server.host'] = "none";
		t.text = "Fake text for " + context.title
		t.tags = [];
		t.modifier = "modifier";
		t.modified = Date.convertFromYYYYMMDDHHMM("200808191720");
		t.created = Date.convertFromYYYYMMDDHHMM("200808191720");
		context.tiddler = t
		context.status = true;
	} else {
		context.statusText = "unknown tiddler: " + context.title
		context.status = false;
	}
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};


HTML5DatabaseAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	console.log("Jim putTiddler " + tiddler.title);

	if(tiddler.fields['rowid']) {
		// FIXME: Update
	} else {
		db.transaction(
			function (tx) {
				tx.executeSql("INSERT INTO Tiddlers (title, text, revision) VALUES (?, ?, ?)", [tiddler.title, tiddler.text, 1]);
				alert("Jim4: " + tiddler.title);
			}
		);
	}

	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	context.status = true;
        if(callback)
                window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

config.adaptors[HTML5DatabaseAdaptor.serverType] = HTML5DatabaseAdaptor;

//}}}
