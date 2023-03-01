function uuid4() {
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

class EmptyCoordinate {}

class Shape {
    move(x, y) {
        if (this.level.__reset__) {
            return;
        }
        this.remove();
        this.x = x;
        this.y = y;
        this.draw();
    }

    remove() {
        delete this.level.state[this.id];
        this.level.clear();
        for (let drawCallback in this.level.state) {
            this.level.state[drawCallback]();
        }
    }

    left(distance=10) {
        this.move(this.x - distance, this.y);
    }

    right(distance=10) {
        this.move(this.x + distance, this.y);
    }

    up(distance=10) {
        this.move(this.x, this.y - distance);
    }

    down(distance=10) {
        this.move(this.x, this.y + distance);
    }

    northeast(distance=10) {
        this.up(distance);
        this.right(distance);
    }

    northwest(distance=10) {
        this.up(distance);
        this.left(distance);
    }

    southeast(distance=10) {
        this.down(distance);
        this.right(distance);
    }

    southwest(distance=10) {
        this.down(distance);
        this.left(distance);
    }
}

class Circle extends Shape {
    constructor(connector, x, y, radius=10, options={}) {
        super();
        this.id = uuid4();
        this.level = connector.level;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.options = options;
        this.draw();
    }

    draw() {
        this.level.drawCircle(this.x, this.y, this.radius, this.options, this.id);
    }
}

class Rectangle extends Shape {
    constructor(connector, x, y, width=10, height=10, options={}) {
        super();
        this.id = uuid4();
        this.level = connector.level;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.options = options;
        this.draw();
    }

    draw() {
        this.level.drawRectangle(this.x, this.y, this.width, this.height, this.options, this.id);
    }
}

class Square extends Shape {
    constructor(connector, x, y, sideLength=10, options={}) {
        super();
        this.id = uuid4();
        this.level = connector.level;
        this.x = x;
        this.y = y;
        this.sideLength = sideLength;
        this.options = options;
        this.draw();
    }

    draw() {
        this.level.drawSquare(this.x, this.y, this.sideLength, this.options, this.id);
    }
}

class Label extends Shape {
    constructor(connector, text, x, y, options={}) {
        super();
        this.id = uuid4();
        this.level = connector.level;
        this.text = text;
        this.x = x;
        this.y = y;
        this.options = options;
        this.draw();
    }

    draw() {
        this.level.drawText(this.text, this.x, this.y, this.options, this.id);
    }

    update(options) {
        if (options.hasOwnProperty("text")) {
            this.text = options.text;
        }
        this.move(this.x, this.y);
    }
}

class Level {
    constructor(connector) {
        this.viewer = document.createElement("canvas");
        this.setScreenSize();
        this.context = this.viewer.getContext("2d");
        this.state = {};
        this.__reset__ = false;
        this.mouseX = new EmptyCoordinate();
        this.mouseY = new EmptyCoordinate();
        this.width = this.viewer.width;
        this.height = this.viewer.height;
        this.mouseDown = false;
        connector.parent.appendChild(this.viewer);
    }

    drawText = (text, x, y, options={}, id=uuid4()) => {
        this.state[id] = () => {
            let font = "30px Arial";
            let filled = true;
            let fillColor = "black";
            let borderColor = "black";
            if (options.hasOwnProperty("font")) {
                font = options.font;
            }
            if (options.hasOwnProperty("filled")) {
                filled = options.filled;
            }
            if (options.hasOwnProperty("fillColor")) {
                fillColor = options.fillColor;
                borderColor = options.fillColor;
            }
            if (options.hasOwnProperty("borderColor")) {
                borderColor = options.borderColor;
            }
            this.context.font = font;
            if (filled === true) {
                this.context.fillText(text, x, y);
            } else if (filled === false) {
                this.context.strokeText(text, x, y);
            } else {
                throw new Error("filled option is not a Booleon.");
            }
        };
        this.state[Object.keys(this.state).pop()]();
    }

    drawSquare = (x, y, side=10, options={}, id=uuid4()) => {
        this.drawRectangle(x, y, side, side, options, id);
    }

    drawLine = (to, from=[0, 0], options={}, id=uuid4()) => {
        this.state[id] = () => {
            let lineColor = "black";
            this.context.beginPath();
            if (options.hasOwnProperty("lineColor")) {
                lineColor = options.lineColor;
            }
            this.context.moveTo(from[0], from[1]);
            this.context.lineTo(to[0], to[1]);
            this.context.strokeStyle = lineColor;
            this.context.stroke();
            this.context.closePath();
        }
        this.state[Object.keys(this.state).pop()]();
    }

    drawRectangle(x, y, width=10, height=10, options={}, id=uuid4()) {
        this.state[id] = () => {
            let fillColor = null;
            let borderColor = "black";
            this.context.beginPath();
            if (options.hasOwnProperty("fillColor")) {
                fillColor = options.fillColor;
            }
            if (options.hasOwnProperty("borderColor")) {
                borderColor = options.borderColor;
            }
            this.context.rect(x, y, width, height);
            if (fillColor !== null) {
                this.context.fillStyle = fillColor;
                this.context.fill();
            }
            this.context.strokeStyle = borderColor;
            this.context.closePath();
            this.context.stroke();
        };
        this.state[Object.keys(this.state).pop()]();
    }

    drawCircle(x, y, radius=10, options={}, id=uuid4()) {
        this.state[id] = () => {
            let fillColor = null;
            let borderColor = "black";
            this.context.beginPath();
            if (options.hasOwnProperty("fillColor")) {
                fillColor = options.fillColor;
            }
            if (options.hasOwnProperty("borderColor")) {
                borderColor = options.borderColor;
            }
            this.context.arc(x, y, radius, 0, Math.PI * 2);
            if (fillColor !== null) {
                this.context.fillStyle = fillColor;
                this.context.fill();
            }
            this.context.strokeStyle = borderColor;
            this.context.closePath();
            this.context.stroke();
        };
        this.state[Object.keys(this.state).at(-1)]();
    }

    setBackgroundColor(color) {
        this.viewer.style.background = color;
    }

    reset() {
        this.clear();
        this.state = {};
        this.__reset__ = true;
    }

    stop() {
        
    }

    clear() {
        this.context.clearRect(0, 0, this.viewer.width, this.viewer.height);
    }

    setScreenSize(width=window.innerWidth, height=window.innerHeight, fillScreen=true) {
        this.viewer.width = width;
        this.viewer.height = height;
        if (fillScreen === true) {
            window.onresize = event => {
                this.setScreenSize(window.innerWidth, window.innerHeight);
                this.width = width;
                this.height = height;
            }
        } else {
            window.onresize = event => {}
        }
    }
}

class playitjsConnector {
    #rl;

    constructor(callback = (connector) => {}, parent=document.body) {
        this.parent = parent;
        this.#rl = new Level(this);
        this.level.viewer.addEventListener("mousemove", event => {
            this.level.mouseX = event.pageX;
            this.level.mouseY = event.pageY;
        });
        this.level.viewer.addEventListener("mousedown", event => {
            this.level.mouseX = event.pageX;
            this.level.mouseY = event.pageY;
            this.level.mouseDown = true;
        });
        this.level.viewer.addEventListener("mouseup", event => {
            this.level.mouseX = event.pageX;
            this.level.mouseY = event.pageY;
            this.level.mouseDown = false;
        });
        let callbacks = callback(this);
        this.runCallback = () => {};
        if (callbacks.hasOwnProperty("run")) {
            this.runCallback = callbacks.run;
        }
        if (callbacks.hasOwnProperty("keyListener")) {
            parent.addEventListener("keydown", event => {
                let preventDefault = callbacks.keyListener(event.key);
                if (preventDefault === undefined) {
    
                } else if (preventDefault === true) {
                    event.preventDefault();
                }
            });
        }
    }

    get level() {
        return this.#rl;
    }

    set level(newLevel) {
        this.#rl.viewer.remove();
        this.#rl = newLevel;
    }
    
    run = () => {
        let delay = this.runCallback();
        if (delay === undefined || delay === null) {
            delay = 0;
        }
        setTimeout(() => {
                requestAnimationFrame(this.run);
            }, delay * 1000
        );
    }
}

function connect(callback = connector => {}, parent=document.body) {
    return new playitjsConnector(callback, parent);
}
