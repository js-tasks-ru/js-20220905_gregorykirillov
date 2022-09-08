/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {return string;}
  else if (size === 0) {return '';}

  let counter = 0;
  const charsArr = string.split('');

  return charsArr.reduce((acc, curr) => {
    if (acc.at(-1) === curr) {
      if (counter < size) {
        counter++;
        return [...acc, curr];
      }
      return acc;
    } else {
      counter = 1;
      return [...acc, curr];
    }
  }, []).join('');
}