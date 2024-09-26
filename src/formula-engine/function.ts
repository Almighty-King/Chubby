const SUM = (args: number[]) => {
    return args.reduce((acc, cur) => Number(acc) + Number(cur), 0);
};

const AVERAGE = (args: number[]) => {
    return SUM(args) / args.length;
};

const MAX = (args: number[]) => {
    return Math.max(...args);
};

const MIN = (args: number[]) => {
    return Math.min(...args)
};

const COUNT = (args: number[]) => {
    return args.length;
};

const ABS = (args: number[]) => {
    return Math.abs(args[0]);
};

const CEIL = (args: number[]) => {
    return Math.ceil(args[0]);
};

const FLOOR = (args: number[]) => {
    return Math.floor(args[0]);
};

const ROUND = (args: number[]) => {
    return Math.round(args[0]);
};

export const functionMap: Record<string, (args: any) => any> = {
    SUM,
    AVERAGE,
    MAX,
    MIN,
    COUNT,
    ABS,
    CEIL,
    FLOOR,
    ROUND,
};
