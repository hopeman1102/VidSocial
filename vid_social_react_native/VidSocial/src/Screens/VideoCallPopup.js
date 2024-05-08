// VideoCallPopup.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const VideoCallPopup = ({ onRestore }) => {
  return (
    <View>
      <Text>Video Call Minimized</Text>
      <TouchableOpacity onPress={onRestore}>
        <Text>Restore</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VideoCallPopup;
