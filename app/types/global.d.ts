// types/global.d.ts
declare global {
    interface ReactNativeFS {
      exists: (path: string) => Promise<any>;
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string, encoding?: string) => Promise<void>;
      unlink: (path: string) => Promise<void>;
      mkdir: (dirPath: string) => Promise<void>;
      DocumentDirectoryPath: string;
    }
  
    interface LocalStorage {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string) => Promise<void>;
      removeItem: (key: string) => Promise<void>;
    }
  
    var ReactNativeFS: ReactNativeFS;
    var localStorage: LocalStorage;
  }
  
  // Export an empty object to make this a module
  export {};