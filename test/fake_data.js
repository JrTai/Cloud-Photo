const users = [
  {
    user_id: 1,
    email: "test1@gmail.com",
    password: "test1password",
    storage: 0,
    premium: 0,
    access_token: "test1accesstoken",
    access_expired: (60 * 60) // 1hr by second
  }
];

module.exports = {
  users
};
