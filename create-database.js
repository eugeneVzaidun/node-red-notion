const callHttp = require("./common/callHttp");

module.exports = function (RED) {
  function CreateDBNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.integration = RED.nodes.getNode(config.integration);

    node.on("input", async function (msg) {
      node.status({ fill: "gray", shape: "dot", text: "Starting" });
      try {
        // const response = await callHttp(
        //   "https://api.notion.com/v1/databases",
        //   "POST",
        //   this.integration.apiKey,
        //   msg.payload
        // );

        const response = await this.integration.notion.query(msg.payload || {});
        console.log("response", response);
        msg.payload = response;
        // if (response.object === "database") msg.statusCode = 200;
        // else msg.statusCode = msg.statusCode = response.status;
        // if (msg.statusCode === 200)
        // else node.status({ fill: "red", shape: "dot", text: msg.payload.code });
        node.status({ fill: "green", shape: "dot", text: "Done" });
        node.send(msg);
      } catch (error) {
        msg.error = `Unexpected error: ${error.message}`;
        node.status({ fill: "red", shape: "dot", text: "Error" });
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType("create database", CreateDBNode);
};
