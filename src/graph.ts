//
//  main.js
//
// Random tree
// Tree copied from: https://github.com/vasturiano/force-graph
console.log("Load force graph in TS v 0.6");
import { get_link_info } from "./main";

// import ForceGraph from "force-graph";

// Pages are the link_infos
// Set id to be the URL.

const pages = Object.values(await get_link_info()).map(p => ({
  ...p,
  id: p.url,
}));
function is_valid_url(url) {
  // check if the url is in the list of pages
  return pages.map(p => p.url).includes(url);
}

// build links
const links = [];
pages.forEach(page => {
  page.outgoing_links
    .filter(is_valid_url) // We have lots of dead links, go fix them in the source material
    .forEach(target => {
      links.push({ source: page, target, value: 1 });
    });

  //page.incoming_links.forEach(target => {
  //links.push({ source: target, target: source, value: 1 });
  //});
});

// log first 20 pages
console.log("Originals");
console.log(pages.slice(0, 20).map(p => p));
console.log(links.slice(0, 20).map(o => o));
console.log(pages.map(p => p.url));

const gData = {
  nodes: pages,
  links: links,
};

console.log("HEllo From Typescript");

function TextLabelNodeCanvas(node, ctx, globalScale: number) {
  const label = node.id;
  const fontSize = 12 / globalScale;
  ctx.font = `${fontSize}px Sans-Serif`;
  const textWidth = ctx.measureText(label).width;
  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(
    node.x - bckgDimensions[0] / 2,
    node.y - bckgDimensions[1] / 2,
    ...bckgDimensions
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = node.color;
  ctx.fillText(label, node.x, node.y);

  node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
}

function TextLabelNodePointerAreaPaint(node, color, ctx) {
  ctx.fillStyle = color;
  const bckgDimensions = node.__bckgDimensions;
  bckgDimensions &&
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2,
      node.y - bckgDimensions[1] / 2,
      ...bckgDimensions
    );
}

const Graph = ForceGraph()(document.getElementById("graph"))
  .graphData(gData)
  .nodeLabel("id")
  .nodeAutoColorBy("group")
  .nodeCanvasObject(TextLabelNodeCanvas)
  .nodePointerAreaPaint(TextLabelNodePointerAreaPaint)
  .onNodeClick(node => {
    // Center/zoom on node
    Graph.centerAt(node.x, node.y, 1000);
    Graph.zoom(8, 2000);
  });

console.log("Post Graph");