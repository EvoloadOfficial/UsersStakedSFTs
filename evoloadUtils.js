const {
  AbiRegistry,
  Address,
  SmartContract,
  ResultsParser,
} = require("@multiversx/sdk-core");
const { ProxyNetworkProvider } = require("@multiversx/sdk-network-providers");
const { rejects } = require("assert");
const { promises } = require("fs");
const proxyNetworkProvider = new ProxyNetworkProvider(
  "https://gateway.multiversx.com"
);

const TOKEN_DECIMALS = 6;
let abiJson;
let abiObj;
let abiRegistry;
let existingContractAddress;
let existingContract;

//this functiin will initialize contract setup, and return true when is ready
async function init() {
  return new Promise(async (resolve, reject) => {
    try {
      abiJson = await promises.readFile(
        "./contracts/evld-staking-sc.abi.json",
        {
          encoding: "utf8",
        }
      );

      abiObj = JSON.parse(abiJson);
      abiRegistry = AbiRegistry.create(abiObj);
      existingContractAddress = Address.fromBech32(
        "erd1qqqqqqqqqqqqqpgqxp6xre0k09yp586acwnp3kzqx0xn3gk5uslsram6y7"
      );
      existingContract = new SmartContract({
        address: existingContractAddress,
        abi: abiRegistry,
      });

      resolve(true); //return true when is backed
    } catch (err) {
      reject(err);
    }
  });
}

const getUserSFTs = async (erdAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      let totalSFTStaked = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
      };
      for (let i = 1; i <= 3; i++) {
        let interaction = existingContract.methods.getStakeSft([
          `0${i}`,
          `${erdAddress}`,
        ]);
        let query = interaction.check().buildQuery();

        let queryResponse = await proxyNetworkProvider.queryContract(query);
        let bundle = new ResultsParser().parseQueryResponse(
          queryResponse,
          interaction.getEndpoint()
        );

        bundle.firstValue?.valueOf().forEach((nft) => {
          totalSFTStaked[nft.user_staked_nonce.toString()] +=
            nft.user_staked_amount_per_nonce.toNumber();
        });
      }

      resolve(totalSFTStaked);
    } catch (err) {
      rejects(err);
    }
  });
};

const getUserTotalStakedEVLD = async (erdAddress) => {
  return new Promise(async (resolve, rejects) => {
    try {
      let totalStakedEVLD = 0;

      let interaction = existingContract.methods.getPools([`${erdAddress}`]);
      let query = interaction.check().buildQuery();

      let queryResponse = await proxyNetworkProvider.queryContract(query);
      let bundle = new ResultsParser().parseQueryResponse(
        queryResponse,
        interaction.getEndpoint()
      );

      bundle.firstValue?.valueOf().forEach((pool) => {
        totalStakedEVLD += pool.pool_user_staked_amount.toNumber();
      });

      resolve((totalStakedEVLD / 10 ** TOKEN_DECIMALS).toFixed(2));
    } catch (err) {
      rejects(err);
    }
  });
};

module.exports = { init, getUserSFTs, getUserTotalStakedEVLD };
