import { Session } from "@companieshouse/node-session-handler";
import { Request, Response } from "express";
import { OBJECTIONS_SESSION_NAME } from "../constants";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.INDEX);
};

export const post = (req: Request, res: Response) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    logger.debug("Deleting existing session data from " + OBJECTIONS_SESSION_NAME);
    session.deleteExtraData(OBJECTIONS_SESSION_NAME);
  }

  return res.redirect(req.app.locals.objectorJourneyFeatureFlag);
};