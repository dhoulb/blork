export declare type Types = string | TypeFunction | TypesArray | TypesObject;
export declare type TypeFunction = () => void;
export interface TypesArray extends Array<Types> {
}
export interface TypesObject {
    [key: string]: Types;
}
export declare type CheckerReturns = true | string;
export declare type CheckerFunction = (v: any) => CheckerReturns;
export interface ErrorConstructor {
    new (message: string): object;
}
export interface ArgumentsObject {
    [key: string]: any;
    length: number;
}
