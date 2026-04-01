type ErrorResponseShape = {
    response?: {
        data?: {
            error?: string;
            message?: string;
        };
    };
    message?: string;
};

export const getErrorMessage = (e: unknown): string => {
    const candidate = e as ErrorResponseShape;

    if (candidate?.response?.data?.error) {
        return candidate.response.data.error;
    }

    if (candidate?.response?.data?.message) {
        return candidate.response.data.message;
    }

    if (candidate?.message) {
        return candidate.message;
    }

    return 'An error occurred';
};