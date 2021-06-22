require("dotenv").config();
const { assert, requester } = require("./set_up");
// const { users } = require("./fake_data");
// const sinon = require("sinon");
// const { pool } = require("../server/models/mysqlcon");

const expectedExpireTime = process.env.TOKEN_EXPIRE;

describe("User Sign In And Up Test", () => {
  /**
     * Sign Up and In
     */

  it("sign in and up", async () => {
    const user = {
      name: "henry",
      email: "henry@gmail.com",
      password: "password"
    };

    const res = await requester
      .post("/api/1.0/user/signinup")
      .send(user);

    const data = res.body.data;

    const userExpect = {
      id: data.user.id, // need id from returned data
      email: user.email
    };

    assert.deepEqual(data.user, userExpect);
    assert.isString(data.access_token);
    assert.equal(data.access_expired, expectedExpireTime);
  });

  it("sign up without email or password", async () => {
    const user1 = {
      email: "henry@gmail.com"
    };

    const res1 = await requester
      .post("/api/1.0/user/signinup")
      .send(user1);
    assert.equal(res1.statusCode, 400);

    const user2 = {
      password: "password"
    };

    const res2 = await requester
      .post("/api/1.0/user/signinup")
      .send(user2);
    assert.equal(res2.statusCode, 400);
  });

  it("sign up with malicious email", async () => {
    const user = {
      email: "<script>alert(1)</script>",
      password: "password"
    };

    const res = await requester
      .post("/api/1.0/user/signinup")
      .send(user);
    assert.equal(res.body.error, "Request Error: Invalid email format");
  });
});
