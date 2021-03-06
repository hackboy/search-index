const fs = require('fs')
const test = require('tape')
var server

test('check size of bundle', function (t) {
  t.plan(2)
  fs.stat('./dist/search-index.min.js', function (err, stats) {
    t.error(err)
    console.log(stats.size)
    t.ok((stats.size < 1100000), 'bundle should be less than 1mb')
  })
})

test('start server', function (t) {
  t.plan(1)
  server = require('http').createServer(function (req, res) {
    console.log(req.url)
    if ((req.url === '/node_modules/highland/dist/highland.min.js')
        || (req.url === '/test/browser/test.js')
        || (req.url === '/dist/search-index.min.js')
       ) {
      fs.readFile('.' + req.url, function (err, file) {
        if (err) console.log('problem setting up test server ' + err)
        res.writeHeader(200)
        res.write(file)
        res.end()
      })
    } else {
      res.writeHeader(200, {'Content-Type': 'text/html'})
      res.write('<script src="/node_modules/highland/dist/highland.min.js"></script>')
      res.write('<script src="/dist/search-index.min.js"></script>')
      res.write('<script src="/test/browser/test.js"></script>')
      res.write('<div name="result" id="result">waiting...</div>')
      res.end()
    }
  }).listen(8080, function (err) {
    t.error(err)
  })
})

test('connect to test html page', function (t) {
  t.plan(1)
  var webdriver = require('selenium-webdriver')
  var browser
  if (process.env.SAUCE_USERNAME !== undefined) {
    browser = new webdriver.Builder()
      .usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: 'chrome'
      }).build()
  } else {
    browser = new webdriver.Builder()
      .withCapabilities({
        browserName: 'chrome'
      }).build()
  }
  browser.get('http://localhost:8080')

  var resultDiv = browser.findElement(webdriver.By.id('result'))
  // resultDiv.getInnerHtml().then(function (html) {
    // t.equal(html, 'waiting...')
  // })
  browser.wait(webdriver.until.elementTextIs(resultDiv, 'this is a document from the search index'), 30000)
  resultDiv.getInnerHtml().then(function (html) {
    t.equal(html, 'this is a document from the search index')
    browser.quit()
  })
})

test('teardown', function (t) {
  server.close()
  t.end()
})
