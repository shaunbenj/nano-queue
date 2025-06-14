// Converts an object into a JSON string
export default function json_stringify(obj) {
  return JSON.stringify(obj, (key, value) =>
    value === undefined ? null : value
  );
}
