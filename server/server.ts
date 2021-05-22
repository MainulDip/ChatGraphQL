import { GraphQLServer, PubSub } from 'graphql-yoga'
// import GraphQLServer = require('graphql-yoga')
// import PubSub = require('graphql-yoga')

const messages: any[] = []
console.dir(messages, { depth: null })

const typeDefs = `
    type Message {
        id: ID!
        user: String!
        content: String!
    }

    type Query {
        messages: [Message!]
    }
   
    type Mutation {
        postMessage(user: String!, content: String!): ID!
    }

    type Subscription {
      messages: [Message!]
    }
`
const subscribers: (()=>void)[] = []
const onMessagesUpdates = (fn: any) => { 
  console.log('This from subscribers')
 console.log(fn)
  return subscribers.push(fn) 
}

const resolvers = {
  Query: {
    messages: () => messages
  },
  Mutation: {
    postMessage: (parent: any, { user, content }: { user: string, content: string }): number => {
      const id = messages.length
      messages.push({
        id,
        user,
        content
      })
      console.log(messages)
      console.log(subscribers)
      subscribers.forEach(fn => fn())
      return id
    }
  },
  Subscription: {
    messages: {
      subscribe: (parent: any, args: any, { pubsub }: { pubsub: any }) => {
        const channel = Math.random()
          .toString(36)
          .slice(2, 15)
        console.log(`cannel: ${channel}`)
        onMessagesUpdates(() => {
          console.log('pubsub dir')
          console.dir(pubsub.asyncIterator(channel), { depth: null })
          return pubsub.publish(channel, { messages })
        })
        setTimeout(() => pubsub.publish(channel, { messages }), 0)

        return pubsub.asyncIterator(channel)
      }
    }
  }
}

const pubsub = new PubSub()

const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } })
server.start(({ port }) => {
  console.log(`Server started on http://localhost:${port}/`)
})
