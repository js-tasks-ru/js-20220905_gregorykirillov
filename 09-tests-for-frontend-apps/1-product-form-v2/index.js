import SortableList from '../2-sortable-list/index.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const IMGUR_URL = 'https://api.imgur.com/3/image';
const BACKEND_URL = 'https://course-js.javascript.ru';
const API_PRODUCTS = '/api/rest/products';
const API_CATEGORIES = '/api/rest/categories';

export default class ProductForm {
  data = {};
  categories = [];
  fileInput = null;
  FIELDS = {
    title: 'string', description: 'string', quantity: 'number', subcategory: 'string',
    status: 'number', price: 'number', discount: 'number'
  };
  
  constructor (
    productId = null,
  ) {
    this.productId = productId;
    this.modeIsUpdate = !!productId;
  }
  
  setEventListeners() {
    this.subElements.productForm.addEventListener('click', this.handleClick);
    this.subElements.productForm.addEventListener('submit', this.save);
  }

  handleClick = (event) => {
    const uploadImg = event.target.closest("[name='uploadImage']");
    const deleteImg = event.target.closest("[data-delete-handle]");

    if (uploadImg) {
      this.uploadImg(uploadImg);
    }
    else if (deleteImg) {
      this.deleteImg(deleteImg);
    }
  }

