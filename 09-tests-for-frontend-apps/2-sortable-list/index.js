export default class SortableList {
  constructor({items = []}) {
    this.items = items;
    this.render();
  }

  render() {
    this.items = this.prepareData(this.items);

    this.element = this.template();
    this.element.append(...this.items);

    this.setEventListeners();
  }

  setEventListeners() {
    this.element.addEventListener('pointerdown', this.handleDown);
    document.addEventListener('pointerup', this.handleUp);
  }

  handleDown = (event) => {
    event.preventDefault();
    const isDraggingElement = event.target.closest('[data-grab-handle]')?.closest('li');
    const isDeletingElement = event.target.closest('[data-delete-handle]')?.closest('li');

    if (isDraggingElement) {
      this.draggingElement = isDraggingElement;
      this.handleGrab(event);
    }
    else if (isDeletingElement) {
      this.handleDelete(isDeletingElement);
    }
  }

  handleUp = () => {
    if (!this.draggingElement) {return;}

    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.draggingElement.removeAttribute('style');
    this.placeholder.replaceWith(this.draggingElement);

    document.removeEventListener('pointermove', this.handleDrag);
  }

  createPlaceholder() {
    const placeholder = document.createElement('div');

    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.height = `${this.elementHeight}px`;
    placeholder.style.width = `${this.elementWidth}px`;

    return placeholder;
  }

  setElementSize() {
    const {height, width, top, left} = this.draggingElement.getBoundingClientRect();

    this.elementHeight = height;
    this.elementWidth = width;
    this.initialElementTop = top;
    this.initialElementLeft = left;
  }

  setInitialCoords(event) {
    this.initialY = event.clientY;
    this.initialX = event.clientX;
  }

  placePlaceholder() {
    const placeholder = this.createPlaceholder();
    this.placeholder = placeholder;
    this.draggingElement.closest('li').after(placeholder);
  }

  handleGrab(event) {
    this.setElementSize();
    this.draggingElement.classList.add('sortable-list__item_dragging');
    this.draggingElement.style.width = `${this.elementWidth}px`;

    this.setInitialCoords(event);
    this.placePlaceholder();
    
    document.addEventListener('pointermove', this.handleDrag);
  }

  handleDrag = (event) => {
    this.draggingElement.style.top = `${event.clientY - this.initialY + this.initialElementTop}px`;
    this.draggingElement.style.left = `${event.clientX - this.initialX + this.initialElementLeft}px`;

    this.draggingElement.style.visibility = 'hidden';
    const neighborhood = document.elementFromPoint(event.clientX, event.clientY)?.closest('li');
    this.draggingElement.style.visibility = 'visible';
    
    if (!neighborhood) {return;}
    const neighborhoodSizes = neighborhood.getBoundingClientRect();

    if (event.clientY - neighborhoodSizes.top < neighborhoodSizes.height / 2) {
      neighborhood.after(this.placeholder);
    } else if (neighborhoodSizes.bottom - event.clientY > 0) {
      neighborhood.before(this.placeholder);
    }
  }

  template() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');
    element.dataset.element = 'itemList';
    
    return element;
  }

  prepareData(items) {
    return items.map(item => {
      item.classList.add('sortable-list__item');
      
      return item;
    });
  }

  handleDelete(element) {
    element.remove();
  }

  remove() {
    document.removeEventListener('pointermove', this.handleDrag);
    document.removeEventListener('pointerup', this.handleUp);
    this.element?.remove();
  }

  destroy() {
    this.remove();
  }
}
