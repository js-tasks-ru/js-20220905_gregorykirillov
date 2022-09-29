class Tooltip {
  static #tooltip = null;
  currentTooltipText = '';
  element;

  TOOLTIP_GAP = 10;
  
  initialize () {
    document.addEventListener('pointerover', this.handlePointerOver);
    document.addEventListener('pointerout', this.handlePointerOut);
  }

  constructor() {
    if (!Tooltip.#tooltip) {
      Tooltip.#tooltip = this;
    } else {
      return Tooltip.#tooltip;
    }
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    this.element.innerHTML = this.currentTooltipText;
    document.body.append(this.element);
    document.addEventListener('pointermove', this.handlePointerMove);
  }

  handlePointerOver = e => {
    if (!e.target?.dataset?.tooltip) {return;}

    this.currentTooltipText = e.target.dataset.tooltip;
    this.render();
  }

  handlePointerOut = () => {
    this.element?.remove();
    this.element = null;
  }

  handlePointerMove = e => {
    if (!this.element) {return;}

    this.element.style.top = `${e.clientY + this.TOOLTIP_GAP}px`;
    this.element.style.left = `${e.clientX + this.TOOLTIP_GAP}px`;
  }

  remove() {
    this.element?.remove();
    document.removeEventListener("pointerover", this.handlePointerOver);
    document.removeEventListener("pointerout", this.handlePointerOut);
    document.removeEventListener("pointermove", this.handlePointerMove);
  }

  destroy() {
    this.remove();
  }
}

export default Tooltip;