  save = async(event) => {
    event.preventDefault();
    if (!this.subElements) {this.subElements = this.getSubElements();}
    const { productForm } = this.subElements;

    Object.keys(this.FIELDS).forEach(currField => {
      const {[currField]: field } = productForm;
      this.data[currField] = field.value;
    });

    try {
      const body = this.prepareData();
      const method = this.modeIsUpdate ? 'PATCH' : 'PUT';

      const url = new URL(API_PRODUCTS, BACKEND_URL);
      await fetchJson(url, {
        method,
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "Application/json",
        }
      });

      const eventType = this.modeIsUpdate ? "product-updated" : "product-saved";
      this.element.dispatchEvent(
        new CustomEvent(eventType, {
          bubbles: true,
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  getImagesInfo() {
    const imagesList = this.subElements.imageListContainer.querySelectorAll('li');

    if (!imagesList.length) {return [];}

    const images = [];

    for (const {children} of imagesList) {
      images.push({ url: children[0].value, source: children[1].value });
    }

    return images;
  }

  prepareData() {
    const data = this.data;
    data.images = this.getImagesInfo();

    for (const [key, value] of Object.entries(this.data)) {
      data[key] = this.FIELDS[key] === 'number' ? parseInt(value) : value;
    }

    return data;
  }

  async uploadImg(uploadButton) {
    const handleFileChange = async(fileInput) => {
      try {
        const [file] = fileInput.files;
        const formData = new FormData();

        formData.append('image', file);

        uploadButton.classList.add('is-loading');
        uploadButton.disabled = true;

        const res = await this.uploadToServer(formData, file.name);
        const img = { url: res.data.link, source: file.name };

        const imgElement = document.createElement('div');
        imgElement.innerHTML = this.imagesTemplate(img);
        
        const { imageListContainer } = this.subElements;
        imageListContainer.firstElementChild.append(imgElement.firstElementChild);

        if (!this.data?.images) {this.data.images = [];}
        this.data.images.push(img);

        uploadButton.classList.remove('is-loading');
      } catch (error) {
        console.error(error);
      }
    };

    if (!this.fileInputs) {
      this.fileInputs = [];
    }
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.hidden = true;
    fileInput.addEventListener('change', () => handleFileChange(fileInput));
    
    this.fileInputs.push(fileInput);
    document.body.append(fileInput);

    fileInput.click();
  }

  async uploadToServer(formData) {
    const res = await fetchJson(IMGUR_URL, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
    });

    return res;
  }

  deleteImg(element) {
    const src = element.parentNode.parentNode.children[1].value;
    const { imageListContainer } = this.subElements;
    this.data.images = this.data.images.filter(
      (image) => image.source !== src
    );
    const image = imageListContainer.querySelector(`[value='${src}']`);
    image.parentNode.remove();
  }

  async getCategories() {    
    const url = new URL(API_CATEGORIES, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    
    const data = await fetchJson(url);
    this.categories = data;
  }

  async getData() {
    if (this.productId === null) {return;}

    const url = new URL(API_PRODUCTS, BACKEND_URL);
    url.searchParams.set('id', this.productId);
    
    const data = await fetchJson(url);
    this.data = data[0];
  }

  async render() {
    await Promise.all([
      this.getData(),
      this.getCategories(),
    ]);

    if (!this.modeIsUpdate) {
      this.data = {};
      for (const key of Object.keys(this.FIELDS)) { this.data[key] = ''; }
      this.data['images'] = [];
    }

    const element = document.createElement('div');
    element.innerHTML = this.template();
    this.element = element.firstElementChild;
    
    this.subElements = this.getSubElements();
    this.setSortableList();
    if (this.modeIsUpdate) {this.updateData();}
    this.setEventListeners();

    return this.element;
  }

  getSortableList() {
    if (this.sortableList) {
      return this.sortableList;
    }

    return this.sortableList = new SortableList({
      items: this.data?.images?.map(image => {
        const element = document.createElement('li');
        element.innerHTML = this.imagesTemplate(image);
  
        return element.firstElementChild;
      })
    });
  }

  setSortableList() {
    this.getSortableList();

    const { imageListContainer } = this.subElements;
    imageListContainer.append(this.sortableList.element);
  }

  template() {
    return `
    <div class='product-form'>
      ${this.formTemplate}
    </div>`;
  }

  get formTemplate() {
    return `
    <form data-element='productForm' class='form-grid'>
      <div class='form-group form-group__half_left'>
        <fieldset>
          <label class='form-label'>Название товара</label>
          <input required='' type='text' name='title' class='form-control' placeholder='Название товара'>
        </fieldset>
      </div>
      <div class='form-group form-group__wide'>
        <label class='form-label'>Описание</label>
        <textarea required='' class='form-control' name='description' data-element='productDescription' placeholder='Описание товара'></textarea>
      </div>
      <div class='form-group form-group__wide' data-element='sortable-list-container'>
        <label class='form-label'>Фото</label>
        <div data-element='imageListContainer'></div>
        <button type='button' name='uploadImage' class='button-primary-outline'><span>Загрузить</span></button>
      </div>
      <div class='form-group form-group__half_left'>
        <label class='form-label'>Категория</label>
        <select class='form-control' name='subcategory'>
          ${this.categoriesTemplate()}
        </select>
      </div>
      <div class='form-group form-group__half_left form-group__two-col'>
        <fieldset>
          <label class='form-label'>Цена ($)</label>
          <input required='' type='number' name='price' class='form-control' placeholder='100'>
        </fieldset>
        <fieldset>
          <label class='form-label'>Скидка ($)</label>
          <input required='' type='number' name='discount' class='form-control' placeholder='0'>
        </fieldset>
      </div>
      <div class='form-group form-group__part-half'>
        <label class='form-label'>Количество</label>
        <input required='' type='number' class='form-control' name='quantity' placeholder='1'>
      </div>
      <div class='form-group form-group__part-half'>
        <label class='form-label'>Статус</label>
        <select class='form-control' name='status' data-element='status'>
          <option value='1'>Активен</option>
          <option value='0'>Неактивен</option>
        </select>
      </div>
      <div class='form-buttons'>
        <button type='submit' name='save' class='button-primary-outline'>
          Сохранить товар
        </button>
      </div>
    </form>`;
  }

  categoriesTemplate() {
    return this.categories.map(category => 
      category.subcategories?.map(subcategory => 
        `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`).join("")
    ).join("");
  }

  imagesTemplate(image) {
    return `
    <li class='products-edit__imagelist-item sortable-list__item' style=''>
      <input type='hidden' name='url' value='${image.url}'>
      <input type='hidden' name='source' value='${image.source}'>
      <span>
        <img src='icon-grab.svg' data-grab-handle='' alt='grab'>
        <img class='sortable-table__cell-img' alt='Image' src='${image.url}'>
        <span>${image.source}</span>
      </span>
      <button type='button'>
        <img src='icon-trash.svg' data-delete-handle='' alt='delete'>
      </button>
    </li>`;
  }

  updateData() {
    if (!this.subElements) {return;}
    const { productForm } = this.subElements;

    Object.keys(this.FIELDS).forEach(currField => {
      try {
        productForm[currField].value = this?.data?.[currField] ?? ''
      } catch(err) {
        console.error(err)
      }
    });

    this.setStatus();

    if (this.data?.length) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  setStatus() {
    const { status } = this.subElements;
    let value;
    if (!this.modeIsUpdate) {
      value = 1;
    } else {
      value = this.data?.status === 1 ? 0 : 1;
    } 
    status.children[value].setAttribute("selected", true);
  }

  getSubElements() {
    const res = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      res[subElement.dataset.element] = subElement;
    }
    return res;
  }

  remove() {
    this.element?.remove();
    this.subElements = {};
    this.fileInput = null;
  }

  destroy() {
    this.remove();
  }
}
