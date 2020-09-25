export const trimData = (data: any): any => {
  if (data === undefined || data === null) return data;
  if (typeof data === 'string') {
    return data.trim();
  }
  if (typeof data === 'object' && !Array.isArray(data)) {
    const trimmed = Object.keys(data).reduce((acc: any, key: any) => {
      acc[key] = trimData(data[key]);
      return acc;
    }, {});
    return trimmed;
  }
  if (Array.isArray(data)) {
    return data.map((val: any) => {
      return trimData(val);
    });
  }
  return data;
};
