class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: ''
    };

    this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
    this.handleLastNameChange = this.handleLastNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLoadData = this.handleLoadData.bind(this);
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
    alert('Loading data');
    event.preventDefault();
  }

  handleClearData(event) {
    alert('Clearing data');
    event.preventDefault();
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.firstName + ' ' + this.state.lastName);
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

        <form onSubmit={this.handleSubmit}>
          <label>
            First Name:
            <input type="text" value={this.state.firstName} onChange={this.handleFirstNameChange} />
          </label>
          <label>
            last Name:
            <input type="text" value={this.state.lastName} onChange={this.handleLastNameChange} />
          </label>
           <input type="submit" value="Query" />
        </form>
      </div>
    );
  }
}

//ReactDOM.render(<NameForm />, document.getElementById("input_container"))
const e = React.createElement;
const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
