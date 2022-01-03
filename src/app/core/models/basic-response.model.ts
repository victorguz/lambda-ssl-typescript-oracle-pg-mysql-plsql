export class BasicResponse {
    success: boolean
    message: string
    data?: any
    error?: any

    constructor(success: boolean = false, message: string = "", data: any = undefined, error: any = undefined) {
        this.success = success
        this.message = message
        this.data = data
        this.error = error

    }
}