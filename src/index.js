import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const ResultsRow = props => {
  const createRow = () => {
    var row = [];

    for (var i = 0; i < props.attributes.length; i++) {
      console.log(props.attributes[i]);
      if (props.results[props.attributes[i]]) {
        row.push(<td>{props.results[props.attributes[i]]}</td>);
      } else {
        row.push(<td>N/A</td>);
      }
    }

    return row;
  };

  return (
    <tr>
      {createRow()}
    </tr>
  );
}

const ResultsTable = props => {
  const createTable = () => {

    var table = [];
    var attributes = [];
    var attribute_names = ['id', 'lastName', 'firstName'];
    var items = [];

    for (var i = 0; i < props.results.length; i++) {
      var item = props.results[i];
      var attr_list = Object.keys(item);

      for (var j = 0; j < attr_list.length; j++) {
        var attr_name = attr_list[j];
        var attr = item[attr_name];

        if (!attribute_names.includes(attr_name)) {
          attribute_names.push(attr_name);
        }
      }
    }

    for (var i = 0; i < attribute_names.length; i++) {
      attributes.push(<th>{attribute_names[i]}</th>);
    }

    table.push(<thead><tr>{attributes}</tr></thead>);

    for (var i = 0; i < props.results.length; i++) {
      items.push(<ResultsRow attributes={attribute_names}
                             results={props.results[i]}/>);
    }

    table.push(<tbody>{items}</tbody>);

    return table;
  }

  if (!props.results || Object.getOwnPropertyNames(props.results).length < 1) {
    return null;
  }

  return (
    <table>
        {createTable()}
    </table>
  );
}

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      queryResults: {}
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
    this.setState({
      'queryResults': {}
    });

    event.preventDefault();
    if (this.state.firstName == '' && this.state.lastName == '') {
      alert('Please specify either a first name or last name!');
      return;
    }

    axios.post('/query', {
      'firstName': this.state.firstName,
      'lastName': this.state.lastName
    })
      .then(resp => {
        this.setState({
          queryResults: resp.data.Items
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
        
        <ResultsTable results={this.state.queryResults} />
      </div>
    );
  }
}

const e = React.createElement;

const domContainer = document.querySelector('#input_container');
ReactDOM.render(e(NameForm), domContainer);
