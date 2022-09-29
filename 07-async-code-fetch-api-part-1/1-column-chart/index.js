import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/api';

export default class ColumnChart {
  chartHeight = 50;
  element;
  subElements;
  data = [];
  tableValues = [];

  constructor({
    label,
    link,
    url,
    range = {
      from: Date.now(),
      to: Date.now(),
    },
    formatHeading = (val) => val
  } = {}) {
    this.label = label;
    this.link = link;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.heading = formatHeading;

    this.render();
  }

  getNewData() {
    const url = new URL(this.url);
    
    url.searchParams.append("from", this.range.from.toISOString());
    url.searchParams.append("to", this.range.to.toISOString());

    return fetchJson(url).then(res => res);
  }

  get templateColumnChart() {
    return `
      <div class='column-chart column-chart_loading'>
        <div class='column-chart__title'>
          Total ${this.label}
          ${this.link ? this.templateLink : ''}
        </div>
        <div class='column-chart__container'>
          <div data-element="header" class="column-chart__header">
            ${this.heading}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.renderColumns()}
          </div>
        </div>
      </div>`;
  }

  get templateLink() {
    return this.link
      ? `<a class='column-chart__link' href=${this.link}>
          View all
        </a>`
      : '';
  }

  calcHeadingValues() {
    return this.heading(
      this.tableValues.reduce((acc, curr) => acc += parseInt(curr), 0)
    );
  }

  renderSubElements() {
    const { body, header } = this.subElements;

    body.innerHTML = this.renderColumns();
    header.innerHTML = this.calcHeadingValues();

    if (this.tableValues.length) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  async render() {
    const el = document.createElement("div");
    el.innerHTML = this.templateColumnChart;
    this.element = el.firstElementChild;

    this.subElements = this.getSubElements();

    this.data = await this.getNewData();
    this.tableValues = Object.values(this.data);
    this.renderSubElements();

    return this.element;
  }

  renderColumns() {
    if (!this.tableValues.length) {return;}

    const max = Math.max(...this.tableValues);
    const scale = this.chartHeight / max;
    const el = document.createElement('div');

    return this.tableValues.map((value) => {
      const precent = `${((value / max) * 100).toFixed(0)}%`;

      el.style = `--value: ${Math.floor(value * scale)}`;
      el.dataset['tooltip'] = precent;

      return el.outerHTML;
    }).join("");
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }

    return subElements;
  }

  async update(from, to) {
    this.range = { from, to };
    this.data = await this.getNewData();
    this.tableValues = Object.values(this.data);
    this.renderSubElements();

    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}