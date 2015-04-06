var listName = process.argv.splice(2);

var Spooky = require('spooky');

var spooky = new Spooky({
    child: {
        transport: 'http'
    },
    casper: {
        logLevel: 'error',
        verbose: true
    }
}, function (err) {
    if (err) {
        e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        throw e;
    }

    spooky.start(
            'http://umbc-lists.merit.edu');
    spooky.then(function () {
        this.emit('log', '[INFO] Filling out login form');
        this.fillSelectors('form', {
            'input[id="username"]':  'sda1list',
            'input[id="password"]':  'listmaster'
        }, true);
    });
    spooky.then(function () {
        this.fillSelectors('form', {}, true);
    });
    spooky.thenEvaluate(function (listName) {
        this.open('http://umbc-lists.merit.edu/sympa/edit_list_request/'+listName+'/description');
    });
    spooky.then(function() {
        this.emit('log', this.getHTML());
    });
    spooky.run();
});

// spooky.on('console', function (line) {
//         console.log(line);
// });

spooky.on('error', function (e, stack) {
    console.error(e);

    if (stack) {
        console.log(stack);
    }
});

spooky.on('log', function (log) {
    console.log(log);
});
