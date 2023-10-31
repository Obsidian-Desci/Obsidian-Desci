import { useContext } from "react";
import { AppContext } from "../context/context";
import { App } from "obsidian";

export const useApp = (): App | undefined => {
  return useContext(AppContext);
};
