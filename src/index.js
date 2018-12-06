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
              'posts': resp.data.result
            });
            console.log(resp.data.result);
            //this.setState(this.state);
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
        if (this.state['posts'] && this.state['posts'].length > 0) {
          alert('Displaying fetched data!');
        } else {
          alert('No data matches query parameters...');
        }
      })
      .catch(err => {
        alert('Error fetching data');
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
              <ResultsTable messages={this.state['posts']} />
              
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

const ResultsTable = props => {
  const createTable = () => {
    var table = [];
    var table_contents = [];

    table_contents.push(<tr><th width="150" >Username</th><th width="500" >Story</th></tr>);

    for (var message in props.messages) {
      var obj = props.messages[message];
      table_contents.push(<tr><td>{obj.nameuser}</td><td>{obj.msg}</td></tr>);
    }

    table.push(<tbody> {table_contents} </tbody>)

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
