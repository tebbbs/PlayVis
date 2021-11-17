import React, { Component } from 'react';
import { CSVReader } from 'react-papaparse';
import Graph from './Backend.js';
import Spotify from './Spotify.js';
import './skeleton.css';

// Import the functions you need from the SDKs you need

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: "AIzaSyCu-NQGPK9uPbhdLhodpEDfShgCaEFIo6A",
//   authDomain: "playvis.firebaseapp.com",
//   projectId: "playvis",
//   storageBucket: "playvis.appspot.com",
//   messagingSenderId: "129615699475",
//   appId: "1:129615699475:web:f98fae195b6106bcec69e6",
//   measurementId: "G-NB8C4XW1EQ"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const buttonRef = React.createRef();

export default class App extends Component {

  constructor(props) {
    super(props);
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  onFileUpload(file) {
    this.setState({ data: file });
  }

  render() {
    return (
      <>
        <h1 style={{ textAlign: 'center' }}>playvis</h1>
        <h6 style={{ textAlign: 'center' }}>Upload a .csv file with playlist data or continue with Spotify</h6>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Spotify/>
        </div>
        <CSVReader1 onFileUpload={this.onFileUpload} />
        {this.state && <Graph data={this.state.data} />}
      </>
    );
  }
}

class CSVReader1 extends Component {

  handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.open(e);
    }
  };

  handleOnFileLoad = (data) => {
    this.props.onFileUpload(data);
  };

  handleOnError = (err, file, inputElem, reason) => {
    console.log('---------------------------');
    console.log(err);
    console.log('---------------------------');
  };

  handleOnRemoveFile = (data) => {
    console.log('---------------------------');
    console.log(data);
    console.log('---------------------------');
  };

  handleRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.removeFile(e);
    }
  };

  render() {
    return (
      <>
        <CSVReader
          ref={buttonRef}
          onFileLoad={this.handleOnFileLoad}
          onError={this.handleOnError}
          parserOptions={{ header: true }} // doesn't seem to work
          noClick
          noDrag
          onRemoveFile={this.handleOnRemoveFile}
        >
          {({ file }) => (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <button
                type="button"
                onClick={this.handleOpenDialog}
              >
                Browse file
              </button>
              <div style={{
                display: "inline-block",
                height: "38px",
                width: "40%",
                padding: "0 30px",
                color: "#555",
                fontSize: "11px",
                fontWeight: 600,
                lineHeight: "38px",
                textAlign: "center",
                letterSpacing: ".1rem",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
                backgroundColor: "transparent",
                borderRadius: "4px",
                border: "1px solid #bbb",
                boxSizing: "border-box"
              }}>
                {file && file.name}
              </div>
              <button
                onClick={this.handleRemoveFile}
              >
                Remove
              </button>
            </aside>
          )}
        </CSVReader>
      </>
    );
  }
}


