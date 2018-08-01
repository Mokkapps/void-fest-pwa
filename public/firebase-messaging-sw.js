importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '1082867131539'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Void Fest Band Reminder';
  var notificationOptions = {
    body: 'Band X is playing now on stage X',
    icon: 'favicon.ico'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
