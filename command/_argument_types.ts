// deno-lint-ignore-file no-explicit-any
import type { Spread } from "./_spread.ts";
import type {
  CamelCase,
  Merge,
  MergeRecursive,
  TrimLeft,
  TrimRight,
} from "./_type_utils.ts";
import type { TypeOrTypeHandler } from "./types.ts";
import type { BooleanType } from "./types/boolean.ts";
import type { FileType } from "./types/file.ts";
import type { IntegerType } from "./types/integer.ts";
import type { NumberType } from "./types/number.ts";
import type { SecretType } from "./types/secret.ts";
import type { StringType } from "./types/string.ts";

type DefaultTypes = {
  number: NumberType;
  integer: IntegerType;
  string: StringType;
  boolean: BooleanType;
  file: FileType;
  secret: SecretType;
};

type OptionalOrRequiredValue<TType extends string> =
  | `[${TType}]`
  | `<${TType}>`;

type RestValue = `...${string}` | `${string}...`;

/**
 * Rest args with list type and completions.
 *
 * - `[...name:type[]:completion]`
 * - `<...name:type[]:completion>`
 * - `[name...:type[]:completion]`
 * - `<name...:type[]:completion>`
 */
type RestArgsListTypeCompletion<TType extends string> = OptionalOrRequiredValue<
  `${RestValue}:${TType}[]:${string}`
>;

/**
 * Rest args with list type.
 *
 * - `[...name:type[]]`
 * - `<...name:type[]>`
 * - `[name...:type[]]`
 * - `<name...:type[]>`
 */
type RestArgsListType<TType extends string> = OptionalOrRequiredValue<
  `${RestValue}:${TType}[]`
>;

/**
 * Rest args with type and completions.
 *
 * - `[...name:type:completion]`
 * - `<...name:type:completion>`
 * - `[name...:type:completion]`
 * - `<name...:type:completion>`
 */
type RestArgsTypeCompletion<TType extends string> = OptionalOrRequiredValue<
  `${RestValue}:${TType}:${string}`
>;

/**
 * Rest args with type.
 *
 * - `[...name:type]`
 * - `<...name:type>`
 * - `[name...:type]`
 * - `<name...:type>`
 */
type RestArgsType<TType extends string> = OptionalOrRequiredValue<
  `${RestValue}:${TType}`
>;

/**
 * Rest args.
 * - `[...name]`
 * - `<...name>`
 * - `[name...]`
 * - `<name...>`
 */
type RestArgs = OptionalOrRequiredValue<
  `${RestValue}`
>;

/**
 * Single arg with list type and completions.
 *
 * - `[name:type[]:completion]`
 * - `<name:type[]:completion>`
 */
type SingleArgListTypeCompletion<TType extends string> =
  OptionalOrRequiredValue<
    `${string}:${TType}[]:${string}`
  >;

/**
 * Single arg with list type.
 *
 * - `[name:type[]]`
 * - `<name:type[]>`
 */
type SingleArgListType<TType extends string> = OptionalOrRequiredValue<
  `${string}:${TType}[]`
>;

/**
 * Single arg  with type and completion.
 *
 * - `[name:type:completion]`
 * - `<name:type:completion>`
 */
type SingleArgTypeCompletion<TType extends string> = OptionalOrRequiredValue<
  `${string}:${TType}:${string}`
>;

/**
 * Single arg with type.
 *
 * - `[name:type]`
 * - `<name:type>`
 */
type SingleArgType<TType extends string> = OptionalOrRequiredValue<
  `${string}:${TType}`
>;

/**
 * Single arg.
 *
 * - `[name]`
 * - `<name>`
 */
type SingleArg = OptionalOrRequiredValue<
  `${string}`
>;

type ArgumentType<
  TArg extends string,
  TCustomTypes,
  TTypes = Merge<DefaultTypes, TCustomTypes>,
