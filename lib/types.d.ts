export interface CheckerFunction {
    (v: any): true | string;
}
export interface ErrorConstructor {
    new (message: string): Object;
}
export interface ArgumentsObject {
    [key: string]: any;
    length: number;
}
export interface TypesArray extends Array<string | Function | TypesObject | TypesArray> {
}
export interface TypesObject {
    [key: string]: string | Function | TypesArray | TypesObject;
}
