var casper = require("casper").create();
var fs = require('fs');
casper.options.waitTimeout = 20000;
var lists = casper.cli.args;
casper.start(
        'http://umbc-lists.merit.edu');
casper.then(function () {
    if (casper.cli.get('verbose')) casper.echo('Filling in form');
    this.fillSelectors('form', {
        'input[id="username"]':  casper.cli.get("user"),
        'input[id="password"]':  casper.cli.get("pass")
    }, true);
});
casper.waitForSelector('input[name="action_sso_login"]', function () {
    if (casper.cli.get('verbose')) casper.echo('Hit login');
    this.click('input[name="action_sso_login"]');
});
//for (var li = 0; li < lists.length; li++) {
    var listName = lists[0];
    var list = {"owner": [], "editor": []};
    casper.then(function () {
        if (casper.cli.get('verbose')) casper.echo('Filling in form');
        this.fillSelectors('div[class="MenuBlock menu_search"] form', {
            'input[id="filter"]': listName
        }, true);
    });
    casper.thenOpen('https://umbc-lists.merit.edu/sympa/edit_list_request/'+listName+'/description', function () {
            if (casper.cli.get('verbose')) casper.echo('Getting owners and moderators');
            list = this.evaluate(function(list) {
                for (var i = 0; i < (document.querySelector('form[class="bold_label"] div[class="block"]:nth-of-type(3) div[class="edit_list_request_enum"]').children.length-1)/19-1; i++) {
                    list.owner[i] = {};
                    var key = ['email', 'gecos', 'profile'];
                    for (var j = 0; j < key.length; j++) {
                        list.owner[i][key[j]] = document.querySelector('input[id="single_param.owner.'+i+'.'+key[j]+'"],select[id="single_param.owner.'+i+'.'+key[j]+'"]').value;
                    }
                }
                for (var i = 0; i < (document.querySelector('form[class="bold_label"] div[class="block"]:nth-of-type(5) div[class="edit_list_request_enum"]').children.length-1)/16-1; i++) {
                    list.editor[i] = {};
                    var key = ['email', 'gecos'];
                    for (var j = 0; j < key.length; j++) {
                        list.editor[i][key[j]] = document.querySelector('input[id="single_param.editor.'+i+'.'+key[j]+'"],select[id="single_param.editor.'+i+'.'+key[j]+'"]').value;
                    }
                }
                return list;
            }, list);
            });

    //    casper.thenOpen('https://umbc-lists.merit.edu/sympa/edit_list_request/'+listName+'/sending', function () {
    //            list = this.evaluate(function(list, selfie) {
    //                var hash = [{'name': 'send', 'values': ['name']}, {'name': 'anonymous_sender', 'values': ['name']}, {'name': 'reply_to_header', 'values': ['value', 'apply', 'other_email']}];
    //                for (var j = 0; j < hash.length; j++) {
    //                    if (hash[j].values[0] == 'name') {
    //                        list[hash[j].name] = document.querySelector('input[id="single_param.'+hash[j].name+'.name"],select[id="single_param.'+hash[j].name+'.name"]').value;
    //                        selfie.echo(JSON.stringify(list));
    //                    } else {
    //                        list[hash[j].name] = {};
    //                        for (var k = 0; k < hash[j].values.length; k++) {
    //                            list[hash[j]].name = document.querySelector('input[id="single_param.'+hash[j].name+'.'+hash[j].values[k]+'"],select[id="single_param.'+hash[j].name+'.'+hash[j].values[k]+'"]').value;
    //                        }
    //                    }
    //                }
    //                return list;
    //            }, list, this);
    //            });
    casper.thenOpen('https://umbc-lists.merit.edu/sympa/edit_list_request/'+listName+'/command', function () {
            if (casper.cli.get('verbose')) casper.echo('Getting list settings');
            list = this.evaluate(function(list) {
                var key = ['info', 'subscribe', 'add', 'unsubscribe', 'del', 'invite', 'remind', 'review'];
                for (var j = 0; j < key.length; j++) {
                    list[key[j]] = document.querySelector('input[id="single_param.'+key[j]+'.name"],select[id="single_param.'+key[j]+'.name"]').value;
                }
                return list;
            }, list);
            });
    //casper.thenOpen('https://umbc-lists.merit.edu/sympa/review/'+listName+'/1/1000/email', function() {
    //        list = this.evaluate(function(list) {
    //            
    //        }, list);
    //});
    casper.then(function () {
        casper.echo('listName:' + listName);
        var output = "";
        if (casper.cli.get('pretty') output = JSON.stringify(list, null, 4);
        else output = JSON.stringify(list);
        if (casper.cli.get('stdout')) casper.echo(output);
        else fs.writeFileSync(listName+'.json', output);
    });
//}
    casper.run();
