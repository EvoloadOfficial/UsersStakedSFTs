const { init, getUserSFTs } = require("./evoloadUtils");

async function main() {
  const initialized = await init();

  if (initialized) {
    //calling the function with erd address as a parameter and get an object with all SFTs staked.
    const obj = await getUserSFTs(
      "erd1wzen0qdqe6snhwthhyayv93kadlzyr5fyftqzl9z3a0rdft783cqhj30f2"
    );

    console.log(obj);
  }
}

main();
