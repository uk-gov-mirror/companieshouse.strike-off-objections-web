jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objections.session.service");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { getValueFromObjectionsSession } from "../../src/services/objections.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockGetObjectionSessionValue = getValueFromObjectionsSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    req.session = {
        data: {},
    } as Session;
    return next();
});

// TODO test scenario when an error is logged - check that this is happening correctly

describe("check company tests", () => {

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
