"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const storeController_1 = __importDefault(require("./interface/http/storeController"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(storeController_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`service-store listening on ${PORT}`);
});
