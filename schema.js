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

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: '...',
    fields: () => ({
        title: {
            type: GraphQLString,
            resolve: (book) => book.title[0]
        },
        isbn: {
            type: GraphQLString,
            resolve: (book) => book.isbn[0].$ ? null : book.isbn[0]
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
            resolve: (xml) => xml.GoodreadsResponse.author[0].books[0].book
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
                    `https://www.goodreads.com/author/show.xml?id=${args.id}&key=AReaGWL0Ka51bezD45OvzQ`
                )
                .then(response => response.text())
                .then(parseXml)
            }
        })
    })
})