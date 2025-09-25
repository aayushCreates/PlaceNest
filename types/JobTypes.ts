

type JobRoleType = "Internship" | "PartTime" | "FullTime" | "Contract"

type JobSatus = "ACTIVE" | "CLOSED" | "DRAFT"

export interface JobType {
    type: JobRoleType
    title: string
    description: string
    role: string
    location: string
    package: string
    cgpaCutOff: Float32Array
    deadline: Date
    status: JobSatus
}




