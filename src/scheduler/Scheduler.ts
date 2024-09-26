class TaskScheduler {
    private channel: MessageChannel;
    private MAX_TIME_SLICE: number;
    public highPriorityQueue: Function[];
    public lowPriorityQueue: Function[];
    constructor() {
        this.channel = new MessageChannel();
        this.MAX_TIME_SLICE = 5;
        this.highPriorityQueue = [];
        this.lowPriorityQueue = [];
        this.channel.port1.onmessage = this.processTasks.bind(this);
    }

    addTask(task: Function, priority = "HIGH", immediate = false, postMessage = true) {
        if (immediate) {
            this.highPriorityQueue.unshift(async() => {
                task();
            });
        }
        if (priority === "HIGH") {
            this.highPriorityQueue.push(async() => {
                task();
            });
        } else {
            this.lowPriorityQueue.push(async() => {
                task();
            });
        }
        if (postMessage) this.channel.port2.postMessage(null);
    }

    public postMessage() {
        this.channel.port2.postMessage(null);
    }

    processTasks() {
        const start = performance.now();
        while (performance.now() - start < this.MAX_TIME_SLICE) {
            if (this.highPriorityQueue.length > 0) {
                const task = this.highPriorityQueue.shift();
                if (task) {
                    task();
                }
            } else if (this.lowPriorityQueue.length > 0) {
                const task = this.lowPriorityQueue.shift();
                if (task) {
                    task();
                }
            } else {
                break;  // 没有任务时退出循环
            }

        }
        // 看还有没有剩余任务待执行
        if (this.highPriorityQueue.length > 0 || this.lowPriorityQueue.length > 0) {
            this.channel.port2.postMessage(null);
        }
    }
}

export default TaskScheduler;
