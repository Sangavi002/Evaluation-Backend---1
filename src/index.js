const express = require("express");
const fs = require("fs")
const  morgan = require('morgan')
const path = require("path");
const port = 3000;

// initialize the express
const app = express();
// create a write stream
const accessLog = fs.createWriteStream(path.join(__dirname,'access.log'),{flag: 'a'})
// define custom morgan
morgan.format('custom',(tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
})
// setup the logger
app.use(morgan('custom', { stream: accessLog}));
// middleware to parse JSOn bodies
app.use(express.json());
// created custom middleware
let trades = (req,res,next) => {
    const {id,type,user_id,symbol,shares,price} = req.body;

    let validateError = [];

     if (typeof id !== "number") validateError.push("ID must be number");
     if (typeof type !== "string") validateError.push("Type must be string");
     if (typeof user_id !== "number") validateError.push("user_id must be number");
     if (typeof symbol !== "string") validateError.push("Symbol must be string");
     if (typeof shares !== "number") validateError.push("Share must be number");
     if (typeof price !== "number") validateError.push("Price must be number");

     else{
        next()
     }
}
// routes
app.get("/trades",(req,res) => {
    res.status(200).send("data..")
})
app.post("/trades",(req,res) => {
    console.log(req.body);
    const data = fs.readFileSync("./db.json","utf-8");
    const parseData = JSON.parse(data);
    parseData.trades.push(req.body);
    fs.writeFileSync("./db.json",JSON.stringify(parseData));
    res.status(200).send("Got the data")
})

app.delete("/trades/:id",(req,res) => {
    const data = fs.readFileSync("./db.json","utf-8");
    const parseData = JSON.parse(data);

    const tradeId = req.params.id;
    // filtering traders with id.
    parseData.trades = parseData.trades.filter(trade => trade.id !== Number(tradeId));

    fs.writeFileSync("./db.json",JSON.stringify(parseData));
    res.status(200).send("Trade was deleted.")

})

app.patch("/trades/:id",(req,res) => {
    const data = fs.readFileSync("./db.json","utf-8");
    const parseData = JSON.parse(data);

    const tradeId = req.params.id;
    let requestData = req.body;
    // Updating trade price with id.
   parseData.trades.map(trade => {
    if(trade.id === Number(tradeId)){
        trade.price = requestData?.price;
    }
   })

    fs.writeFileSync("./db.json",JSON.stringify(parseData));
    res.status(201).send("Price was updated")

})

app.listen(port,() => {
    console.log(`Server is running in the port ${port}.`)
})