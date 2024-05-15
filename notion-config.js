const { Client } = require("@notionhq/client");

module.exports = function (RED) {
  function NotionConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.apiKey = n.apiKey;
    this.notion = new Client({ auth: this.apiKey });

    // Set initial status
    // this.status({ fill: "yellow", shape: "dot", text: "initializing..." });

    // // Check connection
    // this.notion.databases
    //   .list()
    //   .then(() => {
    //     this.status({ fill: "green", shape: "dot", text: "connected" });
    //   })
    //   .catch((error) => {
    //     this.status({ fill: "red", shape: "ring", text: "disconnected" });
    //     this.error("Failed to connect to Notion: " + error);
    //   });
  }
  RED.nodes.registerType("notion integration", NotionConfigNode);
};
