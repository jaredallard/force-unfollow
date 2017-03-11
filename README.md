# force-unfollow

Force unfollows people in a .csv file called `names.csv`

## Running

```bash
$ yarn # Or npm install
$ DEBUG=force-unfollow node index.js
```

## Generating an inactive list

### From `statusbrew.com`

Audience Tab

1. Filter by whatever params.
2. Scroll all the way down (we're scrapping divs)
3. Open up Dev Console
4. Run the code below

```js
let arr = [];
$('.md-subhead.truncate').each((i, e) => {
  arr.push($(e).html())
});
console.log(arr.toString());
```

Copy the output into `names.csv`

Run!
