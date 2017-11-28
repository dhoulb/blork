import { CheckerFunction, ArgumentsObject, Types, TypesArray, ErrorConstructor } from './types';
export declare function check(value: any, type: Types, prefix?: string): number;
export declare function args(argsObj: ArgumentsObject, types: TypesArray): number;
export declare function add(name: string, checker: CheckerFunction): void;
export declare function throws(err: ErrorConstructor): void;
