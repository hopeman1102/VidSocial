// import { View, Text } from 'react-native'
// import React from 'react'

// export default function Socket() {
//   return (
//     <View>
//       <Text>Socket</Text>
//     </View>
//   )
// }


import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class Socket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: []
    };

    this.socket = new WebSocket('ws://your-websocket-server-address');
  }

  componentDidMount() {
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (e) => {
      // Add received message to the state
      this.setState(prevState => ({
        messages: [...prevState.messages, e.data]
      }));
    };

    this.socket.onerror = (error) => {
      console.log('WebSocket error: ', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket closed');
    };
  }

  componentWillUnmount() {
    // Close the WebSocket connection when the component unmounts
    this.socket.close();
  }

  render() {
    return (
      <View>
        <Text>WebSocket Messages:</Text>
        {this.state.messages.map((message, index) => (
          <Text key={index}>{message}</Text>
        ))}
      </View>
    );
  }
}
