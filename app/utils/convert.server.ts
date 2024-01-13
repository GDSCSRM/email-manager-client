export function convertToCSV(arr: Array<any>) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((values) => {
      return Object.values(values).toString();
    })
    .join("\n");
}

export function convertToObject(arr: Array<string>) {
  const keys = arr[0].split(",");
  const values = arr.slice(1);

  return values.map((value) => {
    const obj: Record<string, any> = {};

    keys.forEach((key, i) => {
      obj[key] = value.split(",")[i];
    });
    return obj;
  });
}
