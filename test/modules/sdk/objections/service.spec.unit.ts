jest.mock("../../../../src/modules/sdk/objections/axios.client");

import { AxiosRequestConfig, Method } from "axios";
import * as objectionsSdk from "../../../../src/modules/sdk/objections";
import { Attachment } from "../../../../src/modules/sdk/objections";
import { getBaseAxiosRequestConfig, HTTP_DELETE, HTTP_GET, HTTP_PATCH, HTTP_POST, makeAPICall } from "../../../../src/modules/sdk/objections/axios.client";

const mockMakeAPICall = makeAPICall as jest.Mock;
const mockGetBaseAxiosRequestConfig = getBaseAxiosRequestConfig as jest.Mock;
mockGetBaseAxiosRequestConfig.mockReturnValue({} as AxiosRequestConfig);

const dummyAttachment: Attachment = {
  id: "32424",
  name: "test.jpg",
};

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";
const OBJECTION_ID = "444222";
const ATTACHMENT_ID = "file123";

describe("objections SDK service unit tests", () => {

  beforeEach(() => {
    mockMakeAPICall.mockClear();
    mockGetBaseAxiosRequestConfig.mockClear();
  });

  it("returns an id when a new objection is created", async () => {
    const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";
    mockMakeAPICall.mockResolvedValueOnce({
      data: {
        id: NEW_OBJECTION_ID,
      },
    });
    const objectionId: string = await objectionsSdk.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toStrictEqual(NEW_OBJECTION_ID);

    expect(mockMakeAPICall).toBeCalled();

    testCorrectApiValuesAreUsed(
      `company/${COMPANY_NUMBER}/strike-off-objections`,
      HTTP_POST,
    );
  });

  it("throws an ApiError from createNewObjection when an error occurs calling the api", async () => {
    const apiError: objectionsSdk.ApiError = {
      data: {
        errors: ["missing company"],
      },
      message: "Not Found",
      status: 404,
    };

    mockMakeAPICall.mockRejectedValueOnce(apiError);

    await expect(objectionsSdk.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN))
      .rejects.toStrictEqual(apiError);
  });

  it("should call objections API when patching an objection", async () => {
    const patch: objectionsSdk.ObjectionPatch = {
      reason: "some reason or other",
      status: objectionsSdk.ObjectionStatus.SUBMITTED,
    };

    await objectionsSdk.patchObjection(COMPANY_NUMBER, OBJECTION_ID, ACCESS_TOKEN, patch);

    expect(mockMakeAPICall).toBeCalled();

    testCorrectApiValuesAreUsed(
      `company/${COMPANY_NUMBER}/strike-off-objections/${OBJECTION_ID}`,
      HTTP_PATCH,
    );
  });

  it("should call objections API when posting an attachment", async () => {
    const fileName: string = "fileName";
    const BUFFER = Buffer.from("Buffer");
    const STREAMS_DATA_PARAMATER = "_streams";
    await objectionsSdk.addAttachment(COMPANY_NUMBER,
        ACCESS_TOKEN,
        OBJECTION_ID,
      BUFFER,
      fileName,
    );
    const usedAxiosConfig: AxiosRequestConfig = mockMakeAPICall.mock.calls[0][0];
    const streamZero = usedAxiosConfig.data[STREAMS_DATA_PARAMATER][0];
    expect(streamZero).toContain(fileName);

    const streamOne = usedAxiosConfig.data[STREAMS_DATA_PARAMATER][1];
    expect(streamOne).toEqual(BUFFER);

    testCorrectApiValuesAreUsed(
      `company/${COMPANY_NUMBER}/strike-off-objections/${OBJECTION_ID}/attachments`,
      HTTP_POST,
    );
  });

  it("should call objections API getting attachments list", async () => {
    const dummyAttachmentList: Attachment[] = [
      dummyAttachment,
      dummyAttachment,
    ];

    mockMakeAPICall.mockResolvedValueOnce(
      {
        data: dummyAttachmentList,
      });

    const returnedAttachments: Attachment[] = await objectionsSdk.getAttachments(
      COMPANY_NUMBER,
      ACCESS_TOKEN,
      OBJECTION_ID);

    expect(returnedAttachments).toStrictEqual(dummyAttachmentList);
    expect(mockMakeAPICall).toBeCalled();

    testCorrectApiValuesAreUsed(
      `company/${COMPANY_NUMBER}/strike-off-objections/${OBJECTION_ID}/attachments`,
      HTTP_GET,
    );
  });

  it("should call objections API getting single attachment", async () => {
    mockMakeAPICall.mockResolvedValueOnce(
      {
        data: dummyAttachment,
      });

    const returnedAttachment = await objectionsSdk.getAttachment(
      COMPANY_NUMBER,
      ACCESS_TOKEN,
      OBJECTION_ID,
      ATTACHMENT_ID);

    expect(returnedAttachment).toStrictEqual(dummyAttachment);
    expect(mockMakeAPICall).toBeCalled();

    testCorrectApiValuesAreUsed(
      `company/${COMPANY_NUMBER}/strike-off-objections/${OBJECTION_ID}/attachments/${ATTACHMENT_ID}`,
      HTTP_GET,
    );
  });

  it("should call objections API deleting single attachment", async () => {
    await objectionsSdk.deleteAttachment(COMPANY_NUMBER,
      ACCESS_TOKEN,
      OBJECTION_ID,
      ATTACHMENT_ID);

    expect(mockMakeAPICall).toBeCalled();

    testCorrectApiValuesAreUsed(
      `company/${COMPANY_NUMBER}/strike-off-objections/${OBJECTION_ID}/attachments/${ATTACHMENT_ID}`,
      HTTP_DELETE,
    );
  });

  it("should call objections API getting an objection", () => {
    objectionsSdk.getObjection(COMPANY_NUMBER,
        ACCESS_TOKEN,
        OBJECTION_ID);

    expect(mockAxiosRequest).toBeCalled();
  });
});

const testCorrectApiValuesAreUsed = (expectedUrlEnding: string, expectedHttpMethod: Method) => {
  const axiosConfigParams = mockGetBaseAxiosRequestConfig.mock.calls[0];
  const httpMethod: Method = axiosConfigParams[0];
  const url: string = axiosConfigParams[1];
  const token: string = axiosConfigParams[2];

  expect(url.endsWith(expectedUrlEnding)).toBeTruthy();
  expect(httpMethod).toStrictEqual(expectedHttpMethod);
  expect(token).toStrictEqual(ACCESS_TOKEN);
};
