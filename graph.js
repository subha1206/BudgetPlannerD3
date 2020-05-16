const dims = { heigh: 300, width: 300, radius: 150 };
const cord = { x: dims.width / 2 + 5, y: dims.heigh / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.heigh + 20)
  .attr("class", "z-depth-5");

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

// Data legend setup
const LegendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 20}, 10)`);

const legend = d3
  .legendColor()
  .shape("circle")
  .shapePadding(10)
  .scale(randColor);

// Creating Tool tip using d3-tip

const tip = d3
  .tip()
  .attr("class", "tip card")
  .html((d) => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost">${d.data.cost}</div>`;
    content += `<div class="delete">Click on slice to delete</div>`;
    return content;
  });

group.call(tip);

// updateData function(realTime listner for any changes in database)
const updateData = (data) => {
  // update color scale
  randColor.domain(data.map((item) => item.name));

  LegendGroup.call(legend);
  LegendGroup.selectAll("text").attr("fill", "#fff");

  //   joining pie data to path element
  const paths = group.selectAll("path").data(pie(data));

  // update and delete arc using exit selection
  paths.exit().remove();

  paths
    .attr("d", arcPath)
    .transition()
    .duration(1000)
    .attrTween("d", arcTweenUpdate);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .attr("fill", (d) => randColor(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition()
    .duration(1000)
    .attrTween("d", arcTweenEnter);

  // add events
  group
    .selectAll("path")
    .on("mouseover", (d, i, n) => {
      tip.show(d, n[i]);
      handelMouseOver(d, i, n);
    })
    .on("mouseout", (d, i, n) => {
      tip.hide();
      handelMouseOut(d, i, n);
    })
    .on("click", handelClick);
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

const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

function arcTweenUpdate(d) {
  //   interpoltae b/w two objects
  let i = d3.interpolate(this._current, d);

  // update the current path
  this._current = i(1);

  return function (t) {
    return arcPath(i(t));
  };
}

// event handler

const handelMouseOver = (d, i, n) => {
  d3.select(n[i]).transition("changeFill").duration(300).attr("fill", "coral");
};

const handelMouseOut = (d, i, n) => {
  d3.select(n[i])
    .transition("changeFill")
    .duration(300)
    .attr("fill", (d) => randColor(d.data.name));
};

// delete record funtion

const handelClick = (d) => {
  const id = d.data.id;
  db.collection("expenses").doc(id).delete();
};
