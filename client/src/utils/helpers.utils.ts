
export const getErrorMessage = (e: unknown): string => {
    const error = (e as { response: { data: { error: string } } }).response.data.error
        || (e as { response: { data: { message: string } } }).response.data.message
        || (e as { message: string }).message
        || 'An error occurred'
    return error
} 