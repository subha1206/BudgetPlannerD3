const dims = { heigh: 300, width: 300, radius: 150 };
const cord = { x: dims.width / 2 + 5, y: dims.heigh / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.heigh + 150);

const group = svg
  .append("g")
  .attr("transform", `translate(${cord.x}, ${cord.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 1.8);

// ordinal scale

const randColor = d3.scaleOrdinal(d3.schemeCategory10);

// updateData function(realTime listner for any changes in database)
const updateData = (data) => {
  // update color scale
  randColor.domain(data.map((item) => item.name));

  //   joining pie data to path element
  const paths = group.selectAll("path").data(pie(data));

  paths.exit().remove();
  paths.attr("d", arcPath);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => randColor(d.data.name));
};

// dataArray and firestore(information from the database)
let data = [];

db.collection("expenses").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  updateData(data);
});
