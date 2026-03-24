export type RegistryType = 'skills' | 'agents' | 'mcp';
export interface RegistryItem {
    name: string;
    path: string;
    tags: string[];
    description: string;
    createdAt: string;
    updatedAt: string;
}
export interface RegistryIndex {
    type: RegistryType;
    items: RegistryItem[];
    version: string;
    lastUpdated: string;
}
export interface SaveItemParams {
    type: RegistryType;
    name: string;
    content: string;
    path: string;
    tags?: string[];
    description?: string;
}
export interface SearchParams {
    type: RegistryType;
    query: string;
}
export interface ListParams {
    type: RegistryType;
}
export interface InitParams {
    type: RegistryType;
}
export interface GitHubFileParams {
    owner: string;
    repo: string;
    path: string;
    content?: string;
    message?: string;
}
export declare const REPOS: Record<RegistryType, string>;
export declare const OWNER = "Hashzin-0";
//# sourceMappingURL=types.d.ts.map