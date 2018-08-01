importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '1082867131539'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Void Fest 2018 Reminder';
  var notificationOptions = {
    body: `Band "${payload.data.band}" is playing at ${payload.data.time} on ${payload.data.stage} stage`,
    icon: 'void-fest.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
