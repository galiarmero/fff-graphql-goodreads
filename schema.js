const fetch = require('node-fetch')
const util = require('util')
const parseXml = util.promisify(require('xml2js').parseString)
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
} = require('graphql')

const GOODREADS_API_KEY = 'AReaGWL0Ka51bezD45OvzQ'

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: '...',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (xml) => xml.GoodreadsResponse.book[0].id[0]
        },
        title: {
            type: GraphQLString,
            resolve: (xml) => xml.GoodreadsResponse.book[0].title[0]
        },
        isbn: {
            type: GraphQLString,
            resolve: (xml) => xml.GoodreadsResponse.book[0].isbn[0]
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: '...',
    fields: () => ({
        name: {
            type: GraphQLString,
            resolve: (xml) => xml.GoodreadsResponse.author[0].name[0]
        },
        books: {
            type: GraphQLList(BookType),
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (xml, args) => {
                const ids = args.id
                            ? [args.id]
                            : xml.GoodreadsResponse.author[0].books[0].book.map(book => book.id[0]._)
                return Promise.all(ids.map(id => 
                    fetch(`https://www.goodreads.com/book/show/${id}.xml?key=${GOODREADS_API_KEY}`)
                        .then(response => response.text())
                        .then(parseXml)
                ))
            }
        },
        fansCount: {
            type: GraphQLString,
            resolve: (xml) => xml.GoodreadsResponse.author[0].fans_count[0]._
        }
    })
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: () => ({
            author: {
                type: AuthorType,
                args: {
                    id: { type: GraphQLInt }
                },
                resolve: (root, args) => fetch(
                    `https://www.goodreads.com/author/show.xml?id=${args.id}&key=${GOODREADS_API_KEY}`
                )
                .then(response => response.text())
                .then(parseXml)
            }
        })
    })
})