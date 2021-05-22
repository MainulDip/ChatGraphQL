import React from 'react'
import { ApolloClient, InMemoryCache, useSubscription, useMutation, gql, ApolloProvider } from '@apollo/client';
import { Container, Row, Col, FormInput, Button } from 'shards-react'
import { WebSocketLink } from '@apollo/client/link/ws';


const link = new WebSocketLink({
    uri: 'ws://localhost:4000/',
    options: {
        reconnect: true
    }
});

const client = new ApolloClient({
    link,
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache()
});

const GET_MESSAGES = gql`
subscription {
  messages{
  id,
  user,
  content
}
}
`
const POST_MESSAGE = gql`
mutation ($user: String!, $content: String! ) {
  postMessage(user: $user, content: $content)
}
`



const Messages = ({ user }) => {
    const { data } = useSubscription(GET_MESSAGES)
    if (!data) {
        return null;
    }

    return (
        <>
            <div>
                {JSON.stringify(data)}
            </div>
            <div>
                {data.messages.map(({ id, user: messageUser, content }) => (
                    <div key={id} style={{ display: 'flex', justifyContent: user === messageUser ? 'flex-end' : 'flex-start', paddingBottom: '1em' }}>

                        {user !== messageUser && (
                            <div style={{ height: 50, width: 50, marginRight: '0.5em', border: '2px solid black', borderRadius: 25, textAlign: 'center', fontSize: '16px', padding: 5 }}>
                                {messageUser.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div style={{ background: user === messageUser ? 'blue' : 'yellow', color: user === messageUser ? 'white' : 'black', padding: '1em', maxWidth: '70%' }}>
                            {content}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )


}

const Chat = () => {
    const [state, stateSet] = React.useState({
        user: 'Jack',
        content: ''
    })

    const [postMessage] = useMutation(POST_MESSAGE)

    const onSend = () => {
        if (state.content.length > 0) {
            postMessage({
                variables: state
            })
        }
        stateSet({
            ...state,
            content: ''
        })
    }
    return (
        <Container>
            <Messages user={state.user}></Messages>
            <Row>
                <Col xs={2} style={{ padding: 0 }}>
                    <FormInput label="User" value={state.user}
                        onChange={(evt) => stateSet({
                            ...state,
                            user: evt.target.value
                        })}
                    >

                    </FormInput>
                </Col>
                <Col xs={8} style={{ padding: 0 }}>
                    <FormInput label="Content" value={state.content}
                        onChange={(evt) => stateSet({
                            ...state,
                            content: evt.target.value
                        })}

                        onKeyUp={(evt) => {
                            if (evt.keyCode === 13) {
                                onSend()
                            }
                        }}
                    >

                    </FormInput>
                </Col>
                <Col xs={2} style={{ padding: 0 }}>
                    <Button onClick={() => {
                        onSend()
                    }}>
                        Send
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}

export default () => (
    <ApolloProvider client={client}>
        <Chat />
    </ApolloProvider>
)