import { createContext } from "react";
import { App } from "obsidian";
interface ObsidianDesciContext extends App {

}
export const AppContext = createContext<ObsidianDesciContext | undefined>(undefined);

