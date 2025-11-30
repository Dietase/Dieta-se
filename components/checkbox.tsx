import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckBoxWithLabel({
  label = '',
  isChecked,
  onValueChange,
  containerStyle,
  rowStyle,
  checkboxStyle,
  labelStyle,
}) {
  const size = 30;

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={() => onValueChange(!isChecked)}
        style={[styles.row, rowStyle]}
      >
        <View
          style={[
            styles.checkbox,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: isChecked ? '#2ecc71' : '#999999',
              backgroundColor: isChecked ? '#2ecc71' : 'transparent',
            },
            checkboxStyle,
          ]}
        >
          {isChecked && (
            <Ionicons name="checkmark" size={size * 0.6} color="white" />
          )}
        </View>
        {label !== '' && (
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
  },
});
