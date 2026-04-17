"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contestantController_1 = require("./contestantController");
const router = express_1.default.Router();
// Get all contestants (leaderboard)
router.get('/', contestantController_1.getContestants);
// Get single contestant details
router.get('/:id', contestantController_1.getContestantById);
exports.default = router;
//# sourceMappingURL=contestantRoutes.js.map