# Void Fest PWA Backend

This backend provides an API to be able to [register clients at FCM](https://firebase.google.com/docs/cloud-messaging/js/client). 

# Endpoints

> GET / --> Check if backend is "alive"
> POST /api/webpush/topic/:name/subscribe --> Subscribe to a topic
> POST /api/webpush/topic/:name/unsubscribe --> Unsubscribe from a topic
> POST /api/webpush/topic/:name/send --> Sends a message to a topic