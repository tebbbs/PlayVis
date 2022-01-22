import React, { useState } from 'react';
import * as d3 from 'd3';
import * as d3Dag from 'd3-dag';

export const useD3 = (renderFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderFn(d3.select(ref.current));
    return () => { };
    // eslint-disable-next-line
  }, dependencies)

  return ref;

}


const formatDAGNode = (node) => {
  return {
    name: node.track.name,
    id: node.id + node.stepNum,
    trackid: node.track.id,
    imgurl: node.track.album.images[1].url,
    isUnion: false,
    stepcol: node.stepcol,
    stepNum: node.stepNum,
    attributes: {
      artist: node.track.artists[0].name,
      genre: node.track.fullArtist.genres[0],
      bpm: node.bpm,
      acous: node.acous,
      dance: node.dance,
      strrep: `bpm: ${node.bpm} acous: ${node.acous} dance: ${node.dance}`,
    }
  }
}

export const DAGView = ({ data, setPlaylist }) => {

  // Format data for d3-dag

  const nodelist = data.nodes.flat().map(formatDAGNode);
  const linkprops = data.links.flat();
  const linkpairs = linkprops.map(linkObj => [linkObj.source, linkObj.target]);

  const ref = useD3(
    (svgIn) => {

      svgIn.selectAll("*").remove();

      if (!nodelist.length || !linkprops.length) {
        console.log("no paths")
        return;
      }

      // helper variables
      let i = 0;
      const duration = 750;
      const x_sep = 120;
      const y_sep = 60;

      // initialize panning, zooming
      const zoom = d3
        .zoom()
        .scaleExtent([0.8, 1.2]) // zoom from 80% to 120%
        // TODO: translateExtent()
        .on("zoom", (event) => g.attr("transform", event.transform))

      const svg = svgIn
        .call(zoom)
        .on("wheel.zoom", null);

      // append group element
      const g = svg.append("g");

      // declare a dag layout
      const tree = d3Dag
        .sugiyama()
        .layering(d3Dag.layeringSimplex())
        // might have to remove "large" at some point
        .decross(d3Dag.decrossOpt().large("large"))
        .coord(d3Dag.coordQuad())
        .nodeSize(() => [y_sep, x_sep]);

      // make dag from edge list
      let dag = d3Dag.dagConnect()(linkpairs);
      if (dag.id !== undefined) {
        const root = dag.copy();
        root.id = undefined;
        root.children = [dag];
        dag = root;
      }

      // prepare node data
      var all_nodes = dag.descendants();
      all_nodes.forEach((n) => {
        const id = n.data.id;
        n.data = nodelist.find(node => node.id === id);
        n.inserted_nodes = [];
        n.inserted_roots = [];
        n.neighbors = [];
        n.visible = true;
        n.inserted_connections = [];
      });

      // find root node and assign data
      const root = all_nodes[0];
      root.visible = true;
      root.x0 = 50;
      root.y0 = 50;

      // overwrite dag root nodes
      dag.children = [root];

      // draw dag
      update(root);

      function update(source) {
        // Assigns the x and y position for the nodes
        tree(dag);
        const nodes = dag.descendants();
        const links = dag.links();

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = g
          .selectAll("g.node")
          .data(nodes, d => d.id || (d.id = ++i))

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node
          .enter()
          .filter(d => !d.data.isUnion)
          .append("g")
          .attr("class", "node")
          .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
          })
          // .on("mouseover", tip.show)
          // .on("mouseout", tip.hide)
          .attr("visible", true);

        // Add album art
        nodeEnter
          .append("svg:image")
          .attr("href", d => d.data.imgurl)
          .attr("x", _ => -25)
          .attr("y", _ => -25)
          .attr("height", 50)
          .attr("width", 50)

        // Add names as node labels
        nodeEnter
          .append("text")
          .attr("dy", 20)
          .attr("x", 0)
          .attr("text-anchor", "start")
          .text((d) => d.data.name);

        // Add click behaviour

        nodeEnter
          .on("click", (event, d) => {
            const { id, trackid, stepNum } = d.data;
            const idClicked = trackid;

            // Find nodes and links with a route through this node
            const [nodesToKeep, linksToKeep] = data.chooseSong(trackid, stepNum);
            // Tag node ids with stepNum 
            const nodeIDList = nodesToKeep.map((arr, i) => arr.map(node => node.id + i)).flat();

            const linkPairList = linksToKeep.flat().map(link => "" + link.source + link.target);

            let nodeHide = d3
              .selectAll("g.node")
              .filter(node => !nodeIDList.includes(node.data.id))
            
            let linkHide = d3
              .selectAll("path.link")
              .filter(link => !linkPairList.includes("" + link.data[0] + link.data[1]));

            const hide = (selection) => {
              selection
                .attr("opacity", 0.25)
                .on("click", () => { })
            }

            hide(nodeHide);
            hide(linkHide);


            // Find other instances of the clicked song
            let nodeHighlight = d3
              .selectAll("g.node")
              .filter(node => node.data.trackid === idClicked);

            // Add rectangle to them
            nodeHighlight
              .append("rect")
              .attr("x", _ => -27)
              .attr("y", _ => -27)
              .attr("height", 54)
              .attr("width", 54)
              .attr("fill", "transparent")
              .attr("stroke", d.data.stepcol);

            // Reduce opacity of other instances
            let nodeGreyOut = nodeHighlight
              .filter(node => node.data.id !== id)
              .attr("fill", "#cccccc80")

            
            // Add song to playlist
            // TODO
            setPlaylist(prev => [...prev, d.data]);

          });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate
          .transition()
          .duration(duration)
          .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
          });

        // Remove any exiting nodes
        var nodeExit = node
          .exit()
          .transition()
          .duration(duration)
          .attr("transform", d => "translate(" + source.y + "," + source.x + ")")
          .attr("visible", false)
          .remove();

        // On exit reduce the opacity of text labels
        nodeExit.select("text").style("fill-opacity", 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = g.selectAll("path.link").data(links, d => d.source.id + d.target.id);

        // Enter any new links at the parent's previous position.
        var linkEnter = link
          .enter()
          .insert("path", "g")
          .attr("class", "link")
          .attr("d", (d) => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
          })
          .style("stroke", d => {
            const lprops = linkprops.find(l => d.data[0] === l.source && d.data[1] === l.target)
            return lprops.colour
          });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate
          .transition()
          .duration(duration)
          .attr("d", d => diagonal(d.source, d.target));

        // Remove any exiting links
        link
          .exit()
          .transition()
          .duration(duration)
          .attr("d", d => {
            const o = { x: source.x, y: source.y };
            return diagonal(o, o);
          })
          .remove();

        // expanding a big subgraph moves the entire dag out of the window
        // to prevent this, cancel any transformations in y-direction
        svg
          .transition()
          .duration(duration)
          .call(
            zoom.transform,
            d3
              .zoomTransform(g.node())
              .translate(-(source.y - source.y0), 0)
              // .translate(-(source.y - source.y0), -(source.x - source.x0))
          );

        // Store the old positions for transition.
        nodes.forEach(function (d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
          const path = `M ${s.y} ${s.x}
      C ${(s.y + d.y) / 2} ${s.x},
        ${(s.y + d.y) / 2} ${d.x},
        ${d.y} ${d.x}`;

          return path;
        }
      }
    }, [data.nodes.flat().length]
  )

  return (
    <svg
      ref={ref}
      style={{
        height: "200%",
        width: "200%",
        marginRight: "0px",
        marginLeft: "0px"
      }}
    />
  )

}

