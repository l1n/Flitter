# Flitter
Sympa scraper/config writer

A pair of scripts (read.js and write.js) for scraping and writing back to Sympa list server configs.
This was created for the UMBC DoIT, and as such is adapted for use with the Shibboleth SSO. I welcome pull requests to extend the authentication methods supported!
This intentionally does not use the SOAP API because of the way our Single Sign-On works. If you don't require that functionality, the SOAP API might be a better choice.

## Syntax
### read.js
    casperjs read.js --user=username --pass=password [--verbose] [--legacy] [--base=http://example.sympa.com/] [--only=description] [--pretty] [--stdout] list1 [list2 ...] 
```
--verbose gives more output about what's going on throughout the program
--legacy swaps the order of SSO prompts and hitting the Sympa login functionality. Implicitly sets the --base path.
--base sets the base uri for sympa requests (including the /sympa directory if you have one)
--only allows scraping only a single page of the config
--pretty sets the JSON output to indent and add newlines
--stdout dumps configs to the screen instead of writing them to [listname].json
```
### write.js
    casperjs write.js --user=username --pass=password [--verbose] [--legacy] [--base=http://example.sympa.com/] list1=sendtype [list2=sendtype ...] 
```
--verbose gives more output about what's going on throughout the program
--legacy swaps the order of SSO prompts and hitting the Sympa login functionality. Implicitly sets the --base path.
--base sets the base uri for sympa requests (including the /sympa directory if you have one)
```
