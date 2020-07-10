import { Templates } from "./template.paths";

/**
 * Keep template names in template.paths.ts and reference them in here for URLs
 */

const SEPARATOR: string = "/";

export const STRIKE_OFF_OBJECTIONS: string = SEPARATOR + "strike-off-objections";
export const COMPANY_NUMBER: string = SEPARATOR + Templates.COMPANY_NUMBER;
export const CONFIRM_COMPANY: string = SEPARATOR + Templates.CONFIRM_COMPANY;
export const ENTER_INFORMATION: string = SEPARATOR + Templates.ENTER_INFORMATION;
export const DOCUMENT_UPLOAD: string = SEPARATOR + Templates.DOCUMENT_UPLOAD;
export const ERROR: string = SEPARATOR + Templates.ERROR;
export const DOCUMENT_UPLOAD_FILE: string = SEPARATOR + "document-upload-file"; // not a template
export const DOCUMENT_UPLOAD_CONTINUE: string = SEPARATOR + "document-upload-continue"; // not a template

/**
 * URLs for redirects will need to start with the application name
 */
export const OBJECTIONS_COMPANY_NUMBER: string = STRIKE_OFF_OBJECTIONS + COMPANY_NUMBER;
export const OBJECTIONS_CONFIRM_COMPANY: string = STRIKE_OFF_OBJECTIONS + CONFIRM_COMPANY;
export const OBJECTIONS_ENTER_INFORMATION: string = STRIKE_OFF_OBJECTIONS + ENTER_INFORMATION;
export const OBJECTIONS_DOCUMENT_UPLOAD: string = STRIKE_OFF_OBJECTIONS + DOCUMENT_UPLOAD;
export const OBJECTIONS_DOCUMENT_UPLOAD_FILE: string = STRIKE_OFF_OBJECTIONS + DOCUMENT_UPLOAD_FILE;
export const OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE: string = STRIKE_OFF_OBJECTIONS + DOCUMENT_UPLOAD_CONTINUE;
export const OBJECTIONS_ERROR: string = STRIKE_OFF_OBJECTIONS + ERROR;
