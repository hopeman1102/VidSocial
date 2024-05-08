import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';

export default class SocketData extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: []
    };

    this.socket = new WebSocket(appBaseUrl.SocketUrl);
  }
  componentDidMount() {
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (e) => {
      // Add received message to the state
      const dataType = typeof e.data;

      this.props.onChildData(JSON.parse(e.data));

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
    const { messages } = this.props;
    // {this.state.messages.map((message, index) => (
    //   messages={message}
    // ))}
    return (
      <>
      </>
      // <View>
      //   <Text>WebSocket Messages:</Text>
      //   {/* {this.state.messages.map((message, index) => (
      //     <Text key={index}>{message}</Text>
      //   ))} */}
      // </View>
    );
  }
}

 