export type DynamicApiResponse<TModel = unknown, TValue = unknown> = {
  StatusCode: number;
  Status: string;
  TotalRecords: number | null;
  Message: string;
  Model: TModel | null;
  Value: TValue | null;
};
