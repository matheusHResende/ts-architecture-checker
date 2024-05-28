import express from "express"
var app = express();

const port = 3000

app.get('/', function (req, res) {
    res.send('hello world');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})