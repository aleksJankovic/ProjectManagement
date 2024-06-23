export interface taskActivity
{
    taskActivityId : number,
    projectId: number,
    taskId: number,
    workerId: number,
    projectName : string,
    taskName : string,
    memberName : string,
    type : string,
    dateModify : Date,
    comment : string
    taskActivityTypeId : number,
    taskActivityName: string,
    differenceM : number,
    differenceH : number,
    percentageComplete : number
}
