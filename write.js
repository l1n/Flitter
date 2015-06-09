var casper = require("casper").create();
casper.options.waitTimeout = 20000;
var lists = casper.cli.args;
var baseUrl = casper.cli.get('base') || (casper.cli.get('legacy')?'https://sympa.umbc.edu/lists':'https://lists.umbc.edu/sympa');
casper.start(baseUrl);
// Authentication
casper.then(function () {
    if (casper.cli.get('legacy')) {
        if (casper.cli.get('verbose')) casper.echo('Hit login');
        this.fillSelectors('form[name="loginform"]', {}, true);
    }
});
casper.then(function () {
    if (casper.cli.get('verbose')) casper.echo('Filling in form');
    this.fillSelectors('form', {
        'input[id="username"]':  casper.cli.get("user"),
        'input[id="password"]':  casper.cli.get("pass")
    }, true);
});
casper.then(function () {
    if (casper.cli.get('debug-section') === 'authentication') {
        casper.echo(this.fetchText('body'));
    }
});
if (!casper.cli.get('legacy')) {
    casper.waitForSelector('input[name="action_sso_login"]', function () {
        if (casper.cli.get('verbose')) casper.echo('Hit login');
        this.click('input[name="action_sso_login"]');
    });
}
setTimeout(lists.forEach(function (listName) {
    listName = listName.split('=');
    casper.thenOpen(baseUrl+'/edit_list_request/'+listName[0]+'/sending', function () {
    if (casper.cli.get('verbose')) casper.echo('Setting '+listName[0]+' to '+listName[1]);
        if (casper.cli.get('legacy')) {
            this.fillSelectors('div#content form', {
                "input#single_param.send.name": listName[1],
            }, true);
        } else {
            this.fillSelectors('form[class="bold_label"]', {
                "select[name='single_param.send.name']": listName[1],
            }, true);
        }
    });
}), 1000);
casper.run();
