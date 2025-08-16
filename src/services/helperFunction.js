export const formatSignificantFigures = (value) => {
  if (!value) return 0;
  return Number(value)?.toPrecision(2);
};