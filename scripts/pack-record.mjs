/**
 * Returns the single pack record from `npm pack --json` output.
 *
 * npm 11 and earlier print an array of pack records; npm 12 prints an object
 * keyed by package name. Anything else fails with a message that names the
 * command, rather than a TypeError further down.
 */
export function readPackRecord(output) {
  let result;
  try {
    result = JSON.parse(output);
  } catch (error) {
    throw new Error(
      `Expected npm pack --json to print JSON (${error.message}), got:\n${output}`
    );
  }
  const records =
    result !== null && typeof result === 'object'
      ? Array.isArray(result)
        ? result
        : Object.values(result)
      : [];
  const [record] = records;
  if (records.length !== 1 || !Array.isArray(record?.files)) {
    throw new Error(
      `Expected npm pack --json to describe exactly one package with a files list, got:\n${output}`
    );
  }
  return record;
}
