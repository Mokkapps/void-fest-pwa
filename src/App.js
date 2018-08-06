import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Alert, Button, Divider, Layout, notification, message } from 'antd';
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

const ContentBody = styled.div`
  background: #fff;
  padding: 24px;
  min-height: 280px;
`;

class App extends Component {
  constructor(props) {
    super(props);

    // Set initial state
    this.state = {
      token: null,
      editMode: false
    };

    let { messenger } = this.props;
    messenger = messenger.getMessaging();

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messenger
      .getToken()
      .then(token => {
        this.setState({ token: token || null });
      })
      .catch(error => {
        this.showErrorMessage('Error while getting token', error);
      });

    messenger.onMessage(payload => {
      console.log('Message received in foreground:', payload);
      this.showNotification(
        'Band Reminder',
        `Band "${payload.data.band}" is playing at ${payload.data.time} on ${payload.data.stage} stage`
      );
    });

    messenger.onTokenRefresh(() => {
      messenger
        .getToken()
        .then(refreshedToken => {
          console.log('Token refreshed.');
          this.setState({ token: refreshedToken });
        })
        .catch(error => {
          this.showErrorMessage('Error while refreshing token', error);
        });
    });
  }

  onSave = () => {
    const bandSelection = localStorage.getItem(BAND_SELECTION_LS_KEY);

    if (bandSelection) {
      const bandSelObj = JSON.parse(bandSelection);
      const selectedBands = [];
      const unselectedBands = [];
      const { token } = this.state;

      for (const sel in bandSelObj) {
        if (bandSelObj[sel]) {
          selectedBands.push(sel);
        } else {
          unselectedBands.push(sel);
        }
      }

      const selectedPromises = selectedBands.map(sel =>
        axios.post(`${FCM_SERVER_URL}${FCM_TOPIC}-${sel}/subscribe`, { token })
      );
      const unselectedPromises = unselectedBands.map(sel =>
        axios.post(`${FCM_SERVER_URL}${FCM_TOPIC}-${sel}/unsubscribe`, { token })
      );

      const hide = message.loading('Subscribing for push notifications..', 0);
      Promise.all(selectedPromises, unselectedPromises)
        .then(response => {
          console.log('Successfully updated push notifications', response);
          this.showSuccessMessage('Successfully updated push notifications');
        })
        .catch(error => {
          this.showErrorMessage('Error while subscribing push notifications', error);
        })
        .finally(() => {
          hide();
        });
    } else {
      this.showErrorMessage('Cannot save because band selection cannot be read');
    }
  };

  toggleEditMode = () => {
    const { editMode } = this.state;
    this.setState({ editMode: !editMode });
  };

  askForPermission = async () => {
    const { messenger } = this.props;
    const token = await messenger.askForPermissionToReceiveNotifications();
    console.log('Received FCM registration token', token);
    this.setState({ token });
  };

  showSuccessMessage = text => {
    message.success(text);
  };

  showErrorMessage = (text, error) => {
    console.error(text, error);
    message.error(text);
  };

  showNotification = (title, description) => {
    notification.open({
      message: title,
      description
    });
  };

  render() {
    const { editMode, token } = this.state;
    const infoText = `
    This web application can be used to subscribe for push notifications which will inform 30 minutes before a band will play on Void Fest 2018.\r\n
    You first need to request permission to receive any push notification from this website. 
    Afterwards you see the lineup of this year's festival and you can edit for which band you would like to receive a notification.
    `;
    return (
      <div>
        <Layout style={{ height: '100vh' }}>
          <LayoutHeader />
          <Content style={{ height: '100vh', margin: '16px 0', padding: '0 50px' }}>
            <ContentBody>
              <Alert
                style={{ marginBottom: '20px' }}
                message="Informational Notes"
                description={infoText}
                type="info"
                showIcon
              />
              <Alert style={{ marginBottom: '20px' }} message="This is a non-official Void Fest app and a hobby project of mine. Therefore I cannot guarantee for the correct lineup or faulty notifications in general." type="warning" showIcon />
              {token ? null : (
                <Button size="large" type="primary" onClick={this.askForPermission}>
                  Click to request permission for push notifications
                </Button>
              )}
              {token ? (
                <Fragment>
                  <Button size="large" type="primary" onClick={this.toggleEditMode}>
                    Edit notification
                  </Button>
                  {editMode ? (
                    <Button size="large" onClick={this.onSave}>
                      Save your selection
                    </Button>
                  ) : null}
                </Fragment>
              ) : null}
              <Divider />
              {token ? (
                <BandSelection editMode={editMode} />
              ) : (
                <Alert
                  style={{ marginTop: 10 }}
                  message="You first need to request permission to be able to receive push notifications"
                  type="warning"
                />
              )}
            </ContentBody>
          </Content>
          <LayoutFooter />
        </Layout>
      </div>
    );
  }
}

App.propTypes = {
  messenger: PropTypes.func
};

export default App;