> = TArg extends RestArgsListTypeCompletion<infer Type>
  ? TTypes extends Record<Type, infer R> ? Array<Array<R>> : unknown
  : TArg extends RestArgsListType<infer Type>
    ? TTypes extends Record<Type, infer R> ? Array<Array<R>> : unknown
  : TArg extends RestArgsTypeCompletion<infer Type>
    ? TTypes extends Record<Type, infer R> ? Array<R> : unknown
  : TArg extends RestArgsType<infer Type>
    ? TTypes extends Record<Type, infer R> ? Array<R> : unknown
  : TArg extends RestArgs ? Array<string>
  : TArg extends SingleArgListTypeCompletion<infer Type>
    ? TTypes extends Record<Type, infer R> ? Array<R> : unknown
  : TArg extends SingleArgListType<infer Type>
    ? TTypes extends Record<Type, infer R> ? Array<R> : unknown
  : TArg extends SingleArgTypeCompletion<infer Type>
    ? TTypes extends Record<Type, infer R> ? R : unknown
  : TArg extends SingleArgType<infer Type>
    ? TTypes extends Record<Type, infer R> ? R : unknown
  : TArg extends SingleArg ? string
  : unknown;

type ArgumentTypes<TFlags extends string, T> = TFlags extends
  `${string} ${string}` ? TypedArguments<TFlags, T>
  : ArgumentType<TFlags, T>;

export type TypedArguments<TArgs extends string, TTypes> = number extends TTypes
  ? any
  : TArgs extends `${infer TArg} ${infer TRestArgs}`
    ? TArg extends `[${string}]`
      ? [ArgumentType<TArg, TTypes>?, ...TypedArguments<TRestArgs, TTypes>]
    : [ArgumentType<TArg, TTypes>, ...TypedArguments<TRestArgs, TTypes>]
  : TArgs extends `${string}...${string}` ? [
      ...ArgumentType<TArgs, TTypes> extends ReadonlyArray<infer TValue>
        ? TArgs extends `[${string}]` ? Array<TValue>
        : [TValue, ...Array<TValue>]
        : never,
    ]
  : TArgs extends `[${string}]` ? [ArgumentType<TArgs, TTypes>?]
  : [ArgumentType<TArgs, TTypes>];

export type TypedArgument<
  TArg extends string,
  TTypes,
  TDefault = undefined,
> = number extends TTypes ? any
  : TArg extends `${string}...${string}`
    ? ArgumentType<TArg, TTypes> extends ReadonlyArray<infer TValue>
      ? TArg extends `[${string}]`
        ? Array<TValue> | MakeArray<NonNullable<TDefault>>
      : [TValue, ...Array<TValue>] | MakeArray<NonNullable<TDefault>>
    : never
  : TArg extends `[${string}]`
    ? IsRequired<TDefault extends undefined ? false : true, TDefault> extends
      true ? [NonNullable<TDefault> | ArgumentType<TArg, TTypes>]
    : [(TDefault | ArgumentType<TArg, TTypes>)?]
  : [NonNullable<TDefault> | ArgumentType<TArg, TTypes>];

export type TypedArgumentValue<
  TArg extends string,
  TTypes,
  TDefault = undefined,
> = number extends TTypes ? any
  : TArg extends `${string}...${string}`
    ? ArgumentType<TArg, TTypes> extends ReadonlyArray<infer TValue>
      ? TArg extends `[${string}]` ? NonNullable<TDefault> | Array<TValue>
      : NonNullable<TDefault> | [TValue, ...Array<TValue>]
    : never
  : NonNullable<TDefault> | ArgumentType<TArg, TTypes>;

export type TypedCommandArguments<TNameAndArguments extends string, TTypes> =
  number extends TTypes ? any
    : TNameAndArguments extends `${string} ${infer TFlags}`
      ? TypedArguments<TFlags, TTypes>
    : [];

export type TypedOption<
  TFlags extends string,
  TOptions,
  TTypes,
  TRequired extends boolean | undefined = undefined,
  TDefault = undefined,
> = number extends TTypes ? any
  : TFlags extends `${string}--${infer Name}=${infer TRestFlags}`
    ? ValuesOption<
      Name,
      TRestFlags,
      TTypes,
      IsRequired<TRequired, TDefault>,
      TDefault
    >
  : TFlags extends `${string}--${infer Name} ${infer TRestFlags}`
    ? ValuesOption<
      Name,
      TRestFlags,
      TTypes,
      IsRequired<TRequired, TDefault>,
      TDefault
    >
  : TFlags extends `${string}--${infer Name}`
    ? BooleanOption<Name, TOptions, IsRequired<TRequired, TDefault>, TDefault>
  : TFlags extends `-${infer Name}=${infer TRestFlags}` ? ValuesOption<
      Name,
      TRestFlags,
      TTypes,
      IsRequired<TRequired, TDefault>,
      TDefault
    >
  : TFlags extends `-${infer Name} ${infer TRestFlags}` ? ValuesOption<
      Name,
      TRestFlags,
      TTypes,
      IsRequired<TRequired, TDefault>,
      TDefault
    >
  : TFlags extends `-${infer Name}`
    ? BooleanOption<Name, TOptions, IsRequired<TRequired, TDefault>, TDefault>
  : Record<string, unknown>;

