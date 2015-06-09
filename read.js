var casper = require("casper").create();
var fs = require('fs');
casper.options.waitTimeout = 20000;
var lists = casper.cli.args;
var sendHash = {
    "Closes the list. No one may post": "closed",
    "Moderated": "editorkey",
    "Moderated, even for moderators": "editorkeyonly",
    "restricted to local domain": "intranet",
    "restricted to local domain and subscribers": "intranetorprivate",
    "Newsletter, restricted to moderators": "newsletter",
    "Newsletter, restricted to moderators after confirmation": "newsletterkeyonly",
    "Only list owners may post": "owneronly",
    "Posting is restricted to subscribers": "private",
    "restricted to subscribers check smime signature": "private_smime",
    "Moderated, restricted to subscribers": "privateandeditorkey",
    "Moderated, for non subscribers sending multipart messages": "privateandnomultipartoreditorkey",
    "restricted to subscribers with previous md5 authentication": "privatekey",
    "Moderated, for subscribers and moderators": "privatekeyandeditorkeyonly",
    "Private, moderated for non subscribers": "privateoreditorkey",
    "Private, confirmation for non subscribers": "privateorpublickey",
    "public list": "public",
    "public list, Bcc rejected (anti-spam)": "public_nobcc",
    "anyone with previous md5 authentication": "publickey",
    "public list multipart/mixed messages are forwarded to moderator": "publicnoattachment",
    "public list multipart messages are rejected": "publicnomultipart",
};
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
lists.forEach(function (listName) {
    var list = {"owner": [], "editor": []};
    if (casper.cli.get('legacy')) {
        casper.thenOpen(baseUrl+'/edit_list_request/'+listName+'/sending', function () {
            list = {};
            list = this.evaluate(function(list, sendHash) {
                list.send = sendHash[document.querySelector('input[name="single_param.send.name"][checked]').parentElement.nextElementSibling.textContent.replace(/^\s+|\s+$/g, '')];
                return list;
            }, list, sendHash);
        });
    } else {
        if (!casper.cli.get('only') || casper.cli.get('only') === 'description') {
            casper.thenOpen(baseUrl+'/edit_list_request/'+listName+'/description', function () {
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
                if (casper.cli.get('verbose')) casper.echo('Getting visibility');
                list = this.evaluate(function(list) {
                    list.visibility = document.querySelector('select[id="single_param.visibility.name"]').value;
                    return list;
                }, list);
            });
            casper.thenOpen(baseUrl+'/edit_list_request/'+listName+'/sending', function () {
                list = this.evaluate(function(list) {
                    list.send = document.querySelector('select[id="single_param.send.name"]').value;
                    return list;
                }, list);
            });
        }
        if (!casper.cli.get('only') || casper.cli.get('only') === 'command') {
            casper.thenOpen(baseUrl+'/edit_list_request/'+listName+'/command', function () {
                if (casper.cli.get('verbose')) casper.echo('Getting list settings');
                list = this.evaluate(function(list) {
                    var key = ['info', 'subscribe', 'add', 'unsubscribe', 'del', 'invite', 'remind', 'review'];
                    for (var j = 0; j < key.length; j++) {
                        list[key[j]] = document.querySelector('input[id="single_param.'+key[j]+'.name"],select[id="single_param.'+key[j]+'.name"]').value;
                    }
                    return list;
                }, list);
            });
        }
    }
    casper.then(function () {
        if (casper.cli.get('verbose')) casper.echo('listName:' + listName);
        var output = "";
        if (casper.cli.get('pretty')) output = JSON.stringify(list, null, 4);
        else output = JSON.stringify(list);
        if (casper.cli.get('stdout')) casper.echo(output);
        else fs.write(listName+'.json', output, 'w');
    });
});
casper.run();
