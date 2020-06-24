import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import { OBJECTIONS_SESSION } from "../constants";
import { COMPANY_NOT_FOUND, COMPANY_NUMBER_TOO_LONG,
    INVALID_COMPANY_NUMBER, NO_COMPANY_NUMBER_SUPPLIED } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { ObjectionCompanyProfile } from "../model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { ValidationError } from "../model/validation.error";
import { getCompanyProfile } from "../services/company.profile.service";
import logger from "../utils/logger";
import {addToObjectionsSession, createObjectionsSession} from "../services/objections.session.service";

// validator middleware that checks for an empty or too long input
const preValidators = [
    check("companyNumber").blacklist(" ").escape().not().isEmpty().withMessage(NO_COMPANY_NUMBER_SUPPLIED),
    check("companyNumber").blacklist(" ").escape().isLength({max: 8}).withMessage(COMPANY_NUMBER_TOO_LONG),
];

const formatCompanyNumber = (companyNumber: string, leadPoint: number): string  => {
    const leadingLetters = companyNumber.substring(0, leadPoint);
    let trailingChars = companyNumber.substring(leadPoint, companyNumber.length);
    trailingChars = trailingChars.padStart((8 - leadPoint), "0");
    return leadingLetters + trailingChars;
};

// pads company number to 8 digits with 0's and removes whitespace
const padCompanyNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let companyNumber: string = req.body.companyNumber;
    if (/^([a-zA-Z]{2}?)/gm.test(companyNumber)) {
        companyNumber = formatCompanyNumber(companyNumber, 2);
    } else if (/^([a-zA-Z]{1}?)/gm.test(companyNumber)) {
        companyNumber = formatCompanyNumber(companyNumber, 1);
    } else {
        companyNumber = companyNumber.padStart(8, "0");
    }
    req.body.companyNumber = companyNumber;
    return next();
};

const buildError = (res: Response, errorMessage: string): void => {
    const companyNumberErrorData: GovUkErrorData = createGovUkErrorData(
        errorMessage,
        "#company-number",
        true,
        "");
    return res.render(Templates.COMPANY_NUMBER, {
        companyNumberErr: companyNumberErrorData,
        errorList: [companyNumberErrorData],
        templateName: Templates.COMPANY_NUMBER,
    });
};

// validator middleware that checks for invalid characters in the input
const postValidators = [
    check("companyNumber").blacklist(" ").escape().custom((value: string) => {
        if (!/^[0-9]{8}$|^([a-zA-Z]{1})[0-9]{7}$|^([a-zA-Z]{2})[0-9]{6}$/gm.test(value)) {
            throw new Error(INVALID_COMPANY_NUMBER);
        }
        return true;
    }),
];

/**
 * POST controller for company number screen
 * @param req
 * @param res
 * @param next
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug("Attempt to retrieve and show the company details");

    const errors = validationResult(req);

    // render errors in the view
    if (!errors.isEmpty()) {
        const errorText = errors.array({ onlyFirstError: true })
            .map((err: ValidationError) => err.msg)
            .pop() as string;
        return buildError(res, errorText);
    }

    const companyNumber: string = req.body.companyNumber;
    const session: Session = req.session as Session;

    try {
        logger.info(`Retrieving company profile for company number ${companyNumber}`);
        const token: string = getValidToken(session, req) as string;
        if (!token) {
            throw new Error("Authorization error");
        }

        const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

        if (session) {
            createObjectionsSession(session);
            addToObjectionsSession(session, "company_data", company);
        }
        return res.redirect(OBJECTIONS_CONFIRM_COMPANY);
    } catch (e) {
        logger.error(`Error fetching company profile for company number ${companyNumber}`);
        if (e.status === 404) {
            buildError(res, COMPANY_NOT_FOUND);
        } else {
            return next(e);
        }
    }
};

const getValidToken = (session: Session, req: Request): string | undefined => {
    const signIn = session.data.signin_info;
    if (signIn && signIn.access_token) {
        return signIn.access_token.access_token as string;
    } else {
        logger.error("Access token is missing");
    }
    return undefined;
};

export default [...preValidators, padCompanyNumber, ...postValidators, route];
