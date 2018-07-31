import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    const messaging = this.props.push.getMessaging();

    messaging.onMessage((payload) => {
      console.log('Message received. ', payload);
    });

    messaging.onTokenRefresh(() => {
      messaging.getToken().then(function(refreshedToken) {
        console.log('Token refreshed.');
      }).catch((err) => {
        console.log('Unable to retrieve refreshed token ', err);
      });
    });
  }

  askForPermission = async () => {
    const token = await this.props.push.askForPermissionToReceiveNotifications();
    this.setState({token});
    console.log('Got messaging token', token);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <button onClick={this.askForPermission}>
          Click to request permission
        </button>
        {(this.state && this.state.token) ? <p className="App-intro">Token: {this.state.token}</p> : null}
      </div>
    );
  }
}

export default App;
