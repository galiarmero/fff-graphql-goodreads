const express = require('express');
const graphqlHTTP = require('express-graphql')
const fetch = require('node-fetch')
const util = require('util')
const parseXml = util.promisify(require('xml2js').parseString)
const DataLoader = require('dataloader')
const app = express();


const GOODREADS_API_KEY = 'AReaGWL0Ka51bezD45OvzQ'
const schema = require('./schema')


const fetchAuthor = id => 
    fetch(
        `https://www.goodreads.com/author/show.xml?id=${id}&key=${GOODREADS_API_KEY}`
    )
        .then(response => response.text())
        .then(parseXml)

const fetchBook = id => 
    fetch(`https://www.goodreads.com/book/show/${id}.xml?key=${GOODREADS_API_KEY}`)
        .then(response => response.text())
        .then(parseXml)

app.use('/graphql', graphqlHTTP(re => {
    const authorLoader = new DataLoader(keys => Promise.all(keys.map(fetchAuthor)))
    const bookLoader = new DataLoader(keys => Promise.all(keys.map(fetchBook)))

    return {
        schema,
        context: {
            authorLoader,
            bookLoader
        },
        graphiql: true
    }
}))

app.listen(4000);
console.log("Listening...")