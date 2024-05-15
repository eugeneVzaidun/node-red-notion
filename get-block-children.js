const callHttp = require("./common/callHttp");

module.exports = function (RED) {
  function GetBlockChildrenNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.integration = RED.nodes.getNode(config.integration);
    node.on("input", async function (msg) {
      node.status({ fill: "gray", shape: "dot", text: "Starting" });
      try {
        const response = await callHttp(
          `https://api.notion.com/v1/blocks/${msg.blockId}/children`,
          "GET",
          this.integration.apiKey
        );

        if (response.error) {
          msg.error = response.error;
          node.status({ fill: "red", shape: "dot", text: "API Error" });
        } else {
          msg.payload = response;
          if (response.object === "list") msg.statusCode = 200;
          else msg.statusCode = response.status;
          if (msg.statusCode === 200)
            node.status({ fill: "green", shape: "dot", text: "Done" });
          else
            node.status({ fill: "red", shape: "dot", text: msg.payload.code });
        }

        node.send(msg);
      } catch (error) {
        msg.error = `Unexpected error: ${error.message}`;
        node.status({ fill: "red", shape: "dot", text: "Error" });
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType("get block children", GetBlockChildrenNode);
};
