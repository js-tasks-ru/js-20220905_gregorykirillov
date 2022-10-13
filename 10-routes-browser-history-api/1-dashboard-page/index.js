import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  API_URL = 'api/dashboard';
  RANGE = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  }

  template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable"></div>
      </div>`;
  }

  appendRangePicker() {
    this.rangePicker = new RangePicker(this.RANGE).element;

    this.subElements.rangePicker.append(this.rangePicker);
  }

  appendColumnCharts() {
    const {from, to} = this.RANGE;
    const {ordersChart, salesChart, customersChart} = this.subElements;

    this.ordersChart = new ColumnChart({ url: `${this.API_URL}/orders`, range: { from, to }, label: 'orders', link: '#' });
    this.salesChart = new ColumnChart({ url: `${this.API_URL}/sales`, range: { from, to }, label: 'sales', formatHeading: data => `$${data}` });
    this.customersChart = new ColumnChart({ url: `${this.API_URL}/customers`, range: { from, to }, label: 'customers' });

    ordersChart.append(this.ordersChart.element);
    salesChart.append(this.salesChart.element);
    customersChart.append(this.customersChart.element);
  }

  appendSortableTable() {
    this.sortableTable = new SortableTable(header, {
      url: `${this.API_URL}/bestsellers`,
      isSortLocally: true
    });
    
    this.subElements.sortableTable.append(this.sortableTable.element);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template();
    this.element = element.firstElementChild;
    
    this.subElements = this.getSubElements(this.element);

    this.appendRangePicker();
    this.appendColumnCharts();
    this.appendSortableTable();
    
    this.setEventListeners();
    this.switchProgressBar('off');
  
    return this.element;
  }

  getSubElements() { 
    const res = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      res[subElement.dataset.element] = subElement;
    }
    return res;
  }

  switchProgressBar(switchType) {
    if (!this.progressBar) {this.progressBar = document.querySelector('.progress-bar');}

    if (switchType === 'on') {this.progressBar.hidden = false;}
    else if (switchType === 'off') {this.progressBar.hidden = true;}
  }

  handleDateSelect = (event) => {
    this.switchProgressBar('on');

    const {detail: {from, to}} = event;
    
    this.updateSortableTable(from, to);
    this.ordersChart.update(from, to);
    this.salesChart.update(from, to);
    this.customersChart.update(from, to);
    
    this.switchProgressBar('off');
  }

  fetchDataSortableTable(from, to) {
    const [start, end] = [1, 20];
    const url = new URL(`${this.API_URL}/bestsellers`, BACKEND_URL);

    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);

    return fetchJson(url);
  }

  async updateSortableTable(from, to) {
    this.sortableTable.element.classList.add('sortable-table_loading');
    
    const data = await this.fetchDataSortableTable(from, to);

    this.sortableTable.renderRows(data);
    this.sortableTable.element.classList.remove('sortable-table_loading');
  }

  setEventListeners() {
    this.element.addEventListener('date-select', this.handleDateSelect);
  }

  remove() {
    this.element?.remove();
    this.removeEventListeners();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}