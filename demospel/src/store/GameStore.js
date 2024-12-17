import { Store } from "pullstate";

export const MODE_TITLE = "TITLE";
export const MODE_RUNNING = "RUNNING";
export const MODE_SAVE_SCORE = "SAVE_SCORE";
export const MODE_SAVE_ERROR = "SAVE_ERROR";
export const MODE_RESULTS = "RESULTS";

export const GameStore = new Store({
  mode: MODE_TITLE,
});
