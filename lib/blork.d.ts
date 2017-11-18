import { CheckerFunction, ArgumentsObject, TypesArray, ErrorConstructor } from './types';
export declare function check(value: any, type: any, prefix?: string): number;
export declare function args(args: ArgumentsObject, types: TypesArray): number;
export declare function add(name: string, checker: CheckerFunction): void;
export declare function throws(err: ErrorConstructor): void;
