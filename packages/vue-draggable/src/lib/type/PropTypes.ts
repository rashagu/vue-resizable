export const any = [Array, Object, String, Number, Boolean, Function];
export const array = Array;
export const bool = Boolean;
export const func = Function;
export const number = Number;
export const object = Object;
export const string = String;
export const node = [Array, Object, String, Number];
export const element = [Array, Object, String, Number];
export const symbol = Object;

export function oneOfType(arr: any[]) {
  let newArr: any = [];
  arr.map((item) => {
    if (Array.isArray(item)) {
      newArr = [...newArr, ...item];
    } else {
      newArr.push(item);
    }
  });

  return newArr;
}

type Prop =
  | ArrayConstructor
  | ObjectConstructor
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | FunctionConstructor
  | typeof any;
export function vuePropsMake(
  typeObj: Record<
    any,
    | {
        type: Prop;
        required?: boolean;
        default?: any;
        validator?(value: unknown): boolean;
      }
    | Prop
  >,
  defaultProps: { [key: string]: any }
) {
  const obj: any = {};
  Object.keys(typeObj).forEach((typeKey) => {
    // eslint-disable-next-line no-prototype-builtins
    if (defaultProps.hasOwnProperty(typeKey)) {
      // eslint-disable-next-line no-prototype-builtins
      if (typeObj[typeKey].hasOwnProperty("type")) {
        obj[typeKey] = {
          // @ts-ignore
          type: typeObj[typeKey].type,
          default: defaultProps[typeKey],
        };
      } else {
        const defaultValue =
          typeof defaultProps[typeKey] === "object"
            ? () => defaultProps[typeKey]
            : defaultProps[typeKey];
        obj[typeKey] = {
          type: typeObj[typeKey],
          default: defaultValue,
        };
      }
    } else {
      obj[typeKey] = {
        // eslint-disable-next-line no-prototype-builtins
        type: typeObj[typeKey].hasOwnProperty("type")
          ? // @ts-ignore
            typeObj[typeKey].type
          : typeObj[typeKey],
        default: undefined,
      };
    }
  });
  return obj;
}