export type TypedEnv<
  TNameAndValue extends string,
  TPrefix extends string | undefined,
  TOptions,
  TTypes,
  TRequired extends boolean | undefined = undefined,
  TDefault = undefined,
> = number extends TTypes ? any
  : TrimLeft<TNameAndValue, TPrefix> extends infer TrimmedNameAndValue
    ? TrimmedNameAndValue extends `${infer Name}=${infer Rest}`
      ? ValueOption<Name, Rest, TTypes, TRequired, TDefault>
    : TrimmedNameAndValue extends `${infer Name} ${infer Rest}`
      ? ValueOption<Name, Rest, TTypes, TRequired, TDefault>
    : TrimmedNameAndValue extends `${infer Name}`
      ? BooleanOption<Name, TOptions, TRequired, TDefault>
    : never
  : Record<string, unknown>;

export type TypedType<
  TName extends string,
  THandler extends TypeOrTypeHandler<unknown>,
> = { [Name in TName]: THandler };

type BooleanOption<
  TName extends string,
  TOptions,
  TRequired extends boolean | undefined = undefined,
  TDefault = undefined,
> = TName extends `no-${infer Name}` ? NegatableOption<Name, TOptions, TDefault>
  : TName extends `${infer Name}.${infer Rest}` ? (TRequired extends true ? {
        [Key in OptionName<Name>]: BooleanOption<
          Rest,
          TOptions,
          TRequired,
          TDefault
        >;
      }
      : {
        [Key in OptionName<Name>]?: BooleanOption<
          Rest,
          TOptions,
          TRequired,
          TDefault
        >;
      })
  : (TRequired extends true
    ? { [Key in OptionName<TName>]: true | NonNullable<TDefault> }
    : { [Key in OptionName<TName>]?: true | TDefault });

type NegatableOption<
  TName extends string,
  TOptions,
  TDefault,
> = OptionName<TName> extends infer Name extends string
  ? TDefault extends undefined
    ? Name extends keyof TOptions ? { [Key in Name]?: false }
    : { [Key in Name]: boolean }
  : { [Key in Name]: NonNullable<TDefault> | false }
  : never;

type ValueOption<
  TName extends string,
  TRestFlags extends string,
  TTypes,
  TRequired extends boolean | undefined = undefined,
  TDefault = undefined,
> = TName extends `${infer Name}.${infer RestName}`
  ? (TRequired extends true ? {
      [Key in OptionName<Name>]: ValueOption<
        RestName,
        TRestFlags,
        TTypes,
        TRequired,
        TDefault
      >;
    }
    : {
      [Key in OptionName<Name>]?: ValueOption<
        RestName,
        TRestFlags,
        TTypes,
        TRequired,
        TDefault
      >;
    })
  : (TRequired extends true ? {
      [Key in OptionName<TName>]: ExtractArgumentsFromFlags<TRestFlags> extends
        `[${string}]` ?
          | NonNullable<TDefault>
          | true
          | ArgumentType<ExtractArgumentsFromFlags<TRestFlags>, TTypes>
        :
          | NonNullable<TDefault>
          | ArgumentType<ExtractArgumentsFromFlags<TRestFlags>, TTypes>;
    }
    : {
      [Key in OptionName<TName>]?: ExtractArgumentsFromFlags<TRestFlags> extends
        `[${string}]` ?
          | NonNullable<TDefault>
          | true
          | ArgumentType<ExtractArgumentsFromFlags<TRestFlags>, TTypes>
        :
          | NonNullable<TDefault>
          | ArgumentType<ExtractArgumentsFromFlags<TRestFlags>, TTypes>;
    });

type ValuesOption<
  TName extends string,
  TRestFlags extends string,
  TTypes,
  TRequired extends boolean | undefined = undefined,
  TDefault = undefined,
