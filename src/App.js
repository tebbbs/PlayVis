import React, { Component } from 'react';
import { CSVReader } from 'react-papaparse';
import { ForceGraph2D } from 'react-force-graph';

const buttonRef = React.createRef();

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.onFileUpload = this.onFileUpload.bind(this);
  }
 
  onFileUpload(file) {
    this.setState({data: file});
  }

  render() {
    const reader = <CSVReader1 onFileUpload={this.onFileUpload}/>;
    if (this.state == null) {
      return(
        reader
      );
    }
    else {
      return(
        <>
          {reader}
          <Graph data={this.state.data} />
        </>
       );
    }
  }
}

export class Graph extends React.Component {

  makeNodes(songs) {
    let nodes = new Array(songs.length - 1);
    let i;
    for (i = 1; i < songs.length; i++) {
      nodes[i - 1] = {
        id: songs[i]['data'][5],
        title: songs[i]['data'][0],
        artist: songs[i]['data'][1]
      } 
    }
    return nodes;
  }
  
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }
  
  makeEdges(nodes) {
    let edges = new Array(100);
    let i;
    for (i = 0; i < edges.length; i++) {
      edges[i] = {
        // Note: nodes could be linked to themselves with this approach
        source: nodes[this.getRandomInt(0, nodes.length)],
        target: nodes[this.getRandomInt(0, nodes.length)],
        //weight: getRandomInt(0,5)
      }
    }
    return edges;
  }

  render() {
      const nodes = this.makeNodes(this.props.data);
      const edges = this.makeEdges(nodes);
      return (
          <>
            <h2>csv uploaded</h2>
            <ForceGraph2D graphData={{ nodes: nodes, links: edges }} nodeLabel={ (node) => {return(node.title + " - " + node.artist)}} />
          </>
      );
  
  }
}

export class CSVReader1 extends Component {

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
        <h5>Upload CSV with playlist data</h5>
        <CSVReader
          ref={buttonRef}
          onFileLoad={this.handleOnFileLoad}
          onError={this.handleOnError}
          parserOptions={{header: true}} // doesn't seem to work
          noClick
          noDrag
          onRemoveFile={this.handleOnRemoveFile}
        >
          {({ file }) => (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 10,
              }}
            >
              <button
                type="button"
                onClick={this.handleOpenDialog}
                style={{
                  borderRadius: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  width: '40%',
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              >
                Browse file
              </button>
              <div
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#ccc',
                  height: 45,
                  lineHeight: 2.5,
                  marginTop: 5,
                  marginBottom: 5,
                  paddingLeft: 13,
                  paddingTop: 3,
                  width: '60%',
                }}
              >
                {file && file.name}
              </div>
              <button
                style={{
                  borderRadius: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
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
