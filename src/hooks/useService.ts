// NOTES: in real world we would be better off separate that into multiple files
import { useEffect, useState } from "react";
// zod is typesafe validation library which we will use for validation data to/from an api
import { ZodSchema, ZodType, z } from "zod";
// types generated from openapi
import { paths } from "../services/api";

// what services (endpoints) we want to implement in this file, endpoints are from converted openapi specification
type TService = Extract<
  keyof paths,
  "/category" | "/categories" | "/product" | "/products" | "/offer" | "/offers"
>;

// following avaialable methods for each endpoints
type TMethod<S extends TService> = keyof paths[S];

// avaialbe response http status codes, for particullar service and method
type tmp<S extends TService, M extends TMethod<S>> = paths[S][M] extends {
  responses: unknown;
}
  ? paths[S][M]["responses"]
  : never;

type THttpcodes2<S extends TService, M extends TMethod<S>> = {
  [K in keyof tmp<S, M>]: tmp<S, M>[K] extends { content: never } ? never : K;
}[keyof tmp<S, M>];

// inpu data for the api
type TServiceInput<
  S extends TService,
  M extends TMethod<S>,
> = paths[S][M] extends { parameters: { query: {} } }
  ? paths[S][M]["parameters"]["query"]
  : never;

// what data we got from the api
type TServiceOutput<
  S extends TService,
  M extends TMethod<S>,
  C extends string | number | symbol,
> = paths[S] extends {
  [key in M]: {
    responses: {
      [httpcode in C]: { content: { "application/json": unknown } };
    };
  };
}
  ? paths[S][M]["responses"][C]["content"]["application/json"]
  : never;

// Get types for http status code which we can validate (non empty responses, etc) qqqq
// folowing typing makes sure we implement all and only validation for services extracted from paths
// validation criterias have to cover 100% of api IO, there can be more validation criteas but not less. i.e. an interceptor adds timestamp
const validators: {
  [service in TService]: {
    // an input (to an api) is the same for the whole service+method combination but output might varied based on http status code (e.g. 200 vs 400)
    [method in keyof paths[service]]: {
      [code in THttpcodes2<service, method>]: TServiceOutput<
        service,
        method,
        code
      > extends never
        ? never
        : ZodSchema<TServiceOutput<service, method, code>>;
    } & { input: ZodSchema<TServiceInput<service, TMethod<service>>> };
  };
} = {
  "/categories": {
    get: {
      input: z.never(),
      200: z.object({
        pageInfo: z.object({
          offset: z.number(),
          limit: z.number(),
          total: z.number(),
        }),
        data: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
          }),
        ),
      }),
    },
  },

  "/category": {
    get: {
      input: z.object({ id: z.string() }),
      200: z.object({
        id: z.number(),
        title: z.string(),
      }),
    },
  },

  "/offer": {
    get: {
      input: z.object({ id: z.string() }),
      200: z.object({
        id: z.number(),
        productId: z.number(),
        title: z.string(),
        description: z.string(),
        url: z.string(),
        imgUrl: z.string(),
        price: z.number(),
      }),
    },
  },

  "/offers": {
    get: {
      input: z.object({
        offset: z.string(),
        limit: z.string(),
        productId: z.string(),
      }),
      200: z.object({
        pageInfo: z.object({
          offset: z.number(),
          limit: z.number(),
          total: z.number(),
        }),
        data: z.array(
          z.object({
            id: z.number(),
            productId: z.number(),
            title: z.string(),
            description: z.string(),
            url: z.string(),
            imgUrl: z.string(),
            price: z.number(),
          }),
        ),
      }),
    },
  },

  "/product": {
    get: {
      input: z.object({ id: z.string() }),
      200: z.object({
        id: z.number(),
        categoryId: z.number(),
        title: z.string(),
      }),
    },
  },

  "/products": {
    get: {
      input: z.object({
        offset: z.string(),
        limit: z.string(),
        categoryId: z.string(),
      }),
      200: z.object({
        pageInfo: z.object({
          offset: z.number(),
          limit: z.number(),
          total: z.number(),
        }),
        data: z.array(
          z.object({
            id: z.number(),
            categoryId: z.number(),
            title: z.string(),
          }),
        ),
      }),
    },
  },
};

const DOMAIN = "lh-api.fly.dev";

type tm<S extends TService, M extends TMethod<S>> = (typeof validators)[S][M];
type A<S extends TService, M extends TMethod<S>> =
  tm<S, M> extends { 200: ZodType } ? z.infer<tm<S, M>[200]> : never;

