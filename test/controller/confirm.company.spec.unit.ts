jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME, SESSION_OBJECTION_ID } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  OBJECTIONS_CONFIRM_COMPANY,
  OBJECTIONS_ENTER_INFORMATION
} from "../../src/model/page.urls";
import { createNewObjection } from "../../src/services/objection.service";
import {
  addToObjectionSession,
  retrieveCompanyProfileFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const OBJECTION_ID = "123456";
const SESSION: Session = {
  data: {},
} as Session;

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = SESSION
  return next();
});

const mockSetObjectionSessionValue = addToObjectionSession as jest.Mock;


const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = {};
    return next();
  }

  return next(new Error("No session on request"));
});

const mockCreateNewObjection = createNewObjection as jest.Mock;

// TODO test scenario when an error is logged - check that this is happening correctly

describe("confirm company tests", () => {

  it("should render the page with company data from the session", async () => {

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);

    // TODO "girl's" caused the html version of apostrophe to be returned
    // something like eg &1233; - just check that apostrophe is rendered ok in browser
    expect(response.text).toContain("Girls school trust");
    expect(response.text).toContain("00006400");
    expect(response.text).toContain("Active");
    expect(response.text).toContain("26 June 1872");
    expect(response.text).toContain("limited");
    expect(response.text).toContain("line1");
    expect(response.text).toContain("line2");
    expect(response.text).toContain("post code");
  });

  it("should call the API to create a new objection then render the enter information page", async () => {

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    mockCreateNewObjection.mockReset();
    mockCreateNewObjection.mockImplementation(() => OBJECTION_ID);

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, SESSION_OBJECTION_ID, OBJECTION_ID);
    expect(mockCreateNewObjection).toHaveBeenCalledWith(dummyCompanyProfile.companyNumber, undefined);
    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_ENTER_INFORMATION);
  });
});


const dummyCompanyProfile: ObjectionCompanyProfile = {
  address: {
    line_1: "line1",
    line_2: "line2",
    postCode: "post code",
  },
  companyName: "Girls school trust",
  companyNumber: "00006400",
  companyStatus: "Active",
  companyType: "limited",
  incorporationDate: "26 June 1872",
};
