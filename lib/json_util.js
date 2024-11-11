function json_stringify(obj) {
  return JSON.stringify(obj, (key, value) =>
    value === undefined ? null : value
  );
}

module.exports = json_stringify;
