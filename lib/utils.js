export const UUID = {
  MIN_UUID: "00000000-0000-0000-0000-000000000000",
  MAX_UUID: "ffffffff-ffff-ffff-ffff-ffffffffffff",
};

export function secondsFromNow(seconds) {
  return new Date(Date.now() + seconds * 1_000);
}

export function serializeDate(date) {
  return date.toISOString();
}
