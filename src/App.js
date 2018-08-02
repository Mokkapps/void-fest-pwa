import React, { Component, Fragment } from 'react';
import { Alert, Button, Layout, notification, message } from 'antd';

import axios from 'axios';
import './App.css';

const { Header, Footer, Content } = Layout;

const BASE_URL = 'https://void-fest-pwa.herokuapp.com';
const FCM_SERVER_URL = `${BASE_URL}/api/webpush/topic/`;

class App extends Component {
  constructor(props) {
    super(props);

    // Set initial state
    this.state = {
      sentTokenToServer: false,
      token: null,
      message: null,
      error: null,
      isLoading: false
    };

    const messaging = this.props.messenger.getMessaging();

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging
      .getToken()
      .then(currentToken => {
        if (currentToken) {
          this.setState({ token: currentToken, sentTokenToServer: true });
        } else {
          // Show permission request.
          console.log('No Instance ID token available. Request permission to generate one.');
          this.setState({ sentTokenToServer: false });
        }
      })
      .catch(error => {
        console.error('An error occurred while retrieving token. ', error);
        this.setState({ sentTokenToServer: false, error });
      });

    messaging.onMessage(payload => {
      console.log('Message received in foreground:', payload);
      this.setState({ message: payload.data });
      this.showNotification(
        'Void Fest Reminder',
        `Minimize/hide browser and send again to see native notification. Message payload: ${JSON.stringify(
          payload.data
        )}`
      );
    });

    messaging.onTokenRefresh(() => {
      messaging
        .getToken()
        .then(function(refreshedToken) {
          console.log('Token refreshed.');
          this.setState({ token: refreshedToken });
          this.sendTokenToServer(refreshedToken);
        })
        .catch(error => {
          console.log('Unable to retrieve refreshed token ', error);
          this.setState({ sentTokenToServer: false, error });
        });
    });
  }

  showSuccessMessage = text => {
    message.success(text);
  };

  showErrorMessage = text => {
    message.error(text);
  };

  showNotification = (title, message) => {
    notification.open({
      message: title,
      description: message
    });
  };

  sendTokenToServer = token => {
    const hide = message.loading('Subscribing for push notifications..', 0);
    axios
      .post(`${FCM_SERVER_URL}/voidfest2018/subscribe`, {
        token
      })
      .then(response => {
        this.setState({ sentTokenToServer: true });
        console.log(response);
      })
      .catch(error => {
        this.setState({ sentTokenToServer: false, error });
        console.error(error);
      })
      .finally(() => {
        hide();
      });
  };

  askForPermission = async () => {
    const token = await this.props.messenger.askForPermissionToReceiveNotifications();
    this.setState({ token });
    console.log('Received FCM registration token', token);
    this.sendTokenToServer(token);
  };

  unsubscribeTokenFromServer = async () => {
    const hide = message.loading('Unsubscribing from push notifications..', 0);
    axios
      .post(`${FCM_SERVER_URL}/voidfest2018/unsubscribe`, {
        token: this.state.token
      })
      .then(response => {
        console.log(response);
        this.setState({ token: null, sentTokenToServer: false });
      })
      .catch(error => {
        console.error(error);
        this.setState({ sentTokenToServer: false, error });
      })
      .finally(() => {
        hide();
      });
  };

  triggerTestNotification = async () => {
    const hide = message.loading('Sending test push notification..', 0);
    setTimeout(() => {
      axios
        .post(`${FCM_SERVER_URL}/voidfest2018/send`, {
          data: {
            band: 'Graveyard',
            stage: 'main',
            time: '13:45'
          },
          token: this.state.token
        })
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          hide();
        });
    }, 3000);
  };

  render() {
    return (
      <div>
        <Layout style={{ height: '100vh' }}>
          <Header>
            <h1 style={{ color: 'white' }}>Void Fest 2018 Band Reminder</h1>
          </Header>
          <Content style={{ height: '100vh', margin: '16px 0', padding: '0 50px' }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <Alert
                style={{ marginBottom: 10 }}
                message="This project is still under heavy development. Expect bad design and maybe non working push notification 🤪"
                type="info"
                showIcon
              />
              {this.state.token ? null : <Button onClick={this.askForPermission}>Click to request permission</Button>}
              {this.state.token ? (
                <Fragment>
                  <Button style={{ marginRight: 10 }} onClick={this.triggerTestNotification}>
                    Trigger test notification after 3s
                  </Button>
                  <Button onClick={this.unsubscribeTokenFromServer}>Unsubscribe from notifications</Button>
                </Fragment>
              ) : null}
              {this.state.sentTokenToServer ? (
                <Alert
                  style={{ marginTop: 10 }}
                  message="Successfully registered for push notifications"
                  type="success"
                />
              ) : (
                <Alert
                  style={{ marginTop: 10 }}
                  message="You first need to request permission to be able to receive push notifications"
                  type="warning"
                />
              )}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Created with &hearts; by Mokkapps ©2018 </Footer>
        </Layout>
      </div>
    );
  }
}

export default App;
