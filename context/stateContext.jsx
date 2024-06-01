import { createContext, useState } from "react";

export const StateContext = createContext();

export const StateProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	return <StateContext.Provider value={{ isLoading, setIsLoading }}>{children}</StateContext.Provider>;
};
