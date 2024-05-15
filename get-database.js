const callHttp = require("./common/callHttp");

module.exports = function (RED) {
  function GetDBNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.integration = RED.nodes.getNode(config.integration);
    node.on("input", async function (msg) {
      node.status({ fill: "gray", shape: "dot", text: "Starting" });
      try {
        const response = await callHttp(
          `https://api.notion.com/v1/databases/${msg.pageId}`,
          "GET",
          this.integration.apiKey
        ); // Use the imported fetchData function
        if (response.error) {
          // Handle error by setting it in msg.error
          msg.error = response.error;
          node.status({ fill: "red", shape: "dot", text: "API Error" });
        } else {
          msg.payload = response;
          if (response.object === "database") msg.statusCode = 200;
          else msg.statusCode = response.status;
          if (msg.statusCode === 200)
            node.status({ fill: "green", shape: "dot", text: "Done" });
          else
            node.status({ fill: "red", shape: "dot", text: msg.payload.code });
        }
        node.send(msg);
      } catch (error) {
        // Handle other unexpected errors
        msg.error = `Unexpected error: ${error.message}`;
        node.status({ fill: "red", shape: "dot", text: "Error" });
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType("get database", GetDBNode);
};
