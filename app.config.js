const appJson = require("./app.json");

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
    },
  },
};
