import { useContext } from "react";
import { PluginContext } from "../context/PluginContext";
import { App } from "obsidian";
import ObsidianDesci from '../../main'

export const usePlugin = (): ObsidianDesci | undefined => {
  return useContext(PluginContext);
};