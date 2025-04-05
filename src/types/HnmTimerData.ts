import { HnmCommandData } from "./CommandData"

export type HnmTimerData = {
    name: string,
    day: number,
    mod: string,
    timeStamp: string | null,
    hnmData: HnmCommandData,
    isValid: boolean,
    reason?: string
}

export type FormatedHnmTimer = {
    name: string,
    hqName: string,
    emoji: string,
    mod: string,
    formatedTimer: string
}

export type DateData = {
    year: number,
    month: number,
    dayOfMonth: number,
    hours: number,
    minutes: number,
    seconds: number,
    tzOffset: number
}

