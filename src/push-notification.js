import firebase from "firebase";

export class PushNotification {
  constructor() {
    firebase.initializeApp({
      messagingSenderId: "1082867131539"
    });
    console.log('Initialized Firebase app');

    this.messaging = firebase.messaging();
  }

  getMessaging = () => {
    return this.messaging;
  }

  askForPermissionToReceiveNotifications = async () => {
    try {
      await this.messaging.requestPermission();
      console.log('Notification permission granted.');
      return this.messaging.getToken();
    } catch (error) {
      console.error(error);
    }
  };

  deleteToken = async () => {
    const token = await this.messaging.getToken();
    await this.messaging.deleteToken(token);
    console.log('Token deleted.');
  };
}