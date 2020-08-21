jest.mock("web-security-node");

import { NextFunction, Request, Response } from "express";
import { authMiddleware } from "web-security-node";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import { OBJECTIONS_COMPANY_NUMBER, OBJECTIONS_ENTER_INFORMATION } from "../../src/model/page.urls";

const DOWNLOAD_LANDING_PAGE_URL =
  "/strike-off-objections/download/company/1234/strike-off-objections/5678/attachments/8888/download";
const DOWNLOAD_FILE_URL =
  "/strike-off-objections/company/1234/strike-off-objections/5678/attachments/8888/download";

const mockWebSecurityNodeAuthMiddleware = authMiddleware as jest.Mock;
mockWebSecurityNodeAuthMiddleware.mockImplementation(() => {
  return (req: Request, res: Response, next: NextFunction) => {
    return next();
  };
});

const dummyReq = {} as Request;
const dummyRes = {} as Response;
const dummyNext = () => { return; };

describe("authentication middleware tests", () => {

  beforeEach(() => {
    mockWebSecurityNodeAuthMiddleware.mockClear();
    dummyReq.originalUrl = "";
  });

  it("should set return url to download landing page", () => {
    dummyReq.originalUrl = DOWNLOAD_LANDING_PAGE_URL;
    authenticationMiddleware(dummyReq, dummyRes, dummyNext);

    const expectedConfig = {
      accountWebUrl: "",
      returnUrl: DOWNLOAD_LANDING_PAGE_URL,
    };

    expect(mockWebSecurityNodeAuthMiddleware).toBeCalledWith(expectedConfig);
  });

  it("should set return url to download file url", () => {
    dummyReq.originalUrl = DOWNLOAD_FILE_URL;
    authenticationMiddleware(dummyReq, dummyRes, dummyNext);

    const expectedConfig = {
      accountWebUrl: "",
      returnUrl: DOWNLOAD_FILE_URL,
    };

    expect(mockWebSecurityNodeAuthMiddleware).toBeCalledWith(expectedConfig);
  });

  it("should set return url to Company Number page", () => {
    dummyReq.originalUrl = OBJECTIONS_ENTER_INFORMATION;
    authenticationMiddleware(dummyReq, dummyRes, dummyNext);

    const expectedConfig = {
      accountWebUrl: "",
      returnUrl: OBJECTIONS_COMPANY_NUMBER,
    };

    expect(mockWebSecurityNodeAuthMiddleware).toBeCalledWith(expectedConfig);
  });
});
