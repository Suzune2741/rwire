export interface Flow {
    id: string,
    type: "tab",
    label: string,
    disabled: boolean,
    info: string
    env: string[]
}