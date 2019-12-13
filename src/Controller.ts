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

  static register(app: express.Application, controllerTypes: (Controller | typeof Controller)[], jwtKey?: string) {
    const controllers = controllerTypes.map(controller =>
      "handle" in controller
        ? controller
        : new (controller as any)() as Controller
    );
    for (const controller of controllers) {
      console.log(`${controller.method.toUpperCase()} /v${controller.version}${controller.route}`);
      if (!app[controller.method]) {
        throw new Error(`Invalid controller method specified: ${controller.method} (${controller.route}, ${controller.constructor.name})`);
      }
      const matcher: express.IRouterMatcher<any> = app[controller.method].bind(app);
      matcher(`/v${controller.version}${controller.route}`, this.buildRequestHandler(controller, jwtKey));
    }
    if (jwtKey) {
      app.get("/v1/payload", (req, res) => {
        res.status(200).json({
          payload: this.getPayload(req, jwtKey)
        });
      });
    }
  }

  private static buildRequestHandler(controller: Controller, jwtKey?: string): express.RequestHandler {
    return async(req, res) => {
      const payload = jwtKey && this.getPayload(req, jwtKey);
      let result: any;
      try {
        result = await controller.handle(req, res, payload || undefined);
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

  private static getPayload(req: express.Request, jwtKey: string): TokenPayload | undefined {
    if (!req.headers.authorization) {
      return;
    }
    let payload: TokenPayload | undefined;
    try {
      payload = jwt.verify(req.headers.authorization.split(" ")[1], jwtKey) as TokenPayload;
    } catch (err) {
      // Swallow verification errors, we don't care about them
    }
    if (!payload) {
      return;
    }
    payload.expiresAt = new Date(payload?.expiresAt);
    if (payload.expiresAt.getTime() < Date.now()) {
      return undefined;
    }
    return payload;
  }
}
