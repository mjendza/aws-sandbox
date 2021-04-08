export class HttpError extends Error {
    constructor(code: number, message?: string) {
        super(message);
        this.statusCode = code;
        this.message = message || '';
    }
    statusCode: number;
}
