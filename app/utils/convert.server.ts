export function convertToCSV(arr: Array<any>) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((values) => {
      return Object.values(values).toString();
    })
    .join("\n");
}
