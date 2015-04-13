var casper = require("casper").create();
var listName = casper.cli.get(0);
var list = {};
casper.start(
        'http://umbc-lists.merit.edu');
casper.then(function () {
    this.echo('[INFO] Filling out login form');
    this.fillSelectors('form', {
        'input[id="username"]':  'sda1list',
        'input[id="password"]':  'listmaster'
    }, true);
});
casper.waitForSelector('input[name="action_sso_login"]', function () {
    this.click('input[name="action_sso_login"]');
});
casper.then(function () {
    this.fillSelectors('div[class="MenuBlock menu_search"] form', {
        'input[id="filter"]': listName
    }, true);
});
casper.thenOpen('https://umbc-lists.merit.edu/sympa/edit_list_request/'+listName+'/description', function () {
    list = this.evaluate(function(list) {
        list = {"owner": [], "editor": []};
        for (var i = 0; i < (document.querySelector('form[class="bold_label"] div[class="block"]:nth-of-type(3) div[class="edit_list_request_enum"]').children.length-7)/18; i++) {
            list.owner[i] = {
            "email":'',
            "gecos":'',
            "profile":''
            };
            list.owner[i].keys().forEach(function (k) {
                list.owner[i].k = document.querySelector('div[id="single_param.owner.'+i+'.'+k+'"]').value
            });
        }
        for (var i = 0; i < (document.querySelector('form[class="bold_label"] div[class="block"]:nth-of-type(5) div[class="edit_list_request_enum"]').children.length-7)/18; i++) {
            list.editor[i] = {
            "email":'',
            "gecos":'',
            "profile":''
            };
            list.editor[i].keys().forEach(function (k) {
                list.editor[i].k = document.querySelector('div[id="single_param.editor.'+i+'.'+k+'"]').value
            });
        }
        return list;
    }, list);
});

casper.then(function () {
    this.echo(JSON.stringify(list));
});
casper.run();
