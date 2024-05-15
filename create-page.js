const callHttp = require("./common/callHttp");

module.exports = function (RED) {
  function CreatePageNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.integration = RED.nodes.getNode(config.integration);
    node.on("input", async function (msg) {
      node.status({ fill: "gray", shape: "dot", text: "Starting" });
      try {
        const response = await callHttp(
          "https://api.notion.com/v1/pages/",
          "POST",
          this.integration.apiKey,
          msg.payload
        );
        msg.payload = response;
        if (response.object === "page") msg.statusCode = 200;
        else msg.statusCode = msg.statusCode = response.status;
        if (msg.statusCode === 200)
          node.status({ fill: "green", shape: "dot", text: "Done" });
        else node.status({ fill: "red", shape: "dot", text: msg.payload.code });
        node.send(msg);
      } catch (error) {
        msg.error = `Unexpected error: ${error.message}`;
        node.status({ fill: "red", shape: "dot", text: "Error" });
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType("create page", CreatePageNode);
};
