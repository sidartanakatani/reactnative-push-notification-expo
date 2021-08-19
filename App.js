import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    };
  }
});

export default function App() {
  const [pushToken, setPushToken] = useState();

  const allowsNotificationsAsync = async () => {
    try {
      let { status } = await Notifications.getPermissionsAsync();

      if (status !== 'granted') {
        status = await Notifications.requestPermissionsAsync();
      }

      if (status === 'granted') {
        const { data: token } = await Notifications.getExpoPushTokenAsync();

        setPushToken(token);
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    allowsNotificationsAsync();
  }, []);

  useEffect(() => {
    const backgroundSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log(response);
      });

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        // console.log(notification);
      });

    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);

  const triggerNotitificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My first local notification',
        body: 'This is the first local notification we are sending!'
      },
      trigger: {
        seconds: 10
      }
    });
  };

  const sendPushNotification = () => {
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: pushToken,
        data: {
          extraData: 'some data'
        },
        title: 'Sent via the app',
        body: 'This push notification was sent via the app'
      })
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger Notification"
        onPress={triggerNotitificationHandler}
      />
      <Button title="Send Notification" onPress={sendPushNotification} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
