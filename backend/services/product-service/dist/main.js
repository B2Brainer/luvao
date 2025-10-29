"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const productController_1 = __importDefault(require("./interface/http/productController"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(productController_1.default);
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`service-product listening on ${PORT}`);
});
