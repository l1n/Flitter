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
            'input[id="password"]':  'SOMEPASSWORDHERE'
        }, true);
    });
    spooky.then(function () {
        this.emit('log', this.evaluate(function () {
            return document;
        }));
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