const useService = <S extends TService, M extends TMethod<S>>(
  service: S,
  method: M,
  updater?: (data: A<S, M> | undefined) => void,
): [
  A<S, M> | undefined | null,
  boolean,
  Error | undefined,
  (input?: TServiceInput<S, M>) => void,
] => {
  const [input, setInput] = useState<TServiceInput<S, M>>();
  const [data, setData] = useState<A<S, M> | undefined>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(undefined);

    // create search params
    let search: string = "";
    if (input) {
      search =
        "?" +
        Object.entries(input)
          .map((i) => i.join("="))
          .join("&");
    }

    // in real application would make sense store DOMAIN/PORT in .env or ci/cd
    const url = new URL(service + search, `https://${DOMAIN}`);
    url.port = "443";

    // this try/catch is for validator input only
    try {
      // validate input, validation function might not be created
      const ioValidator = validators[service][method];
      // validate only if there is validator
      ioValidator?.input?.parse(input);

      // interesting idea is to use cache api here or other caching mechanism.
      setLoading(true);

      // prepared for multiple methods but in our case we can only simple GET request
      fetch(url, {
        method: String(method).toUpperCase(),
        body: method !== "get" ? JSON.stringify(input) : null,
      })
        .then(async (res) => {
          if (res.status >= 400) {
            throw new Error(await res.text());
          }

          const data: any = await res.json();
          setLoading(true);

          const validator = Reflect.get(ioValidator, res.status);

          validator?.parse(data);
          setData(data);
          updater?.call(null, data);
        })
        .catch((e: any) => {
          if (e instanceof Error) {
            setData.call(null, undefined);
            setError(e);
          }
        })
        .then(() => setLoading(false));
    } catch (e: any) {
      setLoading(false);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("UnknownError durring fetching data"));
      }
    }
  }, [input]);

  return [data, loading, error, setInput];
};
type TPagination = {
  offset: number;
  pagesize: number;
};

type TInput<S extends TService, M extends TMethod<S>> = {
  [K in Exclude<keyof TServiceInput<S, M>, "limit" | "offset">]: TServiceInput<
    S,
    M
  >[K];
};

const useServicePagination = <S extends TService, M extends TMethod<S>>(
  service: S,
  method: M,
  pagesize: number = 5,
  offset: number = 5,
  updater?: (data: A<S, M>["data"] | undefined) => void,
): [
  A<S, M>["data"] | undefined | null,
  boolean,
  Error | undefined,
  (input?: TInput<S, M>) => TPagination,
  () => boolean,
  () => boolean | TPagination,
  number | undefined,
] => {
  const [total, setTotal] = useState<number>();
  const [currentPagesize, setCurrentPagesize] = useState<number>();
  const [currentOffset, setCurrentOffset] = useState<number>();
  const [input, setInput] = useState<TInput<S, M>>();
  const [data, setData] = useState<A<S, M>["data"] | undefined>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  const fetchNext = (): boolean | TPagination => {
    // we want to have set input only at first call and then search through the api
    if (
      typeof currentOffset === "undefined" ||
      typeof currentPagesize === "undefined" ||
      typeof total === "undefined" ||
      typeof input === "undefined"
    ) {
      throw new Error("call fetchInit first");
    }
    // we are at the end, there is nothing to load
    if (currentOffset + 1 > total) {
      return false;
    }

    const newPagesize =
      total - currentOffset > pagesize ? pagesize : total - currentOffset;
    setCurrentPagesize(newPagesize);
    setCurrentOffset(newPagesize + currentOffset);
    setInput(input);
    // report current situation
    return {
      offset: newPagesize + currentOffset,
      pagesize: pagesize,
    };
  };

  // in our case there is no usecase for previous loading - so I will leave it unfinished/untested
  // eslint-ignore
  const fetchPrev = (): boolean => {
    if (
      typeof currentOffset === "undefined" ||
      typeof currentPagesize === "undefined" ||
      typeof total === "undefined"
    ) {
      throw new Error("call fetchInit first");
    }

    return true;
  };

  // first fetch
  const fetchInit = (input?: TInput<S, M>): TPagination => {
    setCurrentOffset(offset);
    setCurrentPagesize(pagesize);
    setInput(input);
    return {
      offset,
      pagesize,
    };
  };

  useEffect(() => {
    setError(undefined);

    // we should wait for user to call fetchInit
    if (
      typeof currentPagesize === "undefined" ||
      typeof currentOffset === "undefined"
    ) {
      return;
    }
    // create search params
    let search: string = "";
    if (input) {
      search =
        "?" +
        Object.entries({
          ...input,
          limit: (currentPagesize ?? pagesize) + (currentOffset ?? offset),
          offset: currentOffset,
        })
          .map((i) => i.join("="))
          .join("&");
    }

    // in real application would make sense store DOMAIN/PORT in .env or ci/cd
    const url = new URL(service + search, `https://${DOMAIN}`);
    url.port = "443";

    // this try/catch is for validator input only
    try {
      // validate input, validation function might not be created
      const ioValidator = validators[service][method];
      // validate only if there is validator
      // ioValidator?.input?.parse(input)

      // interesting idea is to use cache api here or other caching mechanism.
      setLoading(true);

      // prepared for multiple methods but in our case we can only simple GET request
      fetch(url, {
        method: String(method).toUpperCase(),
        body: method !== "get" ? JSON.stringify(input) : null,
      })
        .then(async (res) => {
          if (res.status >= 400) {
            throw new Error(await res.text());
          }

          const data: any = await res.json();
          setData(data.data);

          const validator = Reflect.get(ioValidator, res.status);

          console.log(data);
          validator?.parse(data);
          // set total
          setTotal(data.pageInfo.total);
          updater?.call(null, validator?.parse(data.data));
        })
        .catch((e: any) => {
          console.log(e);
          if (e instanceof Error) {
            setData.call(null, undefined);
            setError(e);
          }
        })
        .then(() => setLoading(false));
    } catch (e: any) {
      setLoading(false);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("UnknownError durring fetching data"));
      }
    }
  }, [input, currentOffset, currentPagesize]);

  return [data, loading, error, fetchInit, fetchPrev, fetchNext, total];
};

export { useService, useServicePagination };
