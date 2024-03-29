const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { NODE_ENV } = process.env;
const { truncateFakeData, createFakeData } = require("./fake_data_generator");

chai.use(chaiHttp);

const assert = chai.assert;
const requester = chai.request(app).keepOpen();

before(async () => {
  if (NODE_ENV !== "test") {
    const errorMessage = { message: "Not in test env" };
    throw errorMessage;
  }

  await truncateFakeData();
  await createFakeData();
});

module.exports = {
  assert,
  requester
};
