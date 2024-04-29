import { NoErrorThrownError } from '../lib/noErrorThrown';
export const getError = async (call) => {
    try {
        await call();
        throw new NoErrorThrownError();
    }
    catch (error) {
        return error;
    }
};
//# sourceMappingURL=getError.js.map