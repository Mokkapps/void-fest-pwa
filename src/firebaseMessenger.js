import firebase from 'firebase';

export default class FirebaseMessenger {
  constructor() {
    firebase.initializeApp({
      messagingSenderId: '1082867131539'
    });
    console.log('Initialized Firebase app');

    this.messaging = firebase.messaging();
  }

  getMessaging = () => this.messaging;

  askForPermissionToReceiveNotifications = async () => {
    try {
      await this.messaging.requestPermission();
      console.log('Notification permission granted.');
      return this.messaging.getToken();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };

  deleteToken = async () => {
    const token = await this.messaging.getToken();
    await this.messaging.deleteToken(token);
    console.log('Token deleted.');
  };
}
