import { prop } from "@typegoose/typegoose";
import * as randomstring from "randomstring";

export const idProp = (options: Omit<Parameters<typeof prop>[0], "default"> = { }) =>
  prop({
    default: () => randomstring.generate(16),
    ...options
  });

export type ModelInit<Model> = Omit<Model, "_id">;
