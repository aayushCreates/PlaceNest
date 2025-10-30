

export default interface UserType {
    id: String
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
    branch?: string
    year?: string
    cgpa?: Float16Array
    active_backlog: number
    role: "STUDENT" | "COMPANY" | "COORDINATOR"
    verifiedProfile: boolean
    resumeUrl?: string
    // profileCompleted
}



