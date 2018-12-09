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

    this.setState({
      textBox: this.state['textBox'].trim()
    });

    if (this.state['textBox'].trim().length < 1) {
      alert('Story must not be empty!');
      return false;
    }

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
      'count': this.state['count'],
      'back': this.state['back']
    })
      .then(resp => {
        this.setState({
          'posts': resp.data.result,
          'max_stories': resp.data.max_post
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

  handleCountChange = event => {
    event.preventDefault();

    this.setState({
      count: event.target.value,
      back: (() => {
        var new_back = parseInt(event.target.value) + parseInt(this.state['back'])
           > this.state['max_stories'] ?
             parseInt(this.state['max_stories']) - parseInt(event.target.value)
           :
             this.state['back'];

        return parseInt(new_back) > 0 ? new_back : 0;
      })()
    }, () => {
      this.handleQuery(event);
    });
  }

  handleGetOlder = event => {
    event.preventDefault();
    
    var new_back = parseInt(this.state['back']) + parseInt(this.state['count']);

    if (parseInt(new_back) + parseInt(this.state['count']) > parseInt(this.state['max_stories'])) {
      new_back = parseInt(this.state['max_stories']) - parseInt(this.state['count']);
      new_back = parseInt(new_back) < 0 ? 0 : new_back;
    }

    this.setState({
      back: new_back
    }, () => {
      this.handleQuery(event);
    });
  }

  handleGetNewer = event => {
    event.preventDefault();
    
    var new_back = parseInt(this.state['back']) - parseInt(this.state['count']);

    if (new_back < 0) {
      new_back = 0;
    }

    this.setState({
      back: new_back
    }, () => {
      this.handleQuery(event);
    });
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

            <hr/>

            <StoryInput
              adid="texy_boxy"
              handleChange={this.handleTextAreaChange}
              handleSubmit={this.handleStoryPost}
            />

            <hr/>

            <h2>View Your Friends&#39; Stories!</h2>
            <form onSubmit={this.handleQuery}>
              <input type="submit" value="Refresh Stories! Get the latest!" />
            </form>

            <NavigationPane
              handleCountChange={this.handleCountChange}
              handleOld={this.handleGetOlder}
              handleNew={this.handleGetNewer}
              county={this.state['count']}
              max_posts={this.state['max_stories']}
              back={this.state['back']}
            />

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

    table.push(<tbody>{table_contents}</tbody>);

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

const NavigationPane = props => {
  return (
    <div>
      <div className="inline">
        <label htmlFor="numPosts"># Posts Displayed: </label>
        <select id="numPosts" onChange={props.handleCountChange}>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="250">250</option>
        </select>
      </div>

      <div className="inline">
        <form onSubmit={props.handleOld}>
          <input type="submit" value={`Get older ${props.county}`} />
        </form>
      </div>

      <div className="inline">
        <form onSubmit={props.handleNew}>
          <input type="submit" value={`Get newer ${props.county}`} />
        </form>
      </div>

      <div className="inline">
        <i>{`Displaying ${props.max_posts - props.back - 1}-${props.max_posts - props.back - props.county > 0 ? props.max_posts - props.back - props.county : 1} out of ${props.max_posts - 1}`}</i>
      </div>
    </div>
  )
}

const LoginForm = props => {
  return (
    <form onSubmit={props.onSignIn}>
      <h3>{props.header}</h3>
      <input type="submit" value={props.message} />
    </form>
  )
}

const StoryInput = props => {
  return (
    <div id="text_div" className="storyIn">
      <form onSubmit={props.handleSubmit}>
        <h2>Tell Your Story!</h2>
          <textarea id={props.adid} placeholder="Enter text here and press submit!"
                    onChange={props.handleChange} cols={40} rows={4}
                    maxLength="140" className="storyArea"></textarea>
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

const e = React.createElement;

const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
