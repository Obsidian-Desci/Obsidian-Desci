import { createContext } from "react";
import { App } from "obsidian";
import ObsidianDesci from 'main'
export const AppContext = createContext<ObsidianDesci | undefined>(undefined);

