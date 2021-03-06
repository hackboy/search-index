/* global describe */
/* global it */

const JSONStream = require('JSONStream')
const Readable = require('stream').Readable
const SearchIndex = require('../../../')
const logLevel = process.env.NODE_ENV || 'error'
const s = new Readable()
const sandboxPath = 'test/sandbox'

var si

s.push(JSON.stringify({
  id: '1',
  name: 'Apples',
  description: 'fruit fruit salad'
}))
s.push(JSON.stringify({
  id: '2',
  name: 'Oranges',
  description: 'fruit salad'
}))
s.push(JSON.stringify({
  id: '3',
  name: 'Bananas',
  description: 'fruit fruit fruit fruit salad'
}))
s.push(JSON.stringify({
  id: '4',
  name: 'Grapes',
  description: 'fruit fruit fruit salad'
}))
s.push(null)

describe('some simple relevancy tests: ', function () {
  it('should do some simple indexing', function (done) {
    var i = 0
    SearchIndex({
      indexPath: sandboxPath + '/relevance-test',
      logLevel: logLevel
    }, function (err, thisSI) {
      ;(!err).should.be.exactly(true)
      si = thisSI
      s.pipe(JSONStream.parse())
        .pipe(si.defaultPipeline())
        .pipe(si.add())
        .on('data', function (data) {
          i++
        })
        .on('end', function () {
          i.should.be.exactly(5)
          true.should.be.exactly(true)
          return done()
        })
    })
  })

  it('simple * search, sorted by ID', function (done) {
    var results = []
    si.search({
      query: [{
        AND: {'*': ['*']}
      }]
    }).on('data', function (data) {
      results.push(JSON.parse(data))
    }).on('end', function () {
      // console.log(results)
      results.map(function (item) {
        return item.document.id
      }).should.eql(
        [ '4', '3', '2', '1' ])
      return done()
    })
  })

  it('search for salad- "salad" is more relevant when there is less "fruit"', function (done) {
    var results = []
    si.search({
      query: [{
        AND: {'*': ['salad']}
      }]
    }).on('data', function (data) {
      results.push(JSON.parse(data))
    }).on('end', function () {
      results.map(function (item) {
        return item.document.id
      }).should.eql(
        [ '2', '1', '4', '3' ])
      return done()
    })
  })

  it('search for fruit- fruit is always the highest occuring term, and therefore results are sorted by id', function (done) {
    var results = []
    si.search({
      query: [{
        AND: {'*': ['fruit']}
      }]
    }).on('data', function (data) {
      results.push(JSON.parse(data))
    }).on('end', function () {
      results.map(function (item) {
        return item.document.id
      }).should.eql(
        [ '4', '3', '2', '1' ])
      return done()
    })
  })
})
