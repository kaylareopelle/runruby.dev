import Dexie, { Table } from "dexie";
import { File, Directory, SyncOPFSFile } from "@bjorn3/browser_wasi_shim";

export interface FS {
  key: string;
  data: { [key: string]: File | Directory | SyncOPFSFile; };
}

export class MySubClassedDexie extends Dexie {
  fsCache!: Table<FS>;

  constructor() {
    super("runRubyFSCache");
    this.version(1).stores({
      fsCache: "key, data"
    });
  }
}

export const db = new MySubClassedDexie();

interface MarshaledFile {
  data: Uint8Array;
}
export interface DirectoryContents {
  [key: string]: MarshaledDirectory | MarshaledFile;
}
interface MarshaledDirectory {
  contents: DirectoryContents;
}

export const mapToEntities = (data: DirectoryContents) => {
  const result: { [key: string]: File | Directory } = {};

  Object.entries(data).forEach(([key, value]) => {
    if ("data" in value) {
      result[key] = new File(value.data);
    } else {
      result[key] = new Directory(mapToEntities(value.contents));
    }
  });
  return result;
};
