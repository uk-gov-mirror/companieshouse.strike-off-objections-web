import Resource from "ch-sdk-node/dist/services/resource";
import CompanyFilingHistoryService from "ch-sdk-node/dist/services/company-filing-history/service";
import { getLatestGaz1FilingHistoryItem } from "../../src/services/company.filing.history.service";
import { CompanyFilingHistory, FilingHistoryItem } from "ch-sdk-node/dist/services/company-filing-history";

jest.mock("ch-sdk-node/dist/services/company-filing-history/service");

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

describe("company filing history service unit tests", () => {
  const mockGetCompanyFilingHistory = (CompanyFilingHistoryService.prototype.getCompanyFilingHistory as jest.Mock);

  beforeEach(() => {
    mockGetCompanyFilingHistory.mockReset();
  });

  it("converts company number to uppercase", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(dummySDKResponse);
    await getLatestGaz1FilingHistoryItem("sc100079", ACCESS_TOKEN);
    expect(mockGetCompanyFilingHistory).toBeCalledWith("SC100079", "gazette");
  });

  it("returns a correct status code for error response", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(errorSdkResponse);
    try {
      await getLatestGaz1FilingHistoryItem("", ACCESS_TOKEN);
    } catch (e) {
      expect(e.status).toEqual(404);
    }
    expect.assertions(1);
  });

  it("returns the correct FilingHistoryItem object when GAZ1 entries are found", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(dummySDKResponse);
    const filingHistoryItem = await getLatestGaz1FilingHistoryItem("12345678", ACCESS_TOKEN);
    expect(filingHistoryItem).toEqual(dummyGaz1FilingHistoryItem);
  });

  it("returns 'undefined' when no GAZ1 entries are found", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(dummySDKResponseWithNoGaz1Date);
    const filingHistoryItem = await getLatestGaz1FilingHistoryItem("12345678", ACCESS_TOKEN);
    expect(filingHistoryItem).toEqual(undefined);
  });
});

const dummyGaz1FilingHistoryItem: FilingHistoryItem = {
  category: "category",
  date: "someDate",
  description: "A description",
  transactionId: "transactionId",
  type: "GAZ1"
};

const dummyCompanyFilingHistory: CompanyFilingHistory = {
  etag: "",
  filingHistoryStatus: "",
  items: [
    {
      // This entry should be ignored when extracting the GAZ1 date as type is different
      category: "",
      date: "2015-04-14",
      description: "",
      transactionId: "",
      type: "288a",
    },
    dummyGaz1FilingHistoryItem,
    // And this entry shouldn't be used as it's last in the list
    {
      category: "",
      date: "2011-07-21",
      description: "",
      transactionId: "",
      type: "GAZ1",
    },
  ],
  itemsPerPage: 1,
  kind: "",
  startIndex: 1,
  totalCount: 1,
};

const dummyCompanyFilingHistoryWithNoGaz1Date: CompanyFilingHistory = {
  etag: "",
  filingHistoryStatus: "",
  items: [
    {
      // This entry should be ignored when extracting the GAZ1 date as type is different
      category: "",
      date: "2015-04-14",
      description: "",
      transactionId: "",
      type: "288a",
    },
  ],
  itemsPerPage: 1,
  kind: "",
  startIndex: 1,
  totalCount: 1,
};

const dummySDKResponse: Resource<CompanyFilingHistory> = {
  httpStatusCode: 200,
  resource: dummyCompanyFilingHistory,
};

const dummySDKResponseWithNoGaz1Date: Resource<CompanyFilingHistory> = {
  httpStatusCode: 200,
  resource: dummyCompanyFilingHistoryWithNoGaz1Date,
};

const errorSdkResponse: any = {
  httpStatusCode: 404,
};