> = TName extends `${infer Name}.${infer RestName}`
  ? (TRequired extends true ? {
      [Key in OptionName<Name>]: ValuesOption<
        RestName,
        TRestFlags,
        TTypes,
        TRequired,
        TDefault
      >;
    }
    : {
      [Key in OptionName<Name>]?: ValuesOption<
        RestName,
        TRestFlags,
        TTypes,
        TRequired,
        TDefault
      >;
    })
  : (TRequired extends true ? {
      [Key in OptionName<TName>]: ExtractArgumentsFromFlags<TRestFlags> extends
        `[${string}]` ?
          | NonNullable<TDefault>
          | true
          | ArgumentTypes<ExtractArgumentsFromFlags<TRestFlags>, TTypes>
        :
          | NonNullable<TDefault>
          | ArgumentTypes<ExtractArgumentsFromFlags<TRestFlags>, TTypes>;
    }
    : {
      [Key in OptionName<TName>]?: ExtractArgumentsFromFlags<TRestFlags> extends
        `[${string}]` ?
          | NonNullable<TDefault>
          | true
          | ArgumentTypes<ExtractArgumentsFromFlags<TRestFlags>, TTypes>
        :
          | NonNullable<TDefault>
          | ArgumentTypes<ExtractArgumentsFromFlags<TRestFlags>, TTypes>;
    });

export type MergeOptions<
  TFlags,
  TOptions,
  TMappedOptions,
  TName = GetOptionName<TFlags>,
> = TName extends `no-${string}` ? Spread<TOptions, TMappedOptions>
  : TName extends `${string}.${string}`
    ? MergeRecursive<TOptions, TMappedOptions>
  : Merge<TOptions, TMappedOptions>;

// type MergeOptions<T, CO, O, N = GetOptionName<T>> = N extends `no-${string}`
//   ? Spread<CO, O>
//   : N extends `${infer Name}.${infer Child}`
//     ? (OptionName<Name> extends keyof Merge<CO, O>
//       ? OptionName<Child> extends
//         keyof NonNullable<Merge<CO, O>[OptionName<Name>]> ? SpreadTwo<CO, O>
//       : MergeRecursive<CO, O>
//       : MergeRecursive<CO, O>)
//   : Merge<CO, O>;

export type MapValue<TOptions, TMappedOptions, TCollect = undefined> =
  TMappedOptions extends undefined ? TCollect extends true ? {
        [Key in keyof TOptions]: TOptions[Key] extends
          (Record<string, unknown> | undefined)
          ? MapValue<TOptions[Key], TMappedOptions, TCollect>
          // Make values of wildcard options always optional.
          : string extends Key ? Array<NonNullable<TOptions[Key]>> | undefined
          : Array<NonNullable<TOptions[Key]>>;
      }
    : {
      [Key in keyof TOptions]: TOptions[Key] extends
        (Record<string, unknown> | undefined)
        ? MapValue<TOptions[Key], TMappedOptions, TCollect>
        // Make values of wildcard options always optional.
        : string extends Key ? TOptions[Key] | undefined
        : TOptions[Key];
    }
    : {
      [Key in keyof TOptions]: TOptions[Key] extends
        (Record<string, unknown> | undefined)
        ? MapValue<TOptions[Key], TMappedOptions, TCollect>
        : TMappedOptions;
    };

export type MapTypes<T> = T extends TypeOrTypeHandler<infer V> ? V
  : T extends Record<string, unknown> | ReadonlyArray<unknown>
    ? { [K in keyof T]: MapTypes<T[K]> }
  : T;

type GetOptionName<TFlags> = TFlags extends `${string}--${infer Name}=${string}`
  ? TrimRight<Name, ",">
  : TFlags extends `${string}--${infer Name} ${string}` ? TrimRight<Name, ",">
  : TFlags extends `${string}--${infer Name}` ? Name
  : TFlags extends `-${infer Name}=${string}` ? TrimRight<Name, ",">
  : TFlags extends `-${infer Name} ${string}` ? TrimRight<Name, ",">
  : TFlags extends `-${infer Name}` ? Name
  : unknown;

type ExtractArgumentsFromFlags<TFlags extends string> = TFlags extends
  `-${string}=${infer RestFlags}` ? ExtractArgumentsFromFlags<RestFlags>
  : TFlags extends `-${string} ${infer RestFlags}`
    ? ExtractArgumentsFromFlags<RestFlags>
  : TFlags;

type OptionName<Name extends string> = Name extends "*" ? string
  : CamelCase<TrimRight<Name, ",">>;

export type IsRequired<TRequired extends boolean | undefined, TDefault> =
  TRequired extends true ? true
    : TDefault extends undefined ? false
    : true;

type MakeArray<TValue> = TValue extends ReadonlyArray<unknown> ? TValue
  : [TValue];
