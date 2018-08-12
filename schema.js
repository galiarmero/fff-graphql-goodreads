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
        },
        authors: {
            type: GraphQLList(AuthorType),
            resolve: (xml) => {
                console.log(JSON.stringify(xml.GoodreadsResponse.book[0].authors[0].author))
            },
            resolve: (xml, args, context) => {
                const authorIds = xml.GoodreadsResponse.book[0].authors[0].author.map(a => a.id[0])
                return context.authorLoader.loadMany(authorIds)
            }
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
            resolve: (xml, args, context) => {
                const ids = args.id
                            ? [args.id]
                            : xml.GoodreadsResponse.author[0].books[0].book.map(book => book.id[0]._)
                return context.bookLoader.loadMany(ids)
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
                resolve: (root, args, context) => context.authorLoader.load(args.id)
            }
        })
    })
})