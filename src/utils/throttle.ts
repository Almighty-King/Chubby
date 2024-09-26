export const throttle = (func: Function, limit: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastRun: number | null = null;

    const wrapper = function(this: any, ...args: any[]) {
        const context = this;
        if (!lastRun) {
            lastRun = Date.now();
            func.apply(context, args);
        } else {
            if (timer) {
                clearTimeout(timer);
            }
            const now = Date.now();
            if (now - lastRun >= limit) {
                func.apply(context, args);
                lastRun = now;
            } else {
                timer = setTimeout(() => {
                    func.apply(context, args);
                    timer = null;
                }, limit - (now - lastRun));
            }
        }
    }
    return wrapper;
}