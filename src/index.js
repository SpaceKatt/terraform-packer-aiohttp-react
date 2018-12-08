'use strict';

import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import sha256 from "sha256";

const isAlphaNumeric = str => {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

class NameForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      uid: '',
      passhash: '',
      signedIn: false,
      textBox: '',
      count: 10,
      back: 0,
      max_stories: 0,
      posts: []
    };
  }

  handleLogOut = (event) => {
    event.preventDefault();

    this.setState({
      username: '',
      uid: '',
      passhash: '',
      signedIn: false,
      textBox: '',
      count: 10,
      back: 0,
      max_stories: 0,
      posts: []
    });
  }


  signIn = (event) => {
    event.preventDefault();

    if (!isAlphaNumeric(this.state['username'])) {
      alert('Username must be alphanumeric!\nTry again!');
      return false;
    }

    if (this.state['username'].length < 1) {
      alert('Username must not be empty!');
      return false;
    }

    axios.post('/authenticate', {
      'username': this.state['username'],
      'passhash': this.state['passhash']
    })
      .then(resp => {
        this.setState({
          uid: resp.data.uid,
          signedIn: true
        });

        this.handleQuery(event);
      })
      .catch(err => {
        alert('NOT AUTHORIZED! Username or password was wrong');
      });
    return false;
  }

  handleUsernameChange = (event) => {
    event.preventDefault();

    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange = (event) => {
    event.preventDefault();

    this.setState({
      passhash: sha256(event.target.value)
    });
  }

  handleRegister = (event) => {
    event.preventDefault();

    if (!isAlphaNumeric(this.state['username'])) {
      alert('Username must be alphanumeric!\nTry again!');
      return false;
    }

    if (this.state['username'].length < 1) {
      alert('Username must not be empty!');
      return false;
    }

    axios.post('/register', {
      'username': this.state['username'],
      'passhash': this.state['passhash']
    })
      .then(resp => {
        this.setState({
          signedIn: true
        })
        alert('Registration success!');
        this.handleQuery(event);
      })
      .catch(err => {
        alert('Username taken!');
        console.error(err);
      });
  }

  handleStoryPost = (event) => {
    event.preventDefault();

    if (this.state['textBox'].length < 1) {
      alert('Story must not be empty!');
      return false;
    }

    console.log(this.state['textBox']);
    axios.post('/data', {
      'username': this.state['username'],
      'msg': this.state['textBox'],
      'passhash': this.state['passhash']
    })
      .then(resp => {
        this.handleQuery(event);
        this.state['textBox'] = '';

        var textAre = document.getElementById('text_div').getElementsByTagName('textarea')[0]; 
        textAre.value = '';
      })
      .catch(err => {
        alert('Error posting!');
        console.error(err);
      });
  }

  handleTextAreaChange = (event) => {
    event.preventDefault();
    event.target.value = event.target.value.replace('\n', '');
    this.setState({
      textBox: event.target.value
    });
  }

  handleQuery = (event) => {
    event.preventDefault();

    axios.post('/fetch', {
      'username': this.state['username'],
      'passhash': this.state['passhash'],
      'count': 10
    })
      .then(resp => {
        this.setState({
          'posts': resp.data.result
        })
        if (!this.state['posts'] || this.state['posts'].length < 1) {
          alert('No data matches query parameters...');
        }
      })
      .catch(err => {
        alert('Error fetching data');
      });
  }

  handleRefresh = (event) => {
    event.preventDefault();
    handleQuery(event);
  }

  render() {
    return (
      <div className="container">
        <h1>Bürd</h1>
        <h2>The Best Social Media Platform, Ever</h2>
        <h5>Relegating Facebook to the Dust Bins of History, since 2018</h5>
        <hr/>
        
        {
          (this.state.signedIn) ?
          <div>
            <form onSubmit={this.handleLogOut}>
              <input type="submit" value="Log Out" />
            </form>

            <br/>

            <StoryInput
              adid="texy_boxy"
              value=''
              handleChange={this.handleTextAreaChange}
              handleSubmit={this.handleStoryPost}
            />

            <br/>
            <br/>
            <br/>

            <form onSubmit={this.handleQuery}>
              <input type="submit" value="Refresh Stories! Get the latest!" />
            </form>
            <ResultsTable messages={this.state['posts']} />
              
          </div>
          :
          <div>
            <InfoForm 
              header="Enter Information"
              handleUsernameChange={this.handleUsernameChange}
              handlePasswordChange={this.handlePasswordChange}
              message="Login"
              onSignIn={this.signIn}
            />
            <LoginForm 
              header="Registration"
              onSignIn={this.handleRegister}
              message="Register"
            />
          </div>
        }
      </div>
    );
  }
}

const ResultsTable = props => {
  const createTable = () => {
    var table = [];
    var table_contents = [];

    table_contents.push(<tr><th width="150">Username</th><th width="500">Story</th><th>Time Posted</th></tr>);

    var num_msgs = props.messages.length;

    for (var i = num_msgs - 1; i >= 0; i--) {
      var obj = props.messages[i];
      var time_msg = obj.created_on.replace('T', '\n').replace(/\..*$/g, '');
      table_contents.push(<tr><td>{obj.nameuser}</td><td className="wrapword">{obj.msg}</td><td>{time_msg}</td></tr>);
    }

    table.push(<tbody> {table_contents} </tbody>);

    return table;
  }

  return (
    <div>
      <table>
        {createTable()}
      </table>
    </div>
  )
}

class InfoForm extends React.Component {
  render() {
    return (
      <form onSubmit={this.props.onSignIn}>
        <h3>{this.props.message}</h3>
        <input type="text" ref="username" 
               placeholder="Enter you username" onChange={this.props.handleUsernameChange} />
        <input type="password" ref="password"
               placeholder="Enter password" onChange={this.props.handlePasswordChange} />
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
      <div id="text_div">
        <form onSubmit={this.props.handleSubmit}>
          <h3>Tell Your Story!</h3>
            <textarea id={this.props.adid} placeholder="Enter text here and press submit!"
                      onChange={this.props.handleChange} cols={40} rows={4}
                      maxLength="140" >{this.props.value}</textarea>
          <input type="submit" value="Submit" />
        </form>
      </div>
    )
  }
}

const e = React.createElement;

const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
