/* eslint-disable indent */
export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  get headerTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(({id, title, sortable}) => `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
        </div>`).join('')}
      </div>`;
  }

  get bodyProducts() {
    const columns = this.headerConfig.map(el => el.id);

    return this.data.map(el => `
    <a href="/products/${el.id}" class="sortable-table__row">

      ${columns.map(col => col === 'images'
        ? this.headerConfig[0].template(el[col])
        : `<div class="sortable-table__cell">${el[col]}</div>`
      ).join('')}

    </a>`).join('');
  }

  get bodyTemplate() {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this.bodyProducts}
    </div>`;
  }
  
  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${this.headerTemplate}
        ${this.bodyTemplate}
      </div>
    </div>`;
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.subElements = this.getSubElements();
  }

  updateData() {
    this.element.innerHTML = this.template;
    this.subElements = this.getSubElements();
  }

  sort(fieldValue, orderValue) {
    let direction;
    if (orderValue === 'asc') {
      direction = 1;
    }
    else if (orderValue === 'desc') {
      direction = -1;
    }

    const sortType = this.headerConfig.filter(el => el.id === fieldValue)[0].sortType;

    this.data.sort((a, b) => {
      if (sortType === 'number') {
        return direction * (a[fieldValue] - b[fieldValue]);
      }
      else if (sortType === 'string') {
        return direction * a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"], { caseFirst: 'upper' });
      }
    });

    this.updateData();
  }

  getSubElements() {
    const res = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      res[subElement.dataset.element] = subElement;
    }
    return res;
  }

  remove() {
    this.element?.remove();
    this.subElements = {};
  }

  destroy() {
    this.remove();
  }
}