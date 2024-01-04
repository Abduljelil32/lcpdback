type PaginatedResultData<T, U extends string = "results"> = {
  [propertyKey in U]: T[];
};

export type PaginatedResult<T, U extends string> = PaginatedResultData<T, U> & {
  total: number;
};

export class Filters<T> {
  id: keyof T;
  value: string;
}

// [{id: "role", value: "student"}]
// /users/"[{id: "role", value: "student"}]"

export class Sorters<T> {
  id: keyof T;
  desc: boolean;
}

export type FilterModes<T> = {
  [propertyName in keyof T]: "contains" | "equals";
};
