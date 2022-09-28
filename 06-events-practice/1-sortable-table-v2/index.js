export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(el => el.dataset.order).id,
      order: 'asc',
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }
  
  setEventListeners() {
    this.subElements.header.addEventListener('click', this.onSortClick);
  }

  onSortClick = e => {
    const sortEl = e.target.closest('[data-sortable="true"]');
    if (!sortEl) {return;}

    const { id } = sortEl.dataset;
    const { order } = this.sorted;

    this.setSorted(id, order);
    this.sort();
  }
  
  get headerTemplate() {
    return `
      ${this.headersConfig.map(({id, title, sortable}) => this.headerColTemplate({id, title, sortable})).join('')}`;
  }

  headerColTemplate({id, title, sortable}) {
    const isSortedCell = id === this.sorted.id;
    const [dataOrder, elementOfSort] = isSortedCell
      ? [`data-order="${this.sorted.order}"`, this.getArrowSort()]
      : ['', ''];

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${dataOrder}>
        <span>${title}</span>
        ${elementOfSort}
      </div>`;
  }

  get bodyProducts() {
    const columns = this.headersConfig.map(el => el.id);

    return this.data.map(el => `
    <a href="/products/${el.id}" class="sortable-table__row">

      ${columns.map(col => col === 'images'
    ? this.headersConfig[0].template(el[col])
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
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerTemplate}
      </div>
        ${this.bodyTemplate}
      </div>
    </div>`;
  }

  getArrowSort() {
    return (
      `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`
    );
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.subElements = this.getSubElements();
    this.sort();
    this.setEventListeners();
  }

  updateData() {
    const { body, header } = this.subElements;
    header.innerHTML = this.headerTemplate;
    body.innerHTML = this.bodyTemplate;
  }

  sort(id = this.sorted.id, order = this.sorted.order) {
    let direction;
    if (order === 'asc') {
      direction = 1;
    }
    else if (order === 'desc') {
      direction = -1;
    }

    const { sortType } = this.headersConfig.filter(el => el.id === id)[0];

    this.data.sort((a, b) => {
      if (sortType === 'number') {
        return direction * (a[id] - b[id]);
      }
      else if (sortType === 'string') {
        return direction * a[id].localeCompare(b[id], ["ru", "en"], { caseFirst: 'upper' });
      }
    });

    this.updateData();
  }

  setSorted(id, order) {
    const togglerMap = {
      'asc': 'desc',
      'desc': 'asc',
    };
    this.sorted.id = id;
    this.sorted.order = togglerMap[order];
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
    this.subElements.header.addEventListener('click', this.onSortClick);
    this.subElements = {};
  }

  destroy() {
    this.remove();
  }
}