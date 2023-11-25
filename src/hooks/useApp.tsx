import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { App } from "obsidian";
import ObsidianDesci from 'main'

export const useApp = (): App | undefined => {
  return useContext(AppContext);
};