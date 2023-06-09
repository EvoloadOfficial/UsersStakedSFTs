const { writeFileSync, readFileSync } = require("fs");
const data = JSON.parse(readFileSync("reformat.txt"));
const {
  AbiRegistry,
  Address,
  SmartContract,
  ResultsParser,
} = require("@multiversx/sdk-core");

let text = "";

data.forEach((item) => {
  text += `${Address.fromHex(item.address)},${item.stakedEvld},${
    item.sfts.ZINC
  },${item.sfts.NICKEL},${item.sfts.ALUMINIUM},${item.sfts.IRON},${
    item.sfts.BRONZE
  },${item.sfts.SILVER},${item.sfts.GOLD},${item.sfts.PLATINUM}\n`;
});

console.log(text);
writeFileSync("./CSVStakedTokensAndSFTs.csv", text);
