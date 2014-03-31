var emailTemplates = require('../')
  , createDummyContext = emailTemplates.createDummyContext
  , swig = require('swig')
  , assert = require('assert')
  , path = require('path')
  , Batch = require('batch')
  , fs = require('fs');

var testMap = {
  "simple_vars": {
    hello: "hello"
  },
  "two_vars_content": {
    one: "one",
    two: "two"
  },
  "for_loop": {
    scalar: "scalar",
    scalar2: "scalar2",
    xyz: [ "abcd" ],
    lalala: "lalala"
  },
  "plays": {
    subject: "subject",
    emailPreferencesUrl: "emailPreferencesUrl",
    userImgUrl: "userImgUrl",
    playCount: "playCount",
    commentCount: "commentCount",
    voteCount: "voteCount",
    facebookShareUrl: "facebookShareUrl",
    twitterShareUrl: "twitterShareUrl",
    userName: "userName",
    opportunityListenUrl: "opportunityListenUrl",
    submissionStatsUrl: "submissionStatsUrl"
  },
  "if_statement": {
    one: "one",
    two: "two",
    three: "three",
    four: "four",
    five: "five",
    foo: "foo",
    derp: "derp"
  },
  "comments": {
    twenty: "twenty",
    ten: "ten",
    eleven: "eleven",
    baseOne: "baseOne",
    baseTwo: "baseTwo"
  },
  "complex_variable": {
    scalar: "scalar",
    one: {
      two: {
        three: "three",
        four: "four"
      },
      five: {
        four: "four"
      },
      six: "six"
    },
    foo: {
      bar: "bar",
      arr: [{
        prop: [{
          prop2: "prop2"
        }]
      }]
    },
    xyz: [[
      {
        one: "one",
        two: "two"
      }
    ]],
    lalala: "lalala",
    la2: "la2"
  }
};

describe("swig-email-templates", function() {
  var render;
  before(function(cb) {
    var options = {
      root: path.join(__dirname, "templates")
    };
    emailTemplates(options, function(err, renderFn) {
      if (err) {
        cb(err);
      } else {
        render = renderFn;
        cb();
      }
    });
  });

  for (var templateName in testMap) {
    it(templateName, createIt(templateName, testMap[templateName]));
  }
  
  function createIt(templateName, context) {
    return function(cb) {
      var batch = new Batch();
      batch.push(function(cb) {
        render(templateName + '.html', context, rewrite, function(err, html, text) {
          cb(err, {
            html: html,
            text: text
          });
        });
      });
      batch.push(function(cb) {
        var filename = path.join(__dirname, "templates", templateName + ".out.html");
        fs.readFile(filename, 'utf8', cb);
      });
      batch.push(function(cb) {
        var filename = path.join(__dirname, "templates", templateName + ".out.txt");
        fs.exists(filename, function(exists) {
          if (exists)
            fs.readFile(filename, 'utf8', cb);
          else
            cb(null, null);
        });
      });
      batch.end(function(err, results) {
        if (err) return cb(err);
        assert.strictEqual(results[0].html.trim(), results[1].trim());
        if (results[2])
          assert.strictEqual(results[0].text.trim(), results[2].trim());
        cb();
      });
    };
  }
});

function rewrite(urlString) {
  return urlString + "-append";
}
