import { bAlgos } from "./GraphGen";

export const GraphConfig = ({ config, setGraphConfig }) => {
  const { maxCycLen } = config;
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Minimum songs before repeat in a route [0 = no repeats allowed]</span>
      <input type="number"  value={maxCycLen} min={0}  onChange={(e) => setGraphConfig(
        conf => ({ ...conf, maxCycLen: e.target.value })
      )} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Choose a branching algorithm</span>
        <select onChange={(e) => setGraphConfig(conf => ({ ...conf, algoidx: e.target.value }))}>
          {bAlgos.map((algo, i) =>
            <option key={i} value={i}>{algo.desc}</option>
          )}
        </select>
      </div>
    </>
  )
}