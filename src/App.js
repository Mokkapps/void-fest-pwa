import React, { Component, Fragment } from 'react';
import { Alert, Button, Checkbox, Layout, notification, message } from 'antd';

import axios from 'axios';
import './App.css';
import lineup from './lineup-2018.json';

const CheckboxGroup = Checkbox.Group;
const { Header, Footer, Content } = Layout;

const BAND_SELECTION_LS_KEY = 'VOID_FEST_BAND_SELECTION';
const BASE_URL = 'https://void-fest-pwa.herokuapp.com';
const FCM_SERVER_URL = `${BASE_URL}/api/webpush/topic/`;

class App extends Component {
  constructor(props) {
    super(props);

    // FIXME extract this arr/obj methods
    this.defaultLineupValues = {};

    const addValueToEvent = (lineupDay, valuePrefix) => {
      for (const stage in lineupDay) {
        let count = 0;
        for (const event of lineupDay[stage]) {
          const value = `${valuePrefix}_${stage}_${count}`;
          this.defaultLineupValues[value] = false;
          event.value = value;
          count++;
        }
      }
    };

    for (const day in lineup) {
      switch (day) {
        case 'FRIDAY':
          addValueToEvent(lineup.FRIDAY, 'FR');
          break;
        case 'SATURDAY':
          addValueToEvent(lineup.SATURDAY, 'SA');
          break;
        default:
          break;
      }
    }

    const storedBandSelection = localStorage.getItem(BAND_SELECTION_LS_KEY);

    // Set initial state
    this.state = {
      sentTokenToServer: false,
      token: null,
      message: null,
      error: null,
      isLoading: false,
      bandSelectionValues: storedBandSelection ? JSON.parse(storedBandSelection) : this.defaultLineupValues
    };

    // FIXME: Remove
    console.log('LINEUP VALUES', this.defaultLineupValues);
    console.log('LINEUP', lineup);
    console.log('STATE', this.state);

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
        this.showErrorMessage('Error while getting token', error);
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
      .post(`${FCM_SERVER_URL}/voidfest2018/subscribe`, {
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
        this.showErrorMessage('Error while unsubscribing from push notifications', error);
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
          this.showErrorMessage('Error while sending test push notifications', error);
        })
        .finally(() => {
          hide();
        });
    }, 3000);
  };

  getCheckboxDefaultValues = eventArr => {
    const bandSelectionValues = { ...this.state.bandSelectionValues };
    return eventArr.map(event => event.value).filter(value => bandSelectionValues[value]);
  };

  getCheckboxOptions = eventArr => {
    return eventArr.map(event => {
      return {
        label: `${event.time} ${event.band}`,
        value: event.value
      };
    });
  };

  updateBandSelectionValues = (checkedValues, cbGroupName) => {
    let bandSelectionValues = { ...this.state.bandSelectionValues };

    if (checkedValues.length === 0) {
      const filteredKeys = Object.keys(bandSelectionValues).filter(key => key.includes(cbGroupName));
      for (const key of filteredKeys) {
        bandSelectionValues[key] = false;
      }
    } else {
      for (const value of checkedValues) {
        bandSelectionValues[value] = true;
      }
    }

    this.setState({ bandSelectionValues });
    localStorage.setItem(BAND_SELECTION_LS_KEY, JSON.stringify(bandSelectionValues));
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
              <div>
                <h1 style={{ marginBottom: 10 }}>FRIDAY</h1>
                <h2 style={{ marginBottom: 10 }}>MAIN STAGE</h2>
                <CheckboxGroup
                  style={{ marginBottom: 10 }}
                  options={this.getCheckboxOptions(lineup.FRIDAY.MAIN_STAGE)}
                  defaultValue={this.getCheckboxDefaultValues(lineup.FRIDAY.MAIN_STAGE)}
                  onChange={event => {
                    this.updateBandSelectionValues(event, 'FR_MAIN_STAGE');
                  }}
                />
                <h2 style={{ marginBottom: 10 }}>TENT STAGE</h2>
                <CheckboxGroup
                  style={{ marginBottom: 10 }}
                  options={this.getCheckboxOptions(lineup.FRIDAY.TENT_STAGE)}
                  defaultValue={this.getCheckboxDefaultValues(lineup.FRIDAY.TENT_STAGE)}
                  onChange={event => {
                    this.updateBandSelectionValues(event, 'FR_TENT_STAGE');
                  }}
                />
              </div>
              <div>
                <h1 style={{ marginBottom: 10 }}>SATURDAY</h1>
                <h2 style={{ marginBottom: 10 }}>MAIN STAGE</h2>
                <CheckboxGroup
                  style={{ marginBottom: 10 }}
                  options={this.getCheckboxOptions(lineup.SATURDAY.MAIN_STAGE)}
                  defaultValue={this.getCheckboxDefaultValues(lineup.SATURDAY.MAIN_STAGE)}
                  onChange={event => {
                    this.updateBandSelectionValues(event, 'SA_MAIN_STAGE');
                  }}
                />
                <h2 style={{ marginBottom: 10 }}>TENT STAGE</h2>
                <CheckboxGroup
                  style={{ marginBottom: 10 }}
                  options={this.getCheckboxOptions(lineup.SATURDAY.TENT_STAGE)}
                  defaultValue={this.getCheckboxDefaultValues(lineup.SATURDAY.TENT_STAGE)}
                  onChange={event => {
                    this.updateBandSelectionValues(event, 'SA_TENT_STAGE');
                  }}
                />
              </div>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Created with &hearts; by Mokkapps ©2018 </Footer>
        </Layout>
      </div>
    );
  }
}

export default App;
