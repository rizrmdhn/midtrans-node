"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getError = void 0;
const noErrorThrown_1 = require("../lib/noErrorThrown");
const getError = async (call) => {
    try {
        await call();
        throw new noErrorThrown_1.NoErrorThrownError();
    }
    catch (error) {
        return error;
    }
};
exports.getError = getError;
//# sourceMappingURL=getError.js.map