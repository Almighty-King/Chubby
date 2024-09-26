export const debounce = (fn: Function, delay: number, immediate = false) => {
    let timer: number | null = null;
    return function(...args: any[]) {
        const callNow = immediate && !timer;
        if (timer) clearTimeout(timer);
        
        timer = window.setTimeout(() => {
            if (!immediate) fn(...args);
            timer = null;
        }, delay);

        if (callNow) fn(...args);
    };
}