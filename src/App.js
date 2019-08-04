import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import Amplify, { Auth, Storage } from 'aws-amplify';
import React from 'react';
import {
    // Card,
    Button,
    Popover,
    Icon,
  } from 'antd';

// import logo from './logo.svg';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import './App.css';

import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

Storage.configure({ level: 'private' });

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploadList: {},
      visible: false,
      credentials: {}
    }
  }

  componentDidMount(){
    Auth.currentCredentials()
    .then(credentials => {
      this.setState({credentials: credentials});
    })    
  }

  startupLoad = (e) => {
    this.setState({uploadAllowed: false});
    let files = this.state.files;
    for (var i = 0; i < files.length; i++) {
      let file = files[i];
      this.setState(prevState => {
        return({
          uploadList: {
            ...prevState.uploadList,
            [file.name]: "started"
          }
        });
      });
      Storage.put(file.name, file, {
        level: 'private'
      }).then (result => {
        // console.log(result);
        this.setState(prevState => {
          return({
            uploadList: {
              ...prevState.uploadList,
              [file.name]: "completed"
            }
          });
        });
        }).catch(err => {
        console.log(err);
        this.setState(prevState => {
          return({
            uploadList: {
              ...prevState.uploadList,
              [file.name]: "failed"
            }
          });
        });
      });
    }
  }

  updateList = (e) => {
    if (e.target.files.length > 0){
      let files = e.target.files;
      // const reducer = (accumulator, currentValue) => {
      //   return({
      //     ...accumulator,
      //     [currentValue.name] : "not started"
      //   });
      // }
      this.setState(prevState => {
        return({
          files: [
            ...prevState.files,
            ...files
          ],
          // uploadList: files.reduce(reducer, prevState.uploadList),
          uploadAllowed: true
        });        
      });
      for (var i = 0; i < files.length; i++) {
        let file = files[i];
        this.setState(prevState => {
          return({
            uploadList: {
              ...prevState.uploadList,
              [file.name]: "not started"
            }
          });
        });
      }
    }
  }

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  handleVisibleChange = popover => {
    this.setState({ 
      visible: true
    });
  };

  copyToClipboard = (val) => {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = val;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  }

  // <input style={{margin:10}} type="file" multiple onChange={this.updateList}></input>

  render(){
    const tablestyle = {border: "1px solid #dddddd", borderCollapse: "collapse", margin: "auto", padding: "10px"}
    const inputstyle = {position: "relative", left: "-50%", width:120, height:50, opacity: 0};
    return (
      <div className="App">
        <div style={{ position: "absolute", right: 16 }}>
          <Popover
            content={<div>
                      <p>Access Key: <Icon type="copy" onClick={() => this.copyToClipboard(this.state.credentials.accessKeyId) } /></p>
                      <p>Secret Access Key: <Icon type="copy" onClick={() => this.copyToClipboard(this.state.credentials.secretAccessKey) } /></p>
                      <p>Session Token: <Icon type="copy" onClick={() => this.copyToClipboard(this.state.credentials.sessionToken) }/></p>
                      <Button onClick={this.hide}>Close</Button>
                    </div>}
            trigger="click"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
          >
            <Button style={{margin:10}} type="primary">Show CLI/SDK Credentials</Button>
          </Popover>
        </div>
        <div style={{display: "inline-block"}}>
          <Button>Choose file(s)</Button>
          <input type="file" multiple onChange={this.updateList} style={inputstyle}/>
        </div>
        <Button style={{margin:10}} disabled={!this.state.uploadAllowed} onClick={this.startupLoad} type="primary">Upload</Button>
        <table hidden={Object.keys(this.state.uploadList).length <= 0} style={tablestyle}>
          <tbody>
            <tr style={tablestyle}>
              <th style={tablestyle}>File name</th>
              <th style={tablestyle}>Status</th>
            </tr>
            {
              Object.keys(this.state.uploadList).map((key) => {
                return <tr style={tablestyle}><td style={tablestyle}>{key}</td><td style={tablestyle}>{this.state.uploadList[key]}</td></tr>
              })
            }
          </tbody>
        </table> 
      </div>
    );  
  }
}

export default withAuthenticator(App, true);
