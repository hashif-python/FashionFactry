import { createContext, useContext, useState } from "react";

const ApiLoaderContext = createContext({
    loading: false,
    start: () => { },
    stop: () => { },
});

export const ApiLoaderProvider = ({ children }: any) => {
    const [loading, setLoading] = useState(false);

    const start = () => setLoading(true);
    const stop = () => setLoading(false);

    return (
        <ApiLoaderContext.Provider value={{ loading, start, stop }}>
            {children}
        </ApiLoaderContext.Provider>
    );
};

export const useApiLoader = () => useContext(ApiLoaderContext);
