/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return (obj) => {
    const props = path.split('.');
    let tempObj = obj;
  
    props.forEach(prop => tempObj = tempObj?.[prop]);
  
    return tempObj;
  };
}