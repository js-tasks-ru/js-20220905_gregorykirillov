export default class ColumnChart {
    chartHeight = 50;
 
    constructor({
      label,
      link,
      data = [],
      value = 0,
      formatHeading = (v) => v
    } = {}) {
      this.label = label;
      this.link = link;
      this.data = data;
      this.value = value;
      this.heading = formatHeading(this.value);
 
      this.renderColumnChart();
    }
 
    get templateColumnChart() {
      return `
            <div class='column-chart column-chart_loading'>
                <div class='column-chart__title'>
                    Total ${this.label}
                    ${this.link ? this.templateLink : ''}
                </div>
                <div class='column-chart__container'>
                    <div class='column-chart__header'>
                        ${this.heading}
                    </div>
                    <div class='column-chart__chart'>
                        ${this.renderColumns()}
                    </div>
                </div>
            </div>
        `;
    }
 
    get templateLink() {
      return this.link
        ? `<a class='column-chart__link' href=${this.link}>
                View all
            </a>`
        : '';
    }
 
    renderColumnChart() {
      const el = document.createElement("div");
      el.innerHTML = this.templateColumnChart;
      this.element = el.lastElementChild;
 
      if (this.data.length) {
        this.element.classList.remove("column-chart_loading");
      }
    }
 
    renderColumns() {
      if (!this.data.length) {return;}
 
      const max = Math.max(...this.data);
      const scale = this.chartHeight / max;
      const el = document.createElement('div');
 
      return this.data.map((value) => {
        const precent = `${((value / max) * 100).toFixed(0)}%`;
 
        el.style = `--value: ${Math.floor(value * scale)}`;
        el.dataset['tooltip'] = precent;
 
        return el.outerHTML;
      }).join("");
    }
 
    update(data) {
      this.data = data;
      this.renderColumnChart();
    }
 
    remove() {
      this.element.remove();
    }
 
    destroy() {
      this.remove();
    }
}