import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import sha256 from "sha256";


class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      uid: '',
      passhash: '',
      signedIn: false,
      posts: []
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);

    this.handleQuery = this.handleQuery.bind(this);
    this.signIn = this.signIn.bind(this);

    this.handleRegister = this.handleRegister.bind(this);
  }

  signIn(event) {
    event.preventDefault();

    // This is where you would call Firebase, an API etc...
    // calling setState will re-render the entire app (efficiently!)
    alert(this.state['username'] + this.state['passhash']);
    axios.post('/authenticate', {
      'username': this.state['username'],
      'passhash': this.state['passhash']
    })
      .then(resp => {
        this.setState({
          uid: resp.data.uid,
          signedIn: true
        })
        alert('Query success!');
      })
      .catch(err => {
        alert('Query has no results! Remember, you need an EXACT match!');
      });
  }

  handleUsernameChange(event) {
    event.preventDefault();

    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange(event) {
    event.preventDefault();

    this.setState({
      passhash: sha256(event.target.value)
    });
  }

  handleRegister(event) {
    event.preventDefault();

    console.log('registering');
    // This is where you would call Firebase, an API etc...
    // calling setState will re-render the entire app (efficiently!)
    axios.post('/register', {
      'username': this.state['username'],
      'passhash': this.state['passhash']
    })
      .then(resp => {
        alert('Registration success!');
      })
      .catch(err => {
        alert(err);
      });
  }

  handleQuery(event) {
    event.preventDefault();

    this.setState({
      'queryResults': {}
    });

    if (this.state.firstName == '' && this.state.lastName == '') {
      alert('Please specify either a first name or last name!');
      return;
    }

    axios.post('/data', {
      'username': this.state.username,
      'passhash': this.state.passhash,
      'count': 10
    })
      .then(resp => {
        this.setState({
          posts: resp.data.results
        })
        alert('Query success!');
      })
      .catch(err => {
        alert('Query has no results! Remember, you need an EXACT match!');
      });
  }

  render() {
    return (
      <div className="container">
        {
          (this.state.signedIn) ?
            <p>reeeee</p>
          :
          <div>
            <InfoForm 
              message="Enter Infffffformation"
              handleUsernameChange={this.handleUsernameChange.bind(this)}
              handlePasswordChange={this.handlePasswordChange.bind(this)}
            />
            <LoginForm 
              header="Sign In"
              onSignIn={this.signIn.bind(this)}
              message="login"
            />
            <LoginForm 
              header="Registration"
              onSignIn={this.handleRegister.bind(this)}
              message="register"
            />
          </div>
        }
      </div>
    );
  }
}

class InfoForm extends React.Component {
  render() {
    return (
      <form>
        <h3>{this.props.message}</h3>
        <input type="text" ref="username" placeholder="enter you username" onChange={this.props.handleUsernameChange} />
        <input type="password" ref="password" placeholder="enter password" onChange={this.props.handlePasswordChange} />
      </form>
    )
  }
}

class LoginForm extends React.Component {
  render() {
    return (
      <form onSubmit={this.props.onSignIn}>
        <h3>{this.props.header}</h3>
        <input type="submit" value={this.props.message} />
      </form>
    )
  }
}

const e = React.createElement;

const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
