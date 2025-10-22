const emojis = {
  th11: "1410154638623117442",
  th12: "1410154614501806193",
  th13: "1410154589445165056",
  th14: "1410138015078289499",
  th15: "1410138042789924905",
  th16: "1410138061177618563",
  th17: "1410138087555858482",
  clancastle: "1410138154484240424",
  whitefwa: "1410138132598362283",
  fwalead: "1410138110313893939",
  throphy: "1410137987198746636",
  cwl: "1410137961948774440",
  crown: "1410137941396815882",
  coc: "1410137905938169926",
  ccw: "1410137878784245850",
  tickred: "1410137850229555290",
  heart: "1410137819598426156",
  alaram: "1410137801877491822",
  bluefwa: "1410137759179472969",
  bluex: "1410137736765243432",
  question: "1410137718457106452",
  gtick: "1410137697300775026", 
  cocfight: "1410132596763131914",
  arrow: "1410132410061819924", 
  mem: "1412062949832527922",
  wow: "1420946769298063461",
  drop: "1420946897450958908",
  rarrow: "1421868916782792846",
  larrow: "1421868930187788349",
  bluestar: "1425846252490194945",
  xp: "1427644973053902858",
  uparrow: "1427644609508409416",
  downarrow: "1427644615124586516",
  capitalgold: "1427644986400178247",
  graph: "1427644631688024084",
  clangames: "1427646350723649667",
  sheild: "1427653084380794940"
};
// Function to get animated emoji (with <a:>), else static emoji (<:>)
const animatedEmojis = new Set([
  "arrow",
  "crown",
  "heart",
  "alaram",
  "bluefwa",
  "bluex",
  "question",
  "bluestar",
  "whitefwa",
  "tickred",
  "wow",
  "uparrow",
  "downarrow",
  "graph",
  "cocfight"
]);

const getEmoji = (name) => {
  if (!emojis[name]) return ""; // Return empty string if emoji not found
  const id = emojis[name];
  if (animatedEmojis.has(name)) {
    return `<a:${name}:${id}>`;
  }
  return `<:${name}:${id}>`;
};
const getEmojiObject = (name) => {
  if (!emojis[name]) return null;
  return {
    id: emojis[name],
    name: name,
    animated: animatedEmojis.has(name)
  };
};
module.exports = {
  emojis,
  getEmoji,
  getEmojiObject
};


var Moubel = "🐬" ;
