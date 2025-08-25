import type { DeviceLinkResponse, DeviceLinkExchangeResponse, Stream, WorkItem } from './types';
export declare class CurrentlyApi {
    private baseUrl;
    private supabaseUrl;
    private supabaseAnonKey;
    constructor(config: {
        baseUrl: string;
        supabaseUrl: string;
        supabaseAnonKey: string;
    });
    generateDeviceLinkCode(): Promise<DeviceLinkResponse>;
    exchangeDeviceLinkCode(code: string): Promise<DeviceLinkExchangeResponse>;
    getStreams(): Promise<Stream[]>;
    getStream(id: string): Promise<Stream>;
    createWorkItem(streamId: string, workItem: Partial<WorkItem>): Promise<WorkItem>;
    updateWorkItem(streamId: string, workItemId: string, updates: Partial<WorkItem>): Promise<WorkItem>;
}
export declare function formatDate(date: string | Date): string;
export declare function formatDateTime(date: string | Date): string;
export declare function getInitials(name: string): string;
