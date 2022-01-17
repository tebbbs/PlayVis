import React from 'react';
import * as d3 from 'd3';
import * as d3Dag from 'd3-dag'

const DAG = ({ data }) => {

  const { nodes, linkprops } = data

  const linkpairs = linkprops.map(linkObj => [linkObj.source, linkObj.target])

  React.useEffect(() => {
    init();
  }, []);
  return (
    <div className="DAG" style={{ height: "500px"}}>
    </div>
  );

  function init() {
    const screen_width = document.body.offsetWidth;
    const screen_height = document.documentElement.clientHeight;
  
    // helper variables
    let i = 0;
    const duration = 750;
    const x_sep = 120;
    const y_sep = 60;
  
    // initialize panning, zooming
    const zoom = d3
      .zoom()
      .on("zoom", (event) => 
        g.attr("transform", event.transform));
  
    // append the svg object to the DAG div
    // assigns width and height
    // activates zoom/pan and tooltips
    const svg = d3
      .select("div.DAG")
      .append("svg")
      .attr("width", screen_height)
      .attr("height", screen_width)
      .call(zoom);
  
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
      n.data = nodes.find(node => node.id === id);
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
        // .on("click", click)
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
  
      // UPDATE
      var nodeUpdate = nodeEnter.merge(node);
  
      // Transition to the proper position for the node
      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        });
  
      // Update the node attributes and style
      // nodeUpdate
      //   .select("circle.node")
      //   .attr("r", (d) => 10)
      //   .style("fill", function (d) {
      //     return "lightsteelblue";
      //   })
      //   .attr("cursor", "pointer");
  
      // Remove any exiting nodes
      var nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .attr("visible", false)
        .remove();
  
      // On exit reduce the node circles size to 0
      // nodeExit.select("circle").attr("r", 1e-6);
  
      // On exit reduce the opacity of text labels
      nodeExit.select("text").style("fill-opacity", 1e-6);
  
      // ****************** links section ***************************
  
      // Update the links...
      var link = g.selectAll("path.link").data(links, function (d) {
        return d.source.id + d.target.id;
      });
  
      // Enter any new links at the parent's previous position.
      var linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
          var o = { x: source.x0, y: source.y0 };
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
        .attr("d", (d) => diagonal(d.source, d.target));
  
      // Remove any exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function (d) {
          var o = { x: source.x, y: source.y };
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
            .translate(-(source.y - source.y0), -(source.x - source.x0))
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
  }
}

export default DAG;
