// definition of the interface 

export interface getAllScheduleData {
    adminId: string,
    authToken: string
}

export interface getAllSingleScheduleData {
    userId: string,
    authToken: string
}

export interface getallUserListData {
    userId: string,
    pageNo: number,
    size: number,
    query: string,
    authToken: string
}

export interface createData {
    adminId: string,
    adminName: string,
    eventName: string,
    start: number,
    end: number,
    venue: string,
    description: string,
    participateId: string,
    participateName: string,
    authToken: string
}

export interface updateData {
    id: string,
    adminId: string,
    adminName: string,
    eventName: string,
    start: number,
    end: number,
    venue: string,
    description: string,
    participateId: string,
    participateName: string,
    authToken: string
}

export interface deleteData {
    id: string,
    authToken: string
}

export interface infoData {
    status: string,
    message: string,
    userId: string,
    info: object
}