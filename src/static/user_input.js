class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: ''
    };

    this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
    this.handleLastNameChange = this.handleLastNameChange.bind(this);
    this.handleQuery = this.handleQuery.bind(this);
    this.handleLoadData = this.handleLoadData.bind(this);
    this.handleClearData = this.handleClearData.bind(this);
  }

  handleFirstNameChange(event) {
    this.setState({
      firstName: event.target.value
    });
  }

  handleLastNameChange(event) {
    this.setState({
      lastName: event.target.value
    });
  }

  handleLoadData(event) {
    axios.post('/data')
      .then(() => {
        alert('Data loaded!');
      })
      .catch(err => {
        alert('Error loading data!');
        console.error(err);
      });
    event.preventDefault();
  }

  handleClearData(event) {
    axios.delete('/data')
      .then(() => {
        alert('Data cleared!');
      });
    event.preventDefault();
  }

  handleQuery(event) {
    axios.post('/query', {
      'firstName': this.state.firstName,
      'lastName': this.state.lastName
    })
      .then(resp => {
        alert(resp);
      })
      .catch(err => {
        alert('Error loading data!');
        console.error(err);
      });
    event.preventDefault();
  }

  render() {
    return (
      <div className="container">
        <form onSubmit={this.handleLoadData}>
          <input type="submit" value="Load Data"/>
        </form>

        <form onSubmit={this.handleClearData}>
          <input type="submit" value="Clear Data"/>
        </form>

        <form onSubmit={this.handleQuery}>
          <label>
            First Name:
            <input type="text" value={this.state.firstName} onChange={this.handleFirstNameChange} />
          </label>
          <label>
            Last Name:
            <input type="text" value={this.state.lastName} onChange={this.handleLastNameChange} />
          </label>
           <input type="submit" value="Query" />
        </form>
      </div>
    );
  }
}

const e = React.createElement;

const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
