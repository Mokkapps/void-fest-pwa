import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    const messaging = this.props.messenger.getMessaging();

    messaging.onMessage(payload => {
      console.log('Message received in foreground:', payload);
      this.setState({ message: payload.data });
    });

    messaging.onTokenRefresh(() => {
      messaging
        .getToken()
        .then(function(refreshedToken) {
          console.log('Token refreshed.');
          this.setState({ token: refreshedToken });
        })
        .catch(err => {
          console.log('Unable to retrieve refreshed token ', err);
        });
    });
  }

  askForPermission = async () => {
    const token = await this.props.messenger.askForPermissionToReceiveNotifications();
    this.setState({ token });
    console.log('Received FCM registration token', token);
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <button onClick={this.askForPermission}>Click to request permission</button>
        {this.state && this.state.token ? <p className="App-intro">Token: {this.state.token}</p> : null}
        {this.state && this.state.message ? (
          <p className="App-intro">Received push notification: {JSON.stringify(this.state.message)}</p>
        ) : null}
      </div>
    );
  }
}

export default App;
