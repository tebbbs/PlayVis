import React, { useState } from 'react';
import * as d3 from 'd3';
import * as d3Dag from 'd3-dag';

const useD3 = (renderFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderFn(d3.select(ref.current));
    return () => { };
    // eslint-disable-next-line
  }, dependencies)

  return ref;

}
export const DAGView = ({ data, setData, muted }) => {

  // Format data for d3-dag
  // Adds a 'root' node 

  const [yMax, setYmax] = useState(0);

  const nodelist = [
    ...data.nodes.flat(),
    ...data.unions,
    { id: "root", isUnion: true }
  ];
  const linkprops = [
    ...data.links.flat(),
    ...data.nodes[0].map(n => {
      return {
        source: "root",
        target: n.id,
        stepid: -1,
        colour: n.stepCol,
        isLHalf: false,
        isRHalf: true,
      };
    })
  ];

  const linkpairs = linkprops.map(linkObj => [linkObj.source, linkObj.target]);

  // helper variables
  const duration = 750;
  const x_sep = 140;
  const y_sep = 80;

  const ref = useD3(
    (svg) => {

      // #region layout
      const zoom = d3
        .zoom(false)

      // disable scroll zooming
      svg
        .call(zoom)
        .on("wheel.zoom", null);

      // append group element if not present
      const g = svg.select("g").node()
        ? svg.select("g")
        : svg.append("g");

      // declare a dag layout
      const tree = d3Dag
        .sugiyama()
        .layering(d3Dag.layeringLongestPath())
        .decross(d3Dag.decrossTwoLayer().passes(96))
        .coord(d3Dag.coordQuad())
        .nodeSize(d => [y_sep, d ? d.data.isUnion ? x_sep / 8 : x_sep : x_sep]);

      // make dag from edge list
      let dag = d3Dag.dagConnect()(linkpairs);

      // prepare node data
      const all_nodes = dag.descendants();
      all_nodes.forEach((n) => {
        const id = n.data.id;
        n.data = nodelist.find(node => node.id === id);
        n.inserted_nodes = [];
        n.inserted_roots = [];
        n.neighbors = [];
        n.visible = true;
        n.inserted_connections = [];
      });

      // set root
      const root = all_nodes.find(n => n.data.id === "root");
      root.visible = true;
      root.x0 = 0;
      root.y0 = 0;

      // #endregion layout

      // draw dag
      update(root);

      function update(source) {
        // Assigns the x and y position for the nodes
        tree(dag);
        const nodes = dag.descendants();
        const links = dag.links();

        // #region nodes 
        // ****** Nodes section ***************************

        // Update the nodes...
        const node = g
          .selectAll("g.node")
          .data(nodes, d => d.data.id)

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node
          .enter()
          .filter(d => !d.data.isUnion)
          .append("g")
          .attr("class", "node")
          .attr("transform", "translate(" + source.y0 + "," + source.x0 + ")")
          .attr("visible", true);

        // Add album art
        nodeEnter
          .append("svg:image")
          .attr("href", d => d.data.imgurl)
          .attr("x", -25)
          .attr("y", -25)
          .attr("height", 50)
          .attr("width", 50)

        // Add play button symbol
        const play = nodeEnter
          .append("g")
          .attr("pointer-events", "none")
          .attr("opacity", "0");

        // Circle
        play
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 20)
          .style("fill", "#00000070")
          .style("stroke", "#909090");

        // Triangle
        play
          .append("path")
          .attr("d", d3.symbol().type(d3.symbolTriangle).size(150))
          .attr("transform", "rotate(90)")
          .style("fill", "#FFFFFF90");

        // Add names as node labels
        nodeEnter
          .append("text")
          .attr("dy", 40)
          .attr("dx", -25)
          .attr("text-anchor", "start")
          .text(d => {
            const name = d.data.name;
            return name.length <= 20
              ? name
              : name.slice(0, 20) + "..."
          })


        // Add rectangles for highlighting
        nodeEnter
          .append("rect")
          .attr("x", -28)
          .attr("y", -28)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("height", 56)
          .attr("width", 56)
          .attr("fill", "transparent");


        // UPDATE

        // not sure why merge doesn't work but this is ok for now
        // https://observablehq.com/@d3/selection-join - might help

        // const nodeUpdate = nodeEnter.merge(node);
        const nodeUpdate = g.selectAll("g.node");

        // Add click behaviour
        nodeUpdate
          .on("click", (event, d) => {
            // Remove nodes and links without a route through this node
            const newDag = data.chooseSong(d.data);
            setData(newDag);
          });

        // Add hover-over behaviour
        nodeUpdate
          .on("mouseover", function (event, d) {
            if (muted || !d.data.audio) return;
            d.data.audio.play();
            d3.select(this)
              .select("g")
              .attr("opacity", "1");
          })
          .on("mouseout", function (event, d) {
            if (muted || !d.data.audio) return;
            d.data.audio.pause();
            d.data.audio.currentTime = 0;
            d3.select(this)
              .select("g")
              .attr("opacity", "0");
          });

        // Initially, hide rectangle highlights from previous renders
        nodeUpdate
          .select("rect")
          .attr("opacity", "0");

        // Highlight any clicked/highlighted nodes
        let nodeHighlight = d3
          .selectAll("g.node")
          .filter(d => d.data.isHighlighted || d.data.isClicked);

        // Show rectangle
        nodeHighlight
          .select("rect")
          .attr("stroke", d => d.data.highlightCol)
          .attr("opacity", "1");

        // Reduce opacity of other instances
        nodeHighlight
          .filter(node => !node.data.isClicked)
          .select("rect")
          .attr("fill", "#cccccc80")

        // Transition to the proper position for the node
        nodeUpdate
          .transition()
          .duration(duration)
          .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

        // Remove any exiting nodes
        node
          .exit()
          .transition()
          .duration(duration)
          .attr("transform", "translate(" + source.y + "," + source.x + ")")
          .attr("visible", false)
          .remove();

        // #endregion nodes

        // #region links
        // ****************** links section ***************************

        // Update the links...
        const link = g.selectAll("path.link").data(links, l => "" + l.data[0] + l.data[1]);

        // Enter any new links at the parent's previous position.
        const linkEnter = link
          .enter()
          .insert("path", "g")
          .attr("class", "link")
          .attr("d", d => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
          });

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate
          .transition()
          .duration(duration)
          .attr("d", d => diagonal(d.source, d.target));

        // Colour links
        linkUpdate
          .style("stroke", d => {
            const lprops = linkprops.find(l => d.data[0] === l.source && d.data[1] === l.target)
            return lprops.colour
          });

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

        // #endregion links

        // expanding a big subgraph moves the entire dag out of the window
        // to prevent this, cancel any transformations in y-direction
        svg
          .transition()
          .duration(duration)
          .call(
            zoom.transform,
            d3.zoomTransform(g.node())
          );

        // Store the old positions for transition.
        nodes.forEach(function (d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });

        // Assign max y-coordinate value
        setYmax(y_sep + Math.max(...nodes.map(d => d.x)));

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
          const path = `M ${s.y} ${s.x}
      C ${(s.y + d.y) / 2} ${s.x},
        ${(s.y + d.y) / 2} ${d.x},
        ${d.y} ${d.x}`;

          return path;
        }
      }

    }, [JSON.parse(JSON.stringify(data))]
  )

  return (
    <div style={{ position: "relative", height: "95%", width: "95%" }}>
      <svg 
        ref={ref}
        style={{
          minWidth: "100%",
          minHeight: "100%",
          width: `${x_sep * data.nodes.length + 60}px`,
          height: `${yMax}px`,
          marginTop: "15px",
          marginRight: "0px",
          marginLeft: "0px"
        }}
      />
      {/*  column numbers and dashed lines*/}
      <div style={{
        pointerEvents: "none",
        position: "absolute", top: 0, left: 0,
        display: "flex",
        alignItems: "flex-start",
        paddingTop: "2px",
        paddingLeft: x_sep / 8,
      }}>
        {data.nodes.map((_, i) =>
          <div key={i} style={{
            textAlign: "center",
            color: "#888888",
            flexBasis: x_sep,
            flexShrink: 0,
            borderStyle: i > 0 ? "none none none dashed" : "none",
            borderColor: "#AAAAAA40",
            minHeight: "100%",
            height: `${yMax + 15}px`
          }}>
            <i>track {i + 1}</i>
          </div>
        )}
      </div>
      
    </div>
  )

}

