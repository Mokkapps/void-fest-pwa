const express = require('express');
const admin = require("firebase-admin");
const bodyParser = require('body-parser');
const app = express();

const HEROKU_APP_NAME = 'void-fest-pwa';

// This file contains sensitive information, including the service account's private encryption key. 
// Therefore it is not stored in a public repository.
const serviceAccount = require("./void-fest-pwa-firebase-adminsdk-hu14s-f555365da9.json");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

const port = process.env.PORT || 5000;

// Initialize Firebase app
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://void-fest-pwa.firebaseio.com"
});

app.get('/', (req, res) => res.send('Void Fest PWA backend is alive!'));

app.post('/api/webpush/topic/:name/subscribe', (req, res) => {
    const registrationToken = req.body.token;
    const topicName = req.params.name;
    // Subscribe the devices corresponding to the registration tokens to the topic.
    admin.messaging().subscribeToTopic(registrationToken, topicName)
        .then(function (response) {
            // See the MessagingTopicManagementResponse reference documentation
            // for the contents of response.
            console.log(`Successfully subscribed to topic "${topicName}" :`, response);
            res.status(200).send(`Successfully subscribed to topic "${topicName}": ${JSON.stringify(response)}`);
        })
        .catch(function (error) {
            console.error(`Error subscribing to topic "${topicName}":`, error);
            res.status(400).send(`Error subscribing to topic "${topicName}": ${JSON.stringify(error)}`);
        });
});

app.post('/api/webpush/topic/:name/unsubscribe', (req, res) => {
    const registrationToken = req.body.token;
    const topicName = req.params.name;
    // Unsubscribe the devices corresponding to the registration tokens from
    // the topic.
    admin.messaging().unsubscribeFromTopic(registrationToken, topicName)
        .then(function (response) {
            // See the MessagingTopicManagementResponse reference documentation
            // for the contents of response.
            console.log(`Successfully unsubscribed from topic "${topicName}":`, response);
            res.status(200).send(`Successfully unsubscribed from topic "${topicName}": ${JSON.stringify(response)}`);
        })
        .catch(function (error) {
            console.error(`Error unsubscribing from topic "${topicName}":`, error);
            res.status(400).send(`Error unsubscribing from topic "${topicName}": ${JSON.stringify(error)}`);
        });
});

app.post('/api/webpush/topic/:name/send', (req, res) => {
    const topicName = req.params.name;
    const messageData = req.body.data;
    const message = {
        data: messageData,
        topic: topicName
    };
    console.log('message to send', message);

    // Send a message to devices subscribed to the provided topic.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log(`Successfully sent message to topic "${topicName}":`, response);
            res.status(200).send(`Successfully sent message: ${JSON.stringify(response)}`);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            res.status(400).send(`Error sending message to topic "${topicName}": ${JSON.stringify(error)}`);
        });

});

// Keep free Heroku web dyno alive
setInterval(() => {
    http.get(`http://${HEROKU_APP_NAME}.herokuapp.com`);
}, 5 * 60 * 1000); // every 5 minutes

app.listen(port, () => {
    console.log(`Listening on port ${port} ...`);
});