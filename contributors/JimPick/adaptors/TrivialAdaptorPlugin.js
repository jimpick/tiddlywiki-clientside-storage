//{{{

// Borrows liberally from TiddlyWebAdaptorPlugin and FileAdaptor

function TrivialAdaptor()
{
}

TrivialAdaptor.prototype = new AdaptorBase();

TrivialAdaptor.serverType = 'trivial'; // MUST BE LOWER CASE

TrivialAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	console.log("Jim1: getWorkspaceList " + context)
	context = this.setContext(context,userParams,callback);
        context.workspaces = [{title:"(default)"}];
        context.status = true;
        if(callback)
                window.setTimeout(function() {callback(context,userParams);},10);
        return true;
};

TrivialAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	console.log("Jim1: getTiddlerList " + context)
	context = this.setContext(context,userParams,callback);

	context.tiddlers = [];

	tiddler1 = new Tiddler("trivial1");
	tiddler1.fields['server.type'] = TrivialAdaptor.serverType;
	tiddler1.fields['server.workspace'] = "default";
	tiddler1.fields['server.page.revision'] = "2";
	context.tiddlers.push(tiddler1);

	tiddler2 = new Tiddler("trivial2");
	tiddler2.fields['server.type'] = TrivialAdaptor.serverType;
	tiddler2.fields['server.workspace'] = "default";
	tiddler2.fields['server.page.revision'] = "1";
	context.tiddlers.push(tiddler2);

	context.status = true;

        if(callback)
                window.setTimeout(function() {callback(context,userParams);},10);

	return true;
};

TrivialAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision) {
		context.revision = revision;
	}
	return this.getTiddler(title,context,userParams,callback);
};

TrivialAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

TrivialAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	console.log("Jim getTiddler " + title + " " + context);
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = TrivialAdaptor.getTiddlerComplete;
	return context.complete(context,context.userParams);
};

TrivialAdaptor.getTiddlerComplete = function(context,userParams)
{
	if(context.title == "trivial1" || context.title == "trivial2") {
		t = new Tiddler(context.title);
		t.fields['server.type'] = TrivialAdaptor.serverType;
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


TrivialAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	console.log("Jim putTiddler " + tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	context.status = true;
        if(callback)
                window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

config.adaptors[TrivialAdaptor.serverType] = TrivialAdaptor;

//}}}
