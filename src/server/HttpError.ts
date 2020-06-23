
export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }

    static isHttpError(test: any): test is HttpError {
        return !!test && test.status && test.status < 500;
    }

    static assertHttpError(test: any): asserts test is HttpError {
        if (!HttpError.isHttpError(test)) throw test;
    }
}
