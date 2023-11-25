import { createContext } from "react";
import { App } from "obsidian";
import ObsidianDesci from '../../main'
export const PluginContext = createContext<ObsidianDesci | undefined>(undefined);

