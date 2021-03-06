# Run search-index in the Browser

The latest browserified version of `search-index` is available in the
<a href="../dist">dist directory</a>.

There are many ways of using `search-index` in a browser. You could
for example do something like this:

```html
<script src="highland.min.js"></script>
<script src="search-index.min.js"></script>
<script>

// display search results in a div
const paintResultDiv = function(result) {
  result = JSON.parse(result)
  console.log(result)
  document.getElementById('result').innerHTML = result.document.body
}

// index some data
const indexData = function(err, index) {
  index.flush(function(err) {
    highland([{
      id: '1',
      body: 'this is a document from the search index'
    }])
      .pipe(index.defaultPipeline())
      .pipe(index.add())
      .on('data', function(data) {
        console.log(data)
      })     
      .on('end', function() {
        index.search().on('data', paintResultDiv)
      })     
  })
}

// initialize search-index
SearchIndex({
  indexPath: 'fergie'
}, indexData) 

</script>
<div id="result">waiting for results...</div>
```
