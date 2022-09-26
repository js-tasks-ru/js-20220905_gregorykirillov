export default class NotificationMessage {
    static activeNotification;
    element;
    timerId;
  
    constructor(message = '', {
      duration = 1000,
      type = 'success',
    } = {}) {
      this.message = message;
      this.type = type;
      this.duration = duration;
  
      this.createElement();
    }
  
    get template() {
      return `
          <div class="notification ${this.type}" style="--value:${this.duration}ms">
              <div class="timer"></div>
              <div class="inner-wrapper">
                  <div class="notification-header">${this.type}</div>
                  <div class="notification-body">
                      ${this.message}
                  </div>
              </div>
          </div>
      `;
    }
  
    createElement() {
      if (NotificationMessage.activeNotification) {NotificationMessage.activeNotification.remove();}
  
      const element = document.createElement("div");
      element.innerHTML = this.template;
  
      this.element = element.lastElementChild;
      NotificationMessage.activeNotification = this.element;
    }
  
    show(parent = document.body) {
      parent.append(this.element);
      this.timerId = setTimeout(() => this.remove(), this.duration);
    }
  
    removeTimeout(timeout = this.timerId) {
      if (timeout) {clearTimeout(timeout);}
    }
  
    remove() {
      this.element?.remove();
      this.removeTimeout();
    }
  
    destroy() {
      this.remove();
      this.element = null;
      NotificationMessage.activeNotification.remove();
    }
}