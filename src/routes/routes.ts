import { Request, Response, Router } from "express";
import * as changeAnswersRoute from "../controllers/change.answers.controller";
import * as checkYourAnswersRoute from "../controllers/check.your.answers.controller";
import companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as confirmationRoute from "../controllers/confirmation.controller";
import * as documentDownloadRoute from "../controllers/document.download.controller";
import * as documentDownloadLandingRoute from "../controllers/document.download.landing.controller";
import * as documentUploadRoute from "../controllers/document_upload/document.upload.controller";
import * as enterInformationRoute from "../controllers/enter.information.controller";
import * as indexRoute from "../controllers/index.controller";
import * as noticeExpiredRoute from "../controllers/notice.expired.controller";
import * as noStrikeOffRoute from "../controllers/no.strike.off.controller";
import * as objectingEntityNameRoute from "../controllers/objecting.entity.name.controller";
import * as removeDocumentRoute from "../controllers/remove.document.controller";
import * as objectorOrganisation from "../controllers/objector.organisation.controller";
import * as pageURLs from "../model/page.urls";
import { Templates } from "../model/template.paths";

export const router: Router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
  return res.render(template);
};

router.get("/", indexRoute.get);
router.post("/", indexRoute.post);

router.get(pageURLs.OBJECTING_ENTITY_NAME, objectingEntityNameRoute.get);
router.post(pageURLs.OBJECTING_ENTITY_NAME, objectingEntityNameRoute.post);

router.get(pageURLs.COMPANY_NUMBER, renderTemplate(Templates.COMPANY_NUMBER));
router.post(pageURLs.COMPANY_NUMBER, ...companyNumberRoute);

router.get(pageURLs.CONFIRM_COMPANY, confirmCompanyRoute.get);
router.post(pageURLs.CONFIRM_COMPANY, confirmCompanyRoute.post);

router.get(pageURLs.NOTICE_EXPIRED, noticeExpiredRoute.get);

router.get(pageURLs.NO_STRIKE_OFF, noStrikeOffRoute.get);

router.get(pageURLs.ENTER_INFORMATION, enterInformationRoute.get);
router.post(pageURLs.ENTER_INFORMATION, enterInformationRoute.post);

router.get(pageURLs.DOCUMENT_UPLOAD, documentUploadRoute.get);
router.post(pageURLs.DOCUMENT_UPLOAD, documentUploadRoute.postFile);
router.post(pageURLs.DOCUMENT_UPLOAD_CONTINUE, documentUploadRoute.postContinueButton);

router.get(pageURLs.REMOVE_DOCUMENT, removeDocumentRoute.get);
router.post(pageURLs.REMOVE_DOCUMENT, removeDocumentRoute.post);

router.get(pageURLs.DOCUMENT_DOWNLOAD, documentDownloadRoute.get);

router.get(pageURLs.DOCUMENT_DOWNLOAD_LANDING, documentDownloadLandingRoute.get);

router.get(pageURLs.CHECK_YOUR_ANSWERS, checkYourAnswersRoute.get);
router.post(pageURLs.CHECK_YOUR_ANSWERS, checkYourAnswersRoute.post);

router.get(pageURLs.CONFIRMATION, confirmationRoute.get);

router.get(pageURLs.ERROR, renderTemplate(Templates.ERROR));

router.get(pageURLs.CHANGE_ANSWERS, changeAnswersRoute.get);

router.get(pageURLs.ACCESSIBILITY_STATEMENT, renderTemplate(Templates.ACCESSIBILITY_STATEMENT));

router.get(pageURLs.OBJECTOR_ORGANISATION, objectorOrganisation.get);
router.post(pageURLs.OBJECTOR_ORGANISATION, objectorOrganisation.post);
