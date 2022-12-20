type Options = {
  autoScale?: boolean;
  onHint?: (type: HintType, acknowledgeCallback: () => void) => void;
};
type Point = { x: number; y: number };

type HintType = "wheel" | "pan";

class ModernPanZoom {
  options: Options;
  element: HTMLElement;
  coords: Point;
  _scale: number;
  currentPoint?: Point;
  initialDistance?: number;
  muteHints?: boolean;

  constructor(element: HTMLElement, options: Options) {
    this.coords = { x: 0, y: 0 };
    this.element = element;
    this._scale = 1;
    this.options = options;

    this.options.autoScale && this.calculateAutoScale();
    this.setupListeners();
    this.updateTransform();
  }

  setupListeners() {
    this.element.addEventListener("wheel", this.handleMouseWheel.bind(this));
    this.element.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.element.addEventListener("touchmove", this.handleTouchMove.bind(this));
    document.addEventListener("touchend", this.onTouchEnd.bind(this));

    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  removeListeners() {
    this.element.removeEventListener("wheel", this.handleMouseWheel.bind(this));
    this.element.removeEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.element.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this)
    );
    document.removeEventListener("touchend", this.onTouchEnd.bind(this));

    this.element.removeEventListener("mousedown", this.onMouseDown.bind(this));
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener("mouseup", this.onMouseUp.bind(this));
  }

  set scale(level) {
    this._scale = Math.min(Math.max(level, 0.2), 4);
  }

  get scale() {
    return this._scale;
  }

  calculateAutoScale() {
    const { width, height } = this.element.getBoundingClientRect();
    const childElements = Object.values(
      this.element.childNodes
    ) as HTMLElement[];
    const left = Math.min(
      ...childElements.map((el) => el.getBoundingClientRect().left)
    );
    const right = Math.max(
      ...childElements.map((el) => el.getBoundingClientRect().right)
    );
    const childWidth = right - left;
    const top = Math.min(
      ...childElements.map((el) => el.getBoundingClientRect().top)
    );
    const bottom = Math.max(
      ...childElements.map((el) => el.getBoundingClientRect().bottom)
    );
    const childHeight = bottom - top;
    this.scale = Math.min(
      (width * 0.85) / childWidth,
      (height * 0.85) / childHeight
    );
  }

  onMouseDown(event: MouseEvent) {
    this.currentPoint = {
      x: event.clientX,
      y: event.clientY,
    };
  }
  onMouseMove(event: MouseEvent) {
    if (!this.currentPoint) {
      return;
    }
    event.preventDefault();

    this.coords.x = this.coords.x - (this.currentPoint.x - event.x);
    this.coords.y = this.coords.y - (this.currentPoint.y - event.y);

    this.updateTransform();
    this.currentPoint = {
      x: event.clientX,
      y: event.clientY,
    };
  }
  onMouseUp() {
    delete this.currentPoint;
  }

  private handleTouchStart(event: TouchEvent) {
    if (event.touches.length < 2) {
      return;
    }
    event.preventDefault();
    // Store the initial touch positions
    var touch1 = event.touches[0];
    var touch2 = event.touches[1];

    // Calculate the initial distance between the touches
    var distance = Math.sqrt(
      (touch1.clientX - touch2.clientX) ** 2 +
        (touch1.clientY - touch2.clientY) ** 2
    );
    // Store the distance in a global variable for use in the touchmove event
    this.initialDistance = distance;

    this.currentPoint = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  handleTouchMove(event: TouchEvent) {
    if (event.touches.length != 2) {
      this.sendHint("pan");
      return;
    }

    if (!this.currentPoint || !this.initialDistance) return;
    event.preventDefault();

    // Get the current touch positions
    var touch1 = event.touches[0];
    var touch2 = event.touches[1];
    // Calculate the current distance between the touches
    var distance = Math.sqrt(
      (touch1.clientX - touch2.clientX) ** 2 +
        (touch1.clientY - touch2.clientY) ** 2
    );
    // Calculate the difference between the current distance and the initial distance
    var delta = distance - this.initialDistance;
    // Calculate the new zoom level based on the distance difference
    this.scale += delta * 0.005;

    const midX = (touch1.clientX + touch2.clientX) / 2;
    const midY = (touch1.clientY + touch2.clientY) / 2;
    this.coords.x = this.coords.x - (this.currentPoint.x - midX);
    this.coords.y = this.coords.y - (this.currentPoint.y - midY);

    this.updateTransform();

    this.currentPoint = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
    this.initialDistance = distance;
  }

  onTouchEnd() {
    delete this.currentPoint;
  }

  handleMouseWheel(event: WheelEvent) {
    // Check if the Ctrl key is held down
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      // Calculate the new zoom level based on the mouse wheel delta
      this.scale -= event.deltaY * 0.003;
      this.updateTransform();
    } else {
      this.sendHint("wheel");
    }
  }

  sendHint(type: HintType) {
    if (this?.options?.onHint && !this.muteHints) {
      this?.options?.onHint(type, () => {
        delete this.muteHints;
      });
      this.muteHints = true;
    }
  }

  updateTransform() {
    const transform = `translate3d(${this.coords.x}px, ${this.coords.y}px, 0) scale(${this.scale})`;
    const childElements = Object.values(
      this.element.childNodes
    ) as HTMLElement[];
    childElements.forEach((node) => (node.style.transform = transform));
  }
}

export default ModernPanZoom;
