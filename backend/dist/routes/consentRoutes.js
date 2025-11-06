"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consentController_1 = require("../controllers/consentController");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
// Allow anonymous consent submissions; if user is authenticated, controller will attach userId
router.post('/consent', validationMiddleware_1.validateConsentSubmission, validationMiddleware_1.handleValidationErrors, consentController_1.submitConsent);
exports.default = router;
