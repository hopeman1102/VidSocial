import { Text, View } from 'react-native';
import React, { Component } from 'react';
import Sound from 'react-native-sound';

export default class RingtoneComponent extends Component {

  constructor() {
    super();
    this.state = {
      ringtone: new Sound(require('../Screens/ringtone.mp3'), (error) => {
        if (error) {
          console.log('Error loading sound:', error);
        } else {
          // Play the sound
          this.state.ringtone.play((success) => {
            if (success) {
              console.log('Sound played successfully');
            } else {
              console.log('Error playing sound');
            }
          });
        }
      })
    };
  }

  componentWillUnmount() {
    this.state.ringtone?.stop();
    this.state.ringtone?.release();
  }

  render() {
    return (
      <></>
    );
  }
}
