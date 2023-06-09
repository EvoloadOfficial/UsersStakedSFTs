const {
  AbiRegistry,
  Address,
  SmartContract,
  ResultsParser,
} = require("@multiversx/sdk-core");
const { ProxyNetworkProvider } = require("@multiversx/sdk-network-providers");
const { promises, writeFileSync, readFileSync } = require("fs");
const { init, getUserSFTs, getUserTotalStakedEVLD } = require("./evoloadUtils");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await init();

  const proxyNetworkProvider = new ProxyNetworkProvider(
    "https://gateway.multiversx.com"
  );

  let abiJson = await promises.readFile(
    "./contracts/evld-staking-sc.abi.json",
    { encoding: "utf8" }
  );
  let abiObj = JSON.parse(abiJson);
  let abiRegistry = AbiRegistry.create(abiObj);
  let existingContractAddress = Address.fromBech32(
    "erd1qqqqqqqqqqqqqpgqxp6xre0k09yp586acwnp3kzqx0xn3gk5uslsram6y7"
  );
  let existingContract = new SmartContract({
    address: existingContractAddress,
    abi: abiRegistry,
  });

  //console.log(existingContract.methods);

  let HexAddresses = [];
  for (let i = 1; i <= 3; i++) {
    let interaction = existingContract.methods.getPoolStakerAddresses([
      `0${i}`,
    ]);
    let query = interaction.check().buildQuery();

    let queryResponse = await proxyNetworkProvider.queryContract(query);
    let bundle = new ResultsParser().parseQueryResponse(
      queryResponse,
      interaction.getEndpoint()
    );

    //console.log(bundle.lastValue.items);

    bundle.lastValue.items.forEach((item) => {
      //console.log(item.value.valueHex);
      HexAddresses.push(item.value.valueHex);
    });
    await sleep(500);
  }

  console.log(HexAddresses);

  let HexAddressWithTotalStaked = [];

  for (const address of HexAddresses) {
    let format = {
      address: address,
      stakedEvld: 0,
      sfts: {},
    };

    console.log("Fetching for : ", address);
    let getSfts = await getUserSFTs(Address.fromHex(address));
    format.stakedEvld = await getUserTotalStakedEVLD(Address.fromHex(address));
    format.sfts = getSfts;
    HexAddressWithTotalStaked.push(format);

    // HexAddressWithTotalStaked.forEach((addr) => {
    //   console.log(`${JSON.stringify(addr)}`);
    // });
    //console.log(HexAddressWithTotalStaked);
  }

  writeFileSync(".output.txt", JSON.stringify(HexAddressWithTotalStaked));
}

main();
