import React, { Component, Fragment } from 'react';
import { Alert, Button, Layout, notification, message } from 'antd';
import axios from 'axios';

import './App.css';
import LayoutHeader from './LayoutHeader';
import LayoutFooter from './LayoutFooter';
import BandSelection from './BandSelection';

const { Content } = Layout;

const BAND_SELECTION_LS_KEY = 'VOID_FEST_BAND_SELECTION';
const BASE_URL = 'https://void-fest-pwa.herokuapp.com';
const FCM_SERVER_URL = `${BASE_URL}/api/webpush/topic/`;
const FCM_TOPIC = 'voidfest2018';

class App extends Component {
  constructor(props) {
    super(props);

    // Set initial state
    this.state = {
      sentTokenToServer: false,
      token: null,
      editMode: false,
      message: null,
      error: null,
      isLoading: false
    };

    let { messenger } = this.props;
    messenger = messenger.getMessaging();

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messenger
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
        this.showErrorMessage('Error while getting token', error);
      });

    messenger.onMessage(payload => {
      console.log('Message received in foreground:', payload);
      this.setState({ message: payload.data });
      this.showNotification(
        'Void Fest Reminder',
        `Minimize/hide browser and send again to see native notification. Message payload: ${JSON.stringify(
          payload.data
        )}`
      );
    });

    messenger.onTokenRefresh(() => {
      messenger
        .getToken()
        .then(refreshedToken => {
          console.log('Token refreshed.');
          this.setState({ token: refreshedToken });
          this.sendTokenToServer(refreshedToken);
        })
        .catch(error => {
          this.showErrorMessage('Error while refreshing token', error);
        });
    });
  }

  showSuccessMessage = text => {
    message.success(text);
  };

  showErrorMessage = (text, error) => {
    console.error(text, error);
    this.setState({ sentTokenToServer: false, error: `${text}: ${JSON.stringify(error)}` });
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
      .post(`${FCM_SERVER_URL}/${FCM_TOPIC}/subscribe`, {
        token
      })
      .then(response => {
        this.setState({ sentTokenToServer: true });
        console.log(response);
      })
      .catch(error => {
        this.showErrorMessage('Error while subscribing push notifications', error);
      })
      .finally(() => {
        hide();
      });
  };

  askForPermission = async () => {
    const { messenger } = this.props;
    const token = await messenger.askForPermissionToReceiveNotifications();
    this.setState({ token });
    console.log('Received FCM registration token', token);
    this.sendTokenToServer(token);
  };

  unsubscribeTokenFromServer = async () => {
    const { token } = this.state;
    const hide = message.loading('Unsubscribing from push notifications..', 0);
    axios
      .post(`${FCM_SERVER_URL}/${FCM_TOPIC}/unsubscribe`, {
        token
      })
      .then(response => {
        console.log(response);
        this.setState({ token: null, sentTokenToServer: false });
      })
      .catch(error => {
        this.showErrorMessage('Error while unsubscribing from push notifications', error);
      })
      .finally(() => {
        hide();
      });
  };

  toggleEditMode = () => {
    const { editMode } = this.state;
    this.setState({ editMode: !editMode });
  };

  onSave = () => {
    const bandSelection = localStorage.getItem(BAND_SELECTION_LS_KEY);
    if (bandSelection) {
      const bandSelObj = JSON.parse(bandSelection);
      const selectionArr = [];
      for (const sel in bandSelObj) {
        if (bandSelObj[sel]) {
          selectionArr.push(sel);
        }
      }
      const { token } = this.state;
      const selectionPromises = selectionArr.map(sel =>
        axios.post(`${FCM_SERVER_URL}${FCM_TOPIC}-${sel}/subscribe`, {
          token
        })
      );

      const hide = message.loading('Subscribing for push notifications..', 0);
      Promise.all(selectionPromises)
        .then(response => {
          this.setState({ sentTokenToServer: true });
          console.log(response);
        })
        .catch(error => {
          this.showErrorMessage('Error while subscribing push notifications', error);
        })
        .finally(() => {
          hide();
        });
    }
  };

  render() {
    const { editMode, token, sentTokenToServer } = this.state;
    return (
      <div>
        <Layout style={{ height: '100vh' }}>
          <LayoutHeader />
          <Content style={{ height: '100vh', margin: '16px 0', padding: '0 50px' }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <Alert
                style={{ marginBottom: 10 }}
                message="This project is still under heavy development. Expect bad design and maybe non working push notification 🤪"
                type="info"
                showIcon
              />
              {token ? null : <Button onClick={this.askForPermission}>Click to request permission</Button>}
              {token ? (
                <Fragment>
                  <Button onClick={this.toggleEditMode}>Edit</Button>
                  {editMode ? <Button onClick={this.onSave}>Save</Button> : null}
                  {/* <Button onClick={this.unsubscribeTokenFromServer}>Unsubscribe from notifications</Button> */}
                </Fragment>
              ) : null}
              {sentTokenToServer ? (
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
              <BandSelection editMode={editMode} />
            </div>
          </Content>
          <LayoutFooter />
        </Layout>
      </div>
    );
  }
}

export default App;
