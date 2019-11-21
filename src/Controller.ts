import * as express from "express";
import * as jwt from "jsonwebtoken";
import { HttpMethod } from "./HttpMethod";
import { TokenPayload } from "./TokenPayload";
import { HttpError } from "./HttpError";

export abstract class Controller {
  version: string = "1";
  abstract route: string;
  abstract method: HttpMethod;
  abstract handle(req: express.Request<any>, res: express.Response, payload: TokenPayload<any> | undefined): Promise<any>;

  static register(app: express.Application, controllerTypes: (typeof Controller)[], jwtKey: string) {
    for (const controllerType of controllerTypes) {
      const controller: Controller = new (controllerType as any)();
      console.log(`${controller.method.toUpperCase()} /v${controller.version}${controller.route}`);
      if (!app[controller.method]) {
        throw new Error(`Invalid controller method specified: ${controller.method} (${controller.route}, ${controllerType.name})`);
      }
      const matcher: express.IRouterMatcher<any> = app[controller.method].bind(app);
      matcher(`/v${controller.version}${controller.route}`, this.buildRequestHandler(controllerType, jwtKey));
    }
  }

  private static buildRequestHandler(controllerType: typeof Controller, jwtKey: string): express.RequestHandler {
    return async(req, res) => {
      let payload: TokenPayload | undefined;
      if (req.headers.authorization) {
        try {
          payload = jwt.verify(req.headers.authorization.split(" ")[1], jwtKey) as TokenPayload;
        } catch (err) {
          // Swallow verification errors, we don't care about them
        }
        if (payload) {
          payload.expiresAt = new Date(payload?.expiresAt);
          if (payload.expiresAt.getTime() < Date.now()) {
            payload = undefined;
          }
        }
      }
      let result: any;
      try {
        const controller = new (controllerType as any)();
        result = await controller.handle(req, res, payload);
      } catch (err) {
        if (err instanceof HttpError) {
          res.status(err.status);
        } else {
          console.error(err);
          res.status(500);
        }
        return res.send({ message: err.message });
      }
      if (result !== undefined) {
        res.send(result);
      }
    };
  }
}
