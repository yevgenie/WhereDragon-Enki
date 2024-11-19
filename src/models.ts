export type HNMType =
  | "Fafnir"
  | "Behemoth"
  | "Simurgh"
  | "Shiki"
  | "Adamantoise"
  | "KA"
  | "KV"
  | "Tiamat";

export type HNMTypeChannelKeys =
  | null
  | "ka"
  | "kv"
  | "faf"
  | "ada"
  | "tia"
  | "shi"
  | "sim"
  | "beh";

export const HNMTypeChannelKeyToSheetStringMap: {
  [key: string]: string;
} = {
  ka: "KA",
  kv: "KV",
  faf: "Fafnir",
  ada: "Ada",
  tia: "Tiamat",
  shi: "Shiki",
  sim: "Sim",
  beh: "Behe",
  // Aspi ??
  // Nidhogg??
};

export type HNMDetails = {
  [key in HNMType]: {
    name: string;
    maxWindows: number;
    dkpPerWindow: number;
    windowLengthInSeconds: number;
  };
};

export interface WDChannel {
  channelName: string;
  startTime: Date;
  HNM: HNMDetails;
  isKing?: boolean;
}

export interface XMsg {
  window: number;
  rawContents: string;
  timestamp: number;
  type: "in" | "out";
}

export type ParsedWindowsPerMember = {
  [memberName: string]: {
    windows: number;
    message: string;
    xOutWindow?: number;
    xKill?: boolean;
    xClaim?: boolean;
    checkForError: boolean;
    timestamp: string;
  };
};
