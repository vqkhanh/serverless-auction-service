const schema = {
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          emum: ["OPEN", "CLOSED"],
          default: "OPEN",
        },
      },
    },
  },
  required: ["queryStringParameters"],
};

export default schema;
