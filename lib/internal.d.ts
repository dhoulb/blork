import { Types, TypesArray, TypesObject, ErrorConstructor } from './types';
export declare function internalCheck(value: any, type: Types, name: string, err: ErrorConstructor): number;
export declare function internalCheckString(value: any, type: string, name: string, err: ErrorConstructor): 0 | 1;
export declare function internalCheckFunction(value: any, type: (() => void), name: string, err: ErrorConstructor): number;
export declare function internalCheckArray(value: any, type: TypesArray, name: string, err: ErrorConstructor): number;
export declare function internalCheckObject(value: any, type: TypesObject, name: string, err: ErrorConstructor): number;
