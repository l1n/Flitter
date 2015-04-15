var casper = require("casper").create();
casper.options.waitTimeout = 20000;
var listName = casper.cli.get("list");
var list = {"owner": [], "editor": [], "console": []};
casper.start(
        'http://umbc-lists.merit.edu');
casper.then(function () {
    this.fillSelectors('form', {
        'input[id="username"]':  casper.cli.get("user"),
        'input[id="password"]':  casper.cli.get("pass")
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
        for (var i = 0; i < (document.querySelector('form[class="bold_label"] div[class="block"]:nth-of-type(3) div[class="edit_list_request_enum"]').children.length-7)/18-1; i++) {
            list.owner[i] = {};
            var key = ['email', 'gecos', 'profile'];
            for (var j = 0; j < key.length; j++) {
                list.owner[i][key[j]] = document.querySelector('input[id="single_param.owner.'+i+'.'+key[j]+'"],select[id="single_param.owner.'+i+'.'+key[j]+'"]').value;
            }
        }
        for (var i = 0; i < (document.querySelector('form[class="bold_label"] div[class="block"]:nth-of-type(5) div[class="edit_list_request_enum"]').children.length-7)/18; i++) {
            list.editor[i] = {};
            var key = ['email', 'gecos'];
            for (var j = 0; j < key.length; j++) {
                list.editor[i][key[j]] = document.querySelector('input[id="single_param.editor.'+i+'.'+key[j]+'"],select[id="single_param.editor.'+i+'.'+key[j]+'"]').value;
            }
        }
        return list;
    }, list);
});

casper.then(function () {
    this.echo(JSON.stringify(list));
});
casper.run();
