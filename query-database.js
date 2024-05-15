module.exports = function (RED) {
  function QueryDBNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.integration = RED.nodes.getNode(config.integration);
    node.on("input", async function (msg) {
      node.status({ fill: "gray", shape: "dot", text: "Starting" });

      if (!msg.payload || !msg.schema) {
        node.status({ fill: "red", shape: "dot", text: "No schema provided" });
        node.error("No schema provided", msg);
        return;
      }

      const schema = msg.schema || {};
      const queryPayload = msg.payload || {};

      try {
        let allResults = [];
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
          const response = await this.integration.notion.databases.query({
            ...queryPayload,
            start_cursor: startCursor,
          });

          if (response.results) {
            allResults = allResults.concat(response.results);
          }

          hasMore = response.has_more;
          startCursor = response.next_cursor;
        }

        msg.payload = extractPropertyValues(allResults, schema);
        node.status({ fill: "green", shape: "dot", text: "Done" });
        node.send(msg);
      } catch (error) {
        msg.error = `Unexpected error: ${error.message}`;
        node.status({ fill: "red", shape: "dot", text: "Error" });
        node.error(msg);
      }
    });
  }

  function extractPropertyValues(pages, schema) {
    return pages.map((page) => {
      const properties = page.properties;
      let result = { id: page.id };

      for (let prop in schema) {
        if (properties[prop]) {
          switch (schema[prop]) {
            case "url":
              result[prop] = properties[prop].url;
              break;
            case "select":
              result[prop] = properties[prop].select
                ? properties[prop].select.name
                : null;
              break;
            case "checkbox":
              result[prop] = properties[prop].checkbox;
              break;
            case "relation":
              result[prop] = properties[prop].relation;
              break;
            case "multi_select":
              result[prop] = properties[prop].multi_select
                ? properties[prop].multi_select.map((item) => item.name)
                : [];
              break;
            case "people":
              result[prop] = properties[prop].people
                ? properties[prop].people.map((person) => ({
                    name: person.name,
                    id: person.id,
                    avatar_url: person.avatar_url,
                  }))
                : [];
              break;
            case "title":
              result[prop] = properties[prop].title;
              break;
            default:
              result[prop] = properties[prop];
          }
        } else {
          result[prop] = null;
        }
      }

      return result;
    });
  }

  RED.nodes.registerType("query database", QueryDBNode);
};
