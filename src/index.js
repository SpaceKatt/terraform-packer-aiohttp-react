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
      testBox: '',
      posts: []
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);

    this.handleQuery = this.handleQuery.bind(this);
    this.signIn = this.signIn.bind(this);

    this.handleRegister = this.handleRegister.bind(this);

    this.handleStoryPost = this.handleStoryPost.bind(this);
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
  }

  signIn(event) {
    event.preventDefault();

    axios.post('/authenticate', {
      'username': this.state['username'],
      'passhash': this.state['passhash']
    })
      .then(resp => {
        this.setState({
          uid: resp.data.uid,
          signedIn: true
        })
        alert('Signin success!');
        axios.post('/fetch', {
          'username': this.state['username'],
          'passhash': this.state['passhash'],
          'count': 10
        })
          .then(resp => {
            this.setState({
              'result': resp.result
            });
            console.log(resp.data.result);
          })
      })
      .catch(err => {
        alert('NOT AUTHORIZED! Username or password was wrong');
      });
    return false;
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
        this.setState({
          signedIn: true
        })
        alert('Registration success!');
      })
      .catch(err => {
        alert('Username taken!');
        console.error(err);
      });
  }

  handleStoryPost(event) {
    event.preventDefault();
    console.log('posting story');
  }

  handleTextAreaChange(event) {
    event.preventDefault();
    event.target.value = event.target.value.replace('\n', '');
    this.setState({
      textBox: event.target.value
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
          <div>
            <StoryInput
              adid="texy_boxy"
              value={this.state['textBox']}
              handleChange={this.handleTextAreaChange.bind(this)}
              handleSubmit={this.handleStoryPost.bind(this)}
            />
          </div>
          :
          <div>
            <InfoForm 
              header="Enter Information"
              handleUsernameChange={this.handleUsernameChange.bind(this)}
              handlePasswordChange={this.handlePasswordChange.bind(this)}
              message="Login"
              onSignIn={this.signIn.bind(this)}
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
      <form onSubmit={this.props.onSignIn}>
        <h3>{this.props.message}</h3>
        <input type="text" ref="username" 
               placeholder="enter you username" onChange={this.props.handleUsernameChange} />
        <input type="password" ref="password"
               placeholder="enter password" onChange={this.props.handlePasswordChange} />
        <input type="submit" value={this.props.message} />
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

class StoryInput extends React.Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <h3>Tell Your Story!</h3>
          <textarea id={this.props.adid} placeholder={this.props.value} onChange={this.props.handleChange} cols={40} rows={4} maxLength="140" ></textarea>
        <input type="submit" value="Submit" />
      </form>
    )
  }
}

const e = React.createElement;

const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